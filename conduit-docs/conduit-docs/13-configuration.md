# 13. Configuration

All configuration is environment-variable driven, loaded from
`config/.env` via `python-dotenv` (see `config/config/settings.py`).
Create this file before running locally or in Docker:

```text
config/
└── .env
```

## Core Django settings

| Variable | Default | Purpose |
|---|---|---|
| `SECRET_KEY` | `django-insecure-dev-key` | Django cryptographic signing key. **Must** be set to a real secret in production. |
| `DEBUG` | `False` | Django debug mode. Set `True` locally only. |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,.onrender.com` | Comma-separated host allowlist. |
| `DATABASE_URL` | none (falls back to SQLite via `dj_database_url` defaults) | Full database connection string. Postgres in production. |

## 3D-FEWSNET ingestion source

| Variable | Default | Purpose |
|---|---|---|
| `FEWSNET_API_BASE_URL` | `https://3d-fewsnet.icdp.ucar.edu/api/v1/data` | Base URL of the external sensor API. |
| `FEWSNET_EMAIL` | none (required for ingestion) | Account email for API auth. |
| `FEWSNET_API_KEY` | none (required for ingestion) | API key for API auth. |
| `FEWSNET_SENSOR_ID` | `61` | Instrument ID to pull data for. |

Without `FEWSNET_EMAIL`/`FEWSNET_API_KEY` set, any ingestion attempt
raises `FewsnetError` immediately — the read API and everything else still
works, just with no new data arriving.

## Internal / scheduled-job auth

| Variable | Default | Purpose |
|---|---|---|
| `SYNC_SECRET_TOKEN` | none | Shared secret required in `X-SYNC-TOKEN` for `/internal/sync/` and `/alerts/internal/retry-webhooks/`. If unset, those endpoints return `503`. |

## Alerts engine tuning

| Variable | Default | Purpose |
|---|---|---|
| `ALERTS_LIVESTOCK_WBGT_THRESHOLD` | `22.0` | °C — WBGT value at/above which a livestock heat-stress alert opens. |
| `ALERTS_HYDROLOGY_LOOKBACK_HOURS` | `6` | Hours of recent measurements the hydrology engine considers per evaluation. |
| `ALERTS_HYDROLOGY_ALERT_THRESHOLD` | `50` | Runoff risk score (0–100) at/above which a hydrology alert opens. |

See [11-alerts-engine.md](./11-alerts-engine.md) for exactly how these are
used in scoring.

## Webhooks

| Variable | Default | Purpose |
|---|---|---|
| `WEBHOOK_DELIVERY_TIMEOUT_SECONDS` | `5` | HTTP timeout per delivery attempt to a subscriber URL. |
| `WEBHOOK_MAX_DELIVERY_ATTEMPTS` | `5` | Cap on total attempts (including the initial one) before `retry_failed_deliveries()` stops retrying a delivery. |

## JWT

Configured directly in `settings.py` (`SIMPLE_JWT`), not via environment
variables:

| Setting | Value |
|---|---|
| `ACCESS_TOKEN_LIFETIME` | 30 minutes |
| `REFRESH_TOKEN_LIFETIME` | 7 days |

## CORS

`CORS_ALLOW_ALL_ORIGINS = True` and `x-api-key` is explicitly added to the
allowed headers list (`CORS_ALLOW_HEADERS`) alongside DRF's defaults —
required so browser-based clients can send the `X-API-KEY` header
cross-origin.

## Production-only hardening

When `DEBUG=False`, `settings.py` additionally enables:

- `SECURE_PROXY_SSL_HEADER` (trusts `X-Forwarded-Proto`, for platforms
  like Render that terminate TLS upstream)
- `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`
- `SECURE_BROWSER_XSS_FILTER`, `SECURE_CONTENT_TYPE_NOSNIFF`
- `SECURE_SSL_REDIRECT`
- HSTS: `SECURE_HSTS_SECONDS=3600`, includes subdomains, preload enabled

`CSRF_TRUSTED_ORIGINS` is hardcoded to `https://*.onrender.com` — update
this if deploying to a different domain.

## Example `.env`

```env
SECRET_KEY=change-me-to-something-random
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# 3D-FEWSNET
FEWSNET_API_BASE_URL=https://3d-fewsnet.icdp.ucar.edu/api/v1/data
FEWSNET_EMAIL=your-email@example.com
FEWSNET_API_KEY=your-api-key
FEWSNET_SENSOR_ID=61

# Scheduled jobs
SYNC_SECRET_TOKEN=a-long-random-shared-secret

# Alerts tuning (optional — sensible defaults apply)
ALERTS_LIVESTOCK_WBGT_THRESHOLD=22.0
ALERTS_HYDROLOGY_LOOKBACK_HOURS=6
ALERTS_HYDROLOGY_ALERT_THRESHOLD=50

# Webhooks (optional)
WEBHOOK_DELIVERY_TIMEOUT_SECONDS=5
WEBHOOK_MAX_DELIVERY_ATTEMPTS=5

# Production database (optional in dev — falls back to SQLite)
DATABASE_URL=postgres://user:password@host:5432/dbname
```
