# 1. Overview

## What is Conduit Core Domain?

Conduit Core Domain is the backend service for **Conduit**, a platform that
ingests, processes, and serves weather telemetry from a physical weather
station network hosted on the **3D-FEWSNET** platform (an IoT weather
sensor API run by UCAR/ICDP). It turns raw sensor readings into:

- A queryable, paginated history of weather measurements per station.
- Aggregated timelines (minutely/hourly/daily) and daily summaries.
- Automatically generated **alerts** for two agricultural use cases:
  flood/runoff risk (hydrology) and livestock heat stress.
- Outbound **webhooks** so external systems can react to alerts in
  real time.
- A small public **blog** for editorial/marketing content.

It is consumed by a frontend "Data Portal" / dashboard (not part of this
repository) and by external API consumers who authenticate with an API key.

## Who it's for

- **Farmers / agronomists** — via the hydrology alerts (safe-to-fertilize
  guidance) and the public weather API.
- **Livestock operators** — via heat-stress (WBGT) alerts.
- **Third-party integrators** — via API keys and webhook subscriptions,
  to pull weather data or react to alerts programmatically.
- **Internal admins** — via JWT-authenticated dashboard endpoints for
  triggering backfills, viewing ingestion health, and managing content.

## Core features

- REST API built with Django REST Framework (DRF).
- Dual authentication: JWT (browser/dashboard sessions) and API keys
  (external programmatic access), unified via a single authentication
  class for shared read endpoints.
- Per-key rate limiting (requests/minute and daily quota).
- Scheduled ingestion from 3D-FEWSNET every 15 minutes via GitHub Actions,
  plus a manual/admin backfill path.
- Configurable weather aggregation at minutely, hourly, or daily
  resolution.
- Daily weather summaries with date-range filtering.
- Paginated historical weather archive.
- Rule-based alerting (no ML) for runoff risk and livestock thermal
  comfort, with alert coalescence (no duplicate alerts while a condition
  persists).
- HMAC-signed webhook delivery with an audit trail and retry mechanism.
- Dockerized development and production environment.
- SQLite for local development, PostgreSQL in production.

## Tech stack

| Layer | Technology |
|---|---|
| Language / runtime | Python 3.12 |
| Web framework | Django 6.0 |
| API framework | Django REST Framework |
| Auth | `djangorestframework-simplejwt` (JWT) + custom API-key authentication |
| Database | SQLite (dev), PostgreSQL (prod, via `dj_database_url`) |
| CORS | `django-cors-headers` |
| Static files | WhiteNoise |
| HTTP client (outbound) | `requests` (3D-FEWSNET calls, webhook delivery) |
| Containerization | Docker & Docker Compose |
| Scheduled jobs | GitHub Actions cron (`*/15 * * * *`) hitting an internal sync endpoint |

## Repository layout at a glance

```text
conduit-core-domain/
├── config/                # Django project root ("config" is both the
│   ├── accounts/          #  project name and an app — see 02-architecture.md)
│   ├── alerts/
│   ├── blog/
│   ├── ingestion/
│   ├── telemetry/
│   ├── config/             # settings.py, urls.py, wsgi/asgi
│   └── manage.py
├── docs/                   # ← you are here
├── .github/workflows/      # sync-weather.yml (15-minute ingestion cron)
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh
└── requirements.txt
```

Continue to [02-architecture.md](./02-architecture.md) for how these pieces
fit together.
