# 2. Architecture

## Django apps and their responsibilities

Conduit is a single Django project (`config`) composed of five apps, each
owning one bounded area of the domain:

| App | Owns | Depends on |
|---|---|---|
| `accounts` | Users, JWT login/signup, API keys, request logging/rate limiting | — (foundational) |
| `telemetry` | `WeatherStation`, `WeatherMeasurement`, read API (current/timeline/summary/history), aggregation logic | `accounts` (auth classes) |
| `ingestion` | Pulling data from the external 3D-FEWSNET API, `WeatherSyncLog`, admin sync endpoints, CLI backfill command | `telemetry` (writes measurements), `alerts` (triggers evaluation after each sync) |
| `alerts` | `Alert`, `WebhookSubscription`, `WebhookDelivery`, hydrology/livestock rule engines, webhook delivery + retries | `telemetry` (reads measurements), `accounts` (auth classes) |
| `blog` | `BlogPost`, public editorial API | `accounts` (author FK only) |

There is a deliberate one-way dependency chain for the telemetry pipeline:

```mermaid
graph LR
    ingestion["ingestion"] -->|writes WeatherMeasurement| telemetry["telemetry"]
    ingestion -->|triggers evaluation| alerts["alerts"]
    alerts -->|reads measurements to score conditions| telemetry
    accounts["accounts"] -.->|auth classes| telemetry
    accounts -.->|auth classes| alerts
    accounts -.->|author FK only| blog["blog"]

    style telemetry fill:#e8f4fd,stroke:#4a90d9
    style ingestion fill:#fdf0e6,stroke:#d98a4a
    style alerts fill:#fdece6,stroke:#d9604a
    style accounts fill:#eef7ec,stroke:#5aa06a
    style blog fill:#f3eefc,stroke:#8a5ad9
```

`telemetry` itself does not depend on `ingestion` or `alerts` — it only
exposes data. This keeps the read API (`telemetry`) free of side effects:
nothing happens when you `GET` weather data.

## Request flow: end-to-end data lifecycle

```mermaid
flowchart TD
    A["3D-FEWSNET API (external)"] -->|"polled every 15 min (GitHub Actions)<br/>or on-demand (admin / CLI)"| B["ingestion.services.client<br/>fetch_station_properties()"]
    B -->|"raw JSON → parsed records"| C["ingestion.services.ingest<br/>run_ingest() / run_latest_sync()"]
    C -->|"dedupes, bulk_creates<br/>WeatherMeasurement rows"| D["WeatherSyncLog<br/>(success / partial / failed)"]
    C -->|"on newly created rows only"| E["alerts.services.hydrology<br/>(runoff risk scoring)"]
    C -->|"on newly created rows only"| F["alerts.services.livestock<br/>(WBGT threshold crossing)"]
    E --> G["alerts.services.coalescence<br/>create_alert / resolve_active_alert"]
    F --> G
    G -->|"HMAC-signed POST"| H["alerts.services.webhooks<br/>notify_webhooks()"]
    H --> I(["External subscriber endpoint"])

    style A fill:#f3eefc,stroke:#8a5ad9
    style D fill:#f5f5f5,stroke:#999
    style G fill:#fdece6,stroke:#d9604a
    style I fill:#e8f4fd,stroke:#4a90d9
```

Meanwhile, independently of ingestion, the **read side** serves whatever
is currently in the database:

```mermaid
flowchart TD
    C(["Client<br/>(dashboard or external API consumer)"]) -->|"JWT or X-API-KEY"| T["telemetry views<br/>stations · current · timeline · summary · history"]
    C -->|"JWT or X-API-KEY"| Al["alerts views<br/>alert list/detail · webhook subscriptions"]
    C -->|"no auth required"| Bl["blog views<br/>public content"]
    T --> DB[("PostgreSQL / SQLite")]
    Al --> DB
    Bl --> DB

    style C fill:#e8f4fd,stroke:#4a90d9
    style DB fill:#eef7ec,stroke:#5aa06a
```

## Authentication architecture

Two authentication mechanisms coexist, and most "shared" read endpoints
accept either:

- **JWT** (`rest_framework_simplejwt`) — used by the logged-in dashboard
  ("Data Portal"). Configured as the project-wide default authentication
  class in `REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']`.
- **API Key** (`X-API-KEY` header) — used by external programmatic
  consumers. Every authenticated request is logged to `APIRequestLog` and
  checked against per-key rate limits (per-minute and daily).

A combined class, `JWTOrAPIKeyAuthentication`, tries JWT first (so a
logged-in dashboard session never counts against a rate limit or gets
logged as "API usage") and falls back to API-key authentication. It's used
by `telemetry` and `alerts` read endpoints. See
[04-authentication-and-authorization.md](./04-authentication-and-authorization.md)
for full detail, including the internal shared-secret endpoints used by
scheduled jobs.

## External integration points

| Integration | Direction | Mechanism |
|---|---|---|
| 3D-FEWSNET API | Inbound data source | HTTP GET with `email` + `api_key` query params (see [10-ingestion-pipeline.md](./10-ingestion-pipeline.md)) |
| GitHub Actions cron | Triggers ingestion | POST to `/api/v1/internal/sync/` with `X-SYNC-TOKEN` shared secret, every 15 minutes |
| Webhook subscribers | Outbound notifications | HMAC-SHA256-signed POST on `alert.created` / `alert.resolved` |

## Why one `Alert` model instead of two

Hydrology and livestock alerts share the same lifecycle (open → active →
resolved), the same list/detail API, the same admin UI, and the same
webhook delivery path. Rather than two near-identical tables, `alerts.Alert`
is a single model with an `alert_type` discriminator and type-specific
nullable fields (rainfall/pressure fields for hydrology, WBGT/threshold
fields for livestock). See [03-data-model.md](./03-data-model.md).

## Deployment shape

Conduit runs as a single Django/WSGI container (see
[14-deployment.md](./14-deployment.md)). There is no separate worker
process — ingestion and alert evaluation happen synchronously inside the
HTTP request that triggers a sync (either the GitHub Actions cron hitting
`/internal/sync/`, or an admin clicking "sync" in the dashboard).
