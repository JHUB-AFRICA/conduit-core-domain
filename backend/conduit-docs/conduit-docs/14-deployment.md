# 14. Deployment & Running Locally

## Prerequisites

- Git
- Docker Desktop (recommended path)
- Python 3.12+ (for running outside Docker)

## Option A: Docker (recommended)

```bash
git clone https://github.com/JHUB-AFRICA/conduit-core-domain.git
cd conduit-core-domain
# create config/.env — see 13-configuration.md
docker compose build
docker compose up
```

The API is then available at `http://localhost:8000/`.

### What's inside the container

**`Dockerfile`**
- Base image: `python:3.12-slim`.
- Installs `gcc` and `libpq-dev` (build deps for `psycopg`/Postgres
  client libraries).
- Runs as a non-root user (`appuser`), created and given ownership of
  `/app`.
- Installs Python deps from `requirements.txt`.
- Working directory ends at `/app/config` (the actual Django project
  root — see note on `config`/`config` naming in
  [02-architecture.md](./02-architecture.md)).
- Exposes port `8000`.
- Entrypoint: `entrypoint.sh`.

**`docker-compose.yml`**
- Single `web` service, built from the local `Dockerfile`.
- Loads env vars from `./config/.env`.
- Maps `8000:8000`.
- Mounts the repo root into `/app` (so local edits are reflected without
  a rebuild in dev).
- `restart: unless-stopped`.

## Option B: Local development (no Docker)

```bash
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

cd config
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/ and IsAdminUser endpoints
python manage.py runserver
```

Uses SQLite by default (no `DATABASE_URL` needed) — suitable for local
development and running the test suite.

## Seed / backfill data after first setup

The database starts empty — no stations or measurements exist until
ingestion runs at least once. Either:

- Trigger a manual backfill via the admin API
  (`POST /api/v1/ingest/`, requires an `is_staff` user — see
  [07-api-ingestion.md](./07-api-ingestion.md)), or
- Run the CLI command directly:

  ```bash
  python manage.py backfill_weather --start 2026-06-01
  ```

Both require valid `FEWSNET_EMAIL`/`FEWSNET_API_KEY` credentials in
`.env`.

## Scheduled ingestion: GitHub Actions cron

`.github/workflows/sync-weather.yml` runs every 15 minutes
(`cron: "*/15 * * * *"`, best-effort — GitHub's scheduler can run a few
minutes late under load, but never more often than configured) and calls:

```bash
curl -X POST "${SYNC_URL}" \
  -H "X-SYNC-TOKEN: ${SYNC_SECRET_TOKEN}" \
  -H "Content-Type: application/json"
```

- `SYNC_URL` and `SYNC_SECRET_TOKEN` are GitHub Actions **repository
  secrets** — `SYNC_URL` should point at your deployed instance's
  `/api/v1/internal/sync/` endpoint, and `SYNC_SECRET_TOKEN` must match
  the value configured in the server's `.env`
  (see [13-configuration.md](./13-configuration.md)).
- The workflow can also be triggered manually from the Actions tab
  (`workflow_dispatch`).
- A non-2xx response fails the job (`exit 1`), so failed syncs are
  visible in the repository's Actions history — separate from the
  `WeatherSyncLog` audit trail inside the app itself.

Webhook retries (`POST /api/v1/alerts/internal/retry-webhooks/`) use the
identical shared-secret pattern but are **not** included in this
workflow file — if you want scheduled retries, add an equivalent job or
schedule calling that endpoint.

## Static files

Served via WhiteNoise (`whitenoise.middleware.WhiteNoiseMiddleware`),
compressed and manifest-hashed (`CompressedManifestStaticFilesStorage`).
No separate CDN/static host is required for a typical deployment. Run
`python manage.py collectstatic` as part of your deploy process if
serving in production (not run automatically by `entrypoint.sh`; check
that script for the container's exact startup sequence).

## Database

- **Development:** SQLite (default, zero-config).
- **Production:** PostgreSQL, configured via a single `DATABASE_URL`
  connection string (parsed by `dj_database_url`), e.g.:

  ```
  postgres://user:password@host:5432/dbname
  ```

  `conn_max_age=600` and `conn_health_checks=True` are set, suitable for
  typical PaaS deployments (the `.onrender.com` entries in
  `ALLOWED_HOSTS`/`CSRF_TRUSTED_ORIGINS` suggest Render as the reference
  deployment target, though nothing in the code hardcodes a provider
  beyond that).

## Migrations

Standard Django migrations, one set per app (`accounts`, `alerts`,
`blog`, `ingestion`, `telemetry`). Run `python manage.py migrate` after
pulling schema changes. `blog` additionally ships two **data** migrations
(`0002_seed_intro_post.py`, `0003_seed_five_more_posts.py`) that seed
example blog posts — useful for a fresh environment that wants sample
content without manual admin entry.
