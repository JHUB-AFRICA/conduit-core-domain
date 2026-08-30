# 8. API Reference — Alerts

Base path: `/api/v1/`

Read access to system-generated alerts, plus full CRUD for webhook
subscriptions that get notified when alerts fire. For how alerts are
computed, see [11-alerts-engine.md](./11-alerts-engine.md). For webhook
delivery mechanics, see [12-webhooks.md](./12-webhooks.md).

---

## `GET /api/v1/alerts/`

List alerts, paginated (`HistoryPagination`, same as telemetry history:
default page size 100, max 1000).

**Auth:** JWT or API key, `IsAuthenticated`

**Query parameters**

| Param | Description |
|---|---|
| `type` | `hydrology` \| `livestock` |
| `station` | station slug |
| `active` | `true` \| `false` |

**Response `200`**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "a1b2...",
      "station_name": "Site JKUAT",
      "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
      "alert_type": "hydrology",
      "severity": "high",
      "message": "Runoff risk is high (62/100) at Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1: 24.5mm rainfall in the last 6h, pressure falling.",
      "is_active": true,
      "resolved_at": null,
      "runoff_risk_score": 62,
      "rainfall_summary": {
        "rain_gauge_a_mm": 24.5, "rain_gauge_b_mm": 22.1,
        "effective_rainfall_mm": 24.5, "window_hours": 6
      },
      "pressure_trend": "falling",
      "recommendation": "Delay fertilizer application",
      "wbgt_value": null,
      "threshold": null,
      "created_at": "2026-08-11T08:10:00Z",
      "updated_at": "2026-08-11T08:10:00Z"
    }
  ]
}
```

## `GET /api/v1/alerts/<uuid>/`

Retrieve a single alert. Same shape as one item above.

**Auth:** JWT or API key, `IsAuthenticated`

---

## Webhook subscriptions

All webhook-subscription endpoints below are **owner-scoped**: a user can
only see/modify/delete their own subscriptions, and JWT-only (no API-key
access) since this is treated as an account/dashboard action, matching the
`accounts.api-keys` endpoints.

### `GET /api/v1/alerts/webhooks/`

List the authenticated user's subscriptions. `secret` is always `null` in
list responses — it's only ever returned once, at creation.

**Auth:** JWT, `IsAuthenticated`

**Response `200`**
```json
[
  {
    "id": "e5f6...",
    "url": "https://example.com/hooks/conduit",
    "secret": null,
    "event_types": ["alert.created", "alert.resolved"],
    "alert_type": null,
    "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
    "is_active": true,
    "created_at": "2026-08-01T12:00:00Z"
  }
]
```

### `POST /api/v1/alerts/webhooks/`

Create a subscription. `secret` is generated server-side.

**Auth:** JWT, `IsAuthenticated`

**Body**
```json
{
  "url": "https://example.com/hooks/conduit",
  "event_types": ["alert.created"],
  "alert_type": "livestock",
  "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1"
}
```
All filter fields (`event_types`, `alert_type`, `station_slug`) are
optional. If `event_types` is omitted, both `alert.created` and
`alert.resolved` are subscribed by default. `event_types` must be a
subset of `["alert.created", "alert.resolved"]` — otherwise `400`.

**Response `201`** — full object **including** the plaintext `secret`
(the only time it's ever returned). Store it immediately; use it to
verify the `X-Conduit-Signature` header on incoming deliveries (see
[12-webhooks.md](./12-webhooks.md)).

### `GET /api/v1/alerts/webhooks/<uuid>/`

Retrieve one subscription (owner only; `secret` is `null`).

**Auth:** JWT, `IsAuthenticated`
**Response `404`** if not found or not owned by the requester.

### `DELETE /api/v1/alerts/webhooks/<uuid>/`

Delete a subscription (owner only).

**Auth:** JWT, `IsAuthenticated`
**Response:** `204 No Content`

### `POST /api/v1/alerts/webhooks/<uuid>/test/`

Send a synthetic `webhook.test` event to verify the endpoint and signature
verification work, without waiting for a real alert.

**Auth:** JWT, `IsAuthenticated`

**Response `200`** (delivered) or `502` (subscriber unreachable/errored)
```json
{ "success": true, "status_code": 200 }
```

### `GET /api/v1/alerts/webhooks/<uuid>/deliveries/`

Paginated delivery history for one subscription (owner only).

**Auth:** JWT, `IsAuthenticated`

**Response `200`**
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "9a8b...",
      "event_type": "alert.created",
      "success": true,
      "response_status": 200,
      "error_message": "",
      "attempt_count": 1,
      "created_at": "2026-08-11T08:10:01Z",
      "delivered_at": "2026-08-11T08:10:01Z"
    }
  ]
}
```

---

## `POST /api/v1/alerts/internal/retry-webhooks/`

Machine-to-machine endpoint that re-attempts recently failed deliveries
(same shared-secret pattern as ingestion's internal sync). Intended to be
called on a schedule.

**Auth:** shared secret (`X-SYNC-TOKEN`)

**Response `200`**
```json
{ "retried": 4, "succeeded": 3 }
```
