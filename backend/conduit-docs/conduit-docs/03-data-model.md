# 3. Data Model

All models use a `UUIDField` primary key (`default=uuid.uuid4`), except
where noted. This document lists every model, grouped by app, with fields
and relationships.

## accounts

### `User`
Custom user model (`AUTH_USER_MODEL = "accounts.User"`). Extends
`AbstractBaseUser` + `PermissionsMixin`.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `email` | EmailField, unique | `USERNAME_FIELD` |
| `username` | CharField(150), unique | required field |
| `is_active` | Boolean | default `True` |
| `is_staff` | Boolean | default `False`; gates admin-only endpoints |
| `date_joined` | DateTime | auto |

### `APIKey`
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `user` | FK → `User` | `related_name="api_keys"` |
| `name` | CharField(100) | default `"default"` |
| `key` | CharField(64), unique | auto-generated via `secrets.token_hex(32)` on save if empty |
| `is_active` | Boolean | default `True` |
| `requests_per_minute` | Integer | default `60` |
| `daily_quota` | Integer | default `10000` |
| `created_at` | DateTime | auto |

### `APIRequestLog`
One row per authenticated API-key request. Used to compute rate limits.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `api_key` | FK → `APIKey` | |
| `endpoint` | CharField(255) | `request.path` |
| `created_at` | DateTime | auto |

## telemetry

### `WeatherStation`
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `instrument_name` | CharField(255) | e.g. "Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1" |
| `sensor_id` | Integer, unique | maps to the 3D-FEWSNET instrument ID |
| `site_name` | CharField(255) | |
| `latitude` / `longitude` | Decimal(9,6) | |
| `elevation_m` | Decimal(7,2) | |
| `status` | choice: `active` / `inactive` / `maintenance` / `decommissioned` | default `active` |
| `slug` | SlugField, unique | auto-derived from `instrument_name` if blank |
| `created_at` / `updated_at` | DateTime | |

### `WeatherMeasurement`
One row per timestamped sensor reading for a station.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `station` | FK → `WeatherStation` | `related_name="measurements"` |
| `time` | DateTime | the reading's timestamp (from 3D-FEWSNET, not ingestion time) |
| `is_test` | Boolean | mirrors 3D-FEWSNET's `"test"` flag |
| `health` | Integer, nullable | device health score |
| `battery_voltage` | Float, nullable | |
| `battery_charge_status` | Integer, nullable | |
| `cell_signal_strength` | Float, nullable | |
| `rain_gauge_1`, `rain_gauge_2` | Float, nullable | current rainfall reading, two redundant gauges |
| `rain_gauge_{1,2}_total_today` | Float, nullable | |
| `rain_gauge_{1,2}_total_prior` | Float, nullable | prior day's total |
| `bmx_temperature`, `mcp_temperature`, `sht_temperature` | Float, nullable | three independent temperature sensors |
| `sht_humidity` | Float, nullable | |
| `bmx_pressure` | Float, nullable | barometric pressure |
| `visible_light`, `infrared`, `ultraviolet` | Float, nullable | |
| `wind_speed`, `wind_direction`, `wind_gust`, `wind_gust_direction` | Float, nullable | |
| `heat_index`, `wet_bulb_temperature`, `wbgt` | Float, nullable | derived comfort/heat indices, computed upstream by 3D-FEWSNET |
| `created_at` | DateTime | auto (ingestion time, not reading time) |

Constraints: unique together on `(station, time)`; indexed on
`(station, time)`; default ordering `-time`.

## ingestion

### `WeatherSyncLog`
Audit record of every ingestion run (scheduled, admin-triggered, or CLI).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `station` | FK → `telemetry.WeatherStation`, nullable | null if the run never resolved a station (e.g. total failure) |
| `requested_start` / `requested_end` | Date | the window that was asked for |
| `status` | choice: `success` / `partial` / `failed` | |
| `records_fetched` | Integer | rows returned by the external API |
| `records_created` | Integer | rows actually inserted (post-dedup) |
| `records_skipped` | Integer | duplicates skipped |
| `error_message` | Text | concatenated per-chunk errors |
| `triggered_by` | CharField(255) | e.g. an admin email, `"cli"`, or `"github-actions"` |
| `created_at` | DateTime | auto |

