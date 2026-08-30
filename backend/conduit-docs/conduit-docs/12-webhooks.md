# 12. Webhooks

Conduit delivers alert lifecycle events to subscriber-owned URLs. Code
lives in `config/alerts/services/webhooks.py`; management endpoints are
documented in [08-api-alerts.md](./08-api-alerts.md#webhook-subscriptions).

## Events

| Event | Fired when |
|---|---|
| `alert.created` | `coalescence.create_alert()` opens a new alert |
| `alert.resolved` | `coalescence.resolve_active_alert()` closes an alert |
| `webhook.test` | manually via `POST /alerts/webhooks/<id>/test/` |

A `WebhookSubscription` can filter which events it receives
(`event_types`), and optionally narrow to one `alert_type` and/or one
`station`. See `WebhookSubscription.matches()` in
`alerts/models.py` for the exact matching logic.

## Delivery payload

```json
{
  "event": "alert.created",
  "alert": {
    "id": "a1b2...",
    "alert_type": "hydrology",
    "severity": "high",
    "message": "Runoff risk is high (62/100) at ...",
    "station": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
    "is_active": true,
    "runoff_risk_score": 62,
    "rainfall_summary": { "...": "..." },
    "pressure_trend": "falling",
    "recommendation": "Delay fertilizer application",
    "wbgt_value": null,
    "threshold": null,
    "created_at": "2026-08-11T08:10:00Z",
    "resolved_at": null
  }
}
```

Livestock alerts populate `wbgt_value`/`threshold` and leave the
hydrology-specific fields `null`, and vice versa.

`webhook.test` uses a different, minimal payload (not a real alert):
```json
{
  "event": "webhook.test",
  "subscription_id": "e5f6...",
  "sent_at": "2026-08-11T10:00:00Z"
}
```

## Request signature

Every delivery includes:

```http
Content-Type: application/json
X-Conduit-Event: alert.created
X-Conduit-Signature: sha256=<hex-digest>
```

The signature is an HMAC-SHA256 of the exact request body bytes, keyed
with the subscription's `secret`:

```python
hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()
```

To verify on your end: recompute the HMAC over the raw request body using
the `secret` you were given at subscription creation, and compare against
the `X-Conduit-Signature` header (constant-time comparison recommended).

## Delivery behavior

- **Inline, best-effort, single-attempt at trigger time.** Delivery is
  called synchronously from `coalescence.create_alert()` /
  `resolve_active_alert()`, right after the alert row is written — there
  is no background task queue. A short timeout
  (`settings.WEBHOOK_DELIVERY_TIMEOUT_SECONDS`, default 5s) and
  never-raises error handling ensure a slow or dead subscriber can't stall
  the ingestion pipeline that triggered it.
- **Every attempt is logged** as a `WebhookDelivery` row — success or
  failure — forming both an audit trail and (for failures) a retry queue.
- **Fan-out** — `notify_webhooks(alert, event_type)` iterates every
  `is_active` subscription and delivers to each one whose `matches()`
  check passes. One subscriber's failure (network error, non-2xx
  response, or any unexpected exception) is caught and logged; it never
  prevents delivery to the others.

## Retries

Failed deliveries are **not** retried automatically or in real time. A
separate process re-attempts them:

`retry_failed_deliveries(limit=200)`:
- Selects `WebhookDelivery` rows where `success=False` and
  `attempt_count < settings.WEBHOOK_MAX_DELIVERY_ATTEMPTS` (default 5),
  oldest first, up to `limit`.
- Skips any subscription that's since been deactivated.
- Each retry creates a **new** `WebhookDelivery` row (with
  `attempt_count` incremented) rather than mutating the failed one —
  preserving the complete attempt history for a given event.

This is exposed at `POST /api/v1/alerts/internal/retry-webhooks/`,
authenticated the same way as ingestion's internal sync (shared secret,
see [04-authentication-and-authorization.md](./04-authentication-and-authorization.md)),
intended to be called on a recurring schedule alongside — but
independently of — the ingestion cron.

## Security notes for subscribers

- Always verify `X-Conduit-Signature` before trusting a payload.
- The `secret` is shown exactly once, in the `201` response when the
  subscription is created — it is never returned again by any `GET`
  endpoint. If lost, delete and recreate the subscription.
- `webhook.test` pings are useful for validating your signature-checking
  code without waiting for a real weather event.
