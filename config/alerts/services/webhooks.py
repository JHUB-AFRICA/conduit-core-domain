"""
Delivers alert.created / alert.resolved events to subscriber URLs.

Called inline from alerts/services/coalescence.py right after an alert is
created or resolved. Delivery is best-effort and single-attempt in that
path (short timeout, never raises) so a slow or dead subscriber URL can't
stall the ingestion pipeline that triggered it. Failed deliveries are
logged to WebhookDelivery and picked up later by retry_failed_deliveries(),
which the internal retry endpoint / cron calls on a schedule.
"""

import hashlib
import hmac
import json
import logging

import requests
from django.conf import settings
from django.utils import timezone

from alerts.models import WebhookDelivery, WebhookSubscription

logger = logging.getLogger(__name__)


def _sign(secret, body_bytes):
    digest = hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def _build_payload(alert, event_type):
    return {
        "event": event_type,
        "alert": {
            "id": str(alert.id),
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "message": alert.message,
            "station": alert.station.slug,
            "is_active": alert.is_active,
            "runoff_risk_score": alert.runoff_risk_score,
            "rainfall_summary": alert.rainfall_summary,
            "pressure_trend": alert.pressure_trend,
            "recommendation": alert.recommendation or None,
            "wbgt_value": alert.wbgt_value,
            "threshold": alert.threshold,
            "created_at": alert.created_at.isoformat(),
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
        },
    }


def _send(subscription, alert, event_type, payload, attempt_count):
    """One HTTP attempt. Always returns a WebhookDelivery — never raises."""
    body = json.dumps(payload).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Conduit-Event": event_type,
        "X-Conduit-Signature": _sign(subscription.secret, body),
    }

    delivery = WebhookDelivery(
        subscription=subscription,
        alert=alert,
        event_type=event_type,
        payload=payload,
        attempt_count=attempt_count,
    )

    try:
        response = requests.post(
            subscription.url,
            data=body,
            headers=headers,
            timeout=settings.WEBHOOK_DELIVERY_TIMEOUT_SECONDS,
        )
        delivery.response_status = response.status_code
        delivery.success = 200 <= response.status_code < 300
        if not delivery.success:
            delivery.error_message = f"Subscriber returned HTTP {response.status_code}"
    except requests.RequestException as exc:
        delivery.success = False
        delivery.error_message = str(exc)

    if delivery.success:
        delivery.delivered_at = timezone.now()

    delivery.save()
    return delivery


def send_test_ping(subscription):
    """
    Sends a synthetic "webhook.test" event so a subscriber can verify their
    endpoint and signature verification work before relying on it. Not a
    real Alert, so it's built and sent directly rather than through
    _build_payload()/notify_webhooks().
    """
    payload = {
        "event": "webhook.test",
        "subscription_id": str(subscription.id),
        "sent_at": timezone.now().isoformat(),
    }
    body = json.dumps(payload).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Conduit-Event": "webhook.test",
        "X-Conduit-Signature": _sign(subscription.secret, body),
    }
    try:
        response = requests.post(
            subscription.url, data=body, headers=headers, timeout=settings.WEBHOOK_DELIVERY_TIMEOUT_SECONDS
        )
        return {"success": 200 <= response.status_code < 300, "status_code": response.status_code}
    except requests.RequestException as exc:
        return {"success": False, "error": str(exc)}


def notify_webhooks(alert, event_type):
    """
    Fan out one alert event to every matching, active subscription. Never
    raises — a subscriber being unreachable is expected and shouldn't
    affect the alert that triggered it.
    """
    payload = _build_payload(alert, event_type)

    subscriptions = WebhookSubscription.objects.filter(is_active=True).select_related("station")
    for subscription in subscriptions:
        if not subscription.matches(alert, event_type):
            continue
        try:
            _send(subscription, alert, event_type, payload, attempt_count=1)
        except Exception:
            # _send() already catches request errors — this is a last
            # resort against anything else (e.g. a DB error saving the
            # delivery row) so one bad subscription can't block the rest.
            logger.exception("Unexpected error delivering webhook to %s", subscription.url)


def retry_failed_deliveries(limit=200):
    """
    Re-attempt deliveries that failed and haven't hit the attempt cap.
    Called by the internal retry endpoint (see alerts/views.py) on the
    same kind of schedule as the ingestion sync. Each retry is a fresh
    WebhookDelivery row rather than mutating the failed one, keeping the
    full attempt history.
    """
    failed = (
        WebhookDelivery.objects.filter(
            success=False, attempt_count__lt=settings.WEBHOOK_MAX_DELIVERY_ATTEMPTS
        )
        .select_related("subscription", "alert")
        .order_by("created_at")[:limit]
    )

    retried, succeeded = 0, 0
    for delivery in failed:
        if not delivery.subscription.is_active:
            continue
        result = _send(
            delivery.subscription,
            delivery.alert,
            delivery.event_type,
            delivery.payload,
            attempt_count=delivery.attempt_count + 1,
        )
        retried += 1
        if result.success:
            succeeded += 1

    return {"retried": retried, "succeeded": succeeded}