## alerts

### `Alert`
Single table for both alert types (see
[02-architecture.md](./02-architecture.md) for the reasoning).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `station` | FK → `telemetry.WeatherStation` | `related_name="alerts"` |
| `alert_type` | choice: `hydrology` / `livestock` | |
| `severity` | choice: `low` / `moderate` / `high` / `extreme` | |
| `message` | Text | human-readable summary |
| `is_active` | Boolean | default `True`; `False` once resolved |
| `resolved_at` | DateTime, nullable | |
| `runoff_risk_score` | Float, nullable | **hydrology only**, 0–100 |
| `rainfall_summary` | JSON, nullable | **hydrology only** — gauge totals + window |
| `pressure_trend` | choice: `rising` / `falling` / `steady`, nullable | **hydrology only** |
| `recommendation` | CharField(255) | **hydrology only** — e.g. "Delay fertilizer application" |
| `wbgt_value` | Float, nullable | **livestock only** |
| `threshold` | Float, nullable | **livestock only** — threshold that was crossed |
| `triggering_measurement` | FK → `telemetry.WeatherMeasurement`, `SET_NULL`, nullable | **livestock only** |
| `created_at` / `updated_at` | DateTime | |

Indexed on `(station, alert_type, is_active)` — this is the exact lookup
used to find "the currently open alert for this station+type".

### `WebhookSubscription`
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `user` | FK → `User` | `related_name="webhook_subscriptions"` |
| `url` | URLField(500) | delivery target |
| `secret` | CharField(64) | auto-generated (`secrets.token_hex(32)`); used to HMAC-sign payloads; shown only once, at creation |
| `event_types` | JSON list | subset of `alert.created` / `alert.resolved`; defaults to both |
| `alert_type` | choice, nullable | optional filter to one alert type |
| `station` | FK → `WeatherStation`, nullable | optional filter to one station |
| `is_active` | Boolean | default `True` |
| `created_at` | DateTime | |

### `WebhookDelivery`
One row per delivery attempt (including retries — each retry is a new
row, preserving full history).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `subscription` | FK → `WebhookSubscription` | `related_name="deliveries"` |
| `alert` | FK → `Alert` | `related_name="webhook_deliveries"` |
| `event_type` | choice: `alert.created` / `alert.resolved` | |
| `payload` | JSON | the exact body sent |
| `success` | Boolean | default `False` |
| `response_status` | Integer, nullable | subscriber's HTTP status |
| `error_message` | Text | |
| `attempt_count` | PositiveInteger | default `1` |
| `created_at` / `delivered_at` | DateTime | `delivered_at` set only on success |

Indexed on `(success, attempt_count)` — used by the retry job to find
undelivered rows under the max-attempt cap.

## blog

### `BlogPost`
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `title` | CharField(200) | |
| `slug` | SlugField(220), unique | auto-derived from title, de-duplicated with a numeric suffix if needed |
| `excerpt` | CharField(300) | hand-written teaser for listing cards |
| `content` | Text | plain text; blank-line-separated paragraphs; `## ` prefix renders as a subheading on the frontend |
| `cover_image_url` | URLField(500) | |
| `author` | FK → `User`, `SET_NULL`, nullable | `related_name="blog_posts"` |
| `tags` | JSON list | |
| `status` | choice: `draft` / `published` | default `draft` |
| `published_at` | DateTime, nullable | set automatically the first time status becomes `published`; stays fixed across unpublish/republish |
| `created_at` / `updated_at` | DateTime | |

Computed property: `reading_time_minutes` — `ceil(word_count / 200)`,
minimum 1.

## Entity relationship summary

```
User ──< APIKey ──< APIRequestLog
User ──< WebhookSubscription ──< WebhookDelivery >── Alert
User ──< BlogPost

WeatherStation ──< WeatherMeasurement
WeatherStation ──< WeatherSyncLog
WeatherStation ──< Alert
WeatherStation ──< WebhookSubscription (optional filter)

WeatherMeasurement ──(triggering_measurement, optional)── Alert
```
