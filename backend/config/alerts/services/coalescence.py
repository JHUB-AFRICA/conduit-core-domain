from django.utils import timezone

from alerts.models import Alert, WebhookEvent
from alerts.services.webhooks import notify_webhooks


def get_active_alert(station, alert_type):
    """The current open alert for this (station, alert_type), if any."""
    return Alert.objects.filter(station=station, alert_type=alert_type, is_active=True).first()


def create_alert(**fields):
    """
    Create an alert and notify any matching webhook subscriptions. Both
    services (hydrology, livestock) go through this rather than calling
    Alert.objects.create() directly, so there's exactly one place that can
    forget to fire the webhook.
    """
    alert = Alert.objects.create(**fields)
    notify_webhooks(alert, WebhookEvent.ALERT_CREATED)
    return alert


def resolve_active_alert(station, alert_type):
    """
    Close out the open alert for this (station, alert_type), if any, so the
    next crossing can open a fresh one. Returns the resolved Alert, or None
    if there wasn't one active.
    """
    alert = get_active_alert(station, alert_type)
    if alert is None:
        return None

    alert.is_active = False
    alert.resolved_at = timezone.now()
    alert.save(update_fields=["is_active", "resolved_at"])
    notify_webhooks(alert, WebhookEvent.ALERT_RESOLVED)
    return alert
