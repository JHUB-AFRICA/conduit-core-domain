# 15. Glossary

| Term | Meaning |
|---|---|
| **3D-FEWSNET / CHORDS** | The external weather-sensor platform (run by UCAR/ICDP) that Conduit pulls raw telemetry from. Conduit is a downstream consumer, not the source of truth for raw readings. |
| **Alert** | A system-generated notice that a monitored condition (runoff risk or livestock heat stress) has crossed a threshold. See `alerts.Alert` in [03-data-model.md](./03-data-model.md). |
| **Alert coalescence** | The rule that only one *active* alert may exist per `(station, alert_type)` at a time — a persisting bad condition doesn't spawn duplicate alerts. See [11-alerts-engine.md](./11-alerts-engine.md#shared-lifecycle-coalescence). |
| **API key** | A per-user credential (`accounts.APIKey`) sent as `X-API-KEY`, used by external programmatic consumers instead of JWT. Rate-limited and quota-limited. |
| **Backfill** | Ingesting a historical range of past readings (as opposed to "live sync", which only fetches what's new). |
| **BMX / MCP / SHT** | Sensor chip families providing redundant temperature (and other) readings — `bmx_temperature`, `mcp_temperature`, `sht_temperature` are three independent sensors on the same station. |
| **Coalescence** | See *Alert coalescence*. |
| **Conduit** | The overall platform this backend serves; "Conduit Core Domain" is this specific backend repository. |
| **Hydrology alert** | An `alert_type=hydrology` alert — flags elevated runoff/flood risk based on recent rainfall and pressure trend. Comes with a fertilizer-application recommendation. |
| **HMAC signature** | The `X-Conduit-Signature` header on webhook deliveries — an HMAC-SHA256 of the request body, keyed by the subscription's secret, letting the receiver verify authenticity. |
| **Ingestion** | The process (and Django app) of pulling data from 3D-FEWSNET and writing it into `WeatherMeasurement` rows. |
| **Internal endpoint** | An endpoint meant only for scheduled/machine callers, authenticated by a shared secret (`X-SYNC-TOKEN`) rather than JWT or API key — e.g. `/internal/sync/`. |
| **JWT** | JSON Web Token — the access/refresh token pair issued at login, used by the dashboard/frontend. |
| **Live sync** | An ingestion run that fetches only readings newer than what's already stored, used by the 15-minute cron and the "sync now" admin action. Contrast with *backfill*. |
| **Livestock alert** | An `alert_type=livestock` alert — flags WBGT (heat stress) exceeding a configured threshold for a station. |
| **Rate limit** | Per-API-key request throttling: requests/minute and a daily quota, enforced in `APIKeyAuthentication`. |
| **Resolution** | The aggregation granularity for a timeline request: `minutely`, `hourly`, or `daily`. |
| **Runoff risk score** | A 0–100 score computed by the hydrology engine from rainfall + pressure trend; drives alert severity and the fertilizer recommendation. |
| **Sensor ID** | The 3D-FEWSNET instrument identifier (`FEWSNET_SENSOR_ID` / `WeatherStation.sensor_id`) used to request data for a specific physical station. |
| **Station** | `telemetry.WeatherStation` — a physical weather station/instrument, identified by a unique `sensor_id` and a human-friendly `slug`. |
| **Sync log** | `ingestion.WeatherSyncLog` — an audit record of one ingestion run (success/partial/failed, counts, errors, who triggered it). |
| **WBGT** | Wet Bulb Globe Temperature — a heat-stress index combining temperature, humidity, and other factors, computed upstream by 3D-FEWSNET and stored as-is on each `WeatherMeasurement`. Drives livestock alerts. |
| **Webhook delivery** | One HTTP POST attempt (successful or failed) to a subscriber URL, logged as `alerts.WebhookDelivery`. |
| **Webhook subscription** | A subscriber's registered URL + filters (`alerts.WebhookSubscription`) that receives `alert.created`/`alert.resolved` notifications. |
