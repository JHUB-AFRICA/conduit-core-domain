# Conduit Core Domain

Conduit is a Django REST API that serves weather telemetry data from physical weather stations (IoT/AWS — Automatic Weather Stations). It exposes current readings, historical timelines, daily summaries, and heat-stress safety alerts (based on WBGT and Heat Index), and it secures access using both JWT user accounts and per-application API keys with rate limiting.

This README is meant to get a new collaborator from "cloned the repo" to "understands the whole API surface" without having to read every file.

---

## 1. Tech Stack

- **Python / Django 6.0** — core framework
- **Django REST Framework (DRF)** — API layer
- **djangorestframework-simplejwt** — JWT auth for human users (login/signup)
- **django-cors-headers** — CORS handling (currently `CORS_ALLOW_ALL_ORIGINS = True`, dev-only)
- **SQLite** (`db.sqlite3`) — default dev database

---

## 2. Project Structure

```
conduit-core-domain/
├── config/                  # Django project root (manage.py lives here)
│   ├── config/               # Project settings, root URLs, WSGI/ASGI
│   ├── accounts/              # Users, JWT auth, API keys, rate limiting
│   ├── telemetry/             # Weather stations, measurements, alerts (the core API)
│   ├── ingestion/             # Scaffolded app (currently empty — see note below)
│   └── db.sqlite3             # Dev database
├── requirements.txt
└── README.md
```

> **Note on `ingestion`:** This app is currently just a Django scaffold (no models, no views, not wired into `urls.py`). The actual data-loading happens via a **management command**: `telemetry/management/commands/import_geocsv.py`, which imports historical measurements from a JSON file into a given `WeatherStation`. If you're building out a real ingestion pipeline (e.g. live device push), that's the natural place to do it — either flesh out `ingestion` or extend this command.

---

## 3. Core Domain Concepts

| Model                | App       | What it represents                                                                                                    |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `User`               | accounts  | A human account (email + username login). UUID primary key.                                                           |
| `APIKey`             | accounts  | A machine credential tied to a user, used to call the telemetry API. Has its own rate limits.                         |
| `APIRequestLog`      | accounts  | One row per authenticated API-key request, used to enforce rate limits.                                               |
| `WeatherStation`     | telemetry | A physical weather station (location, instrument name, status, slug).                                                 |
| `WeatherMeasurement` | telemetry | A single sensor reading from a station at a point in time (temp, humidity, wind, rain, light, battery health, etc).   |
| `WeatherAlert`       | telemetry | A heat-stress risk alert (`info` / `warning` / `danger` / `extreme`), auto-generated whenever a measurement is saved. |

### Auto-generated alerts (important behavior)

Every time a `WeatherMeasurement` is saved (via API, admin, script, fixture — doesn't matter how), a Django signal (`telemetry/signals.py`) automatically:

1. Computes severity from `wbgt` and `heat_index` using banded thresholds (`telemetry/severity.py`).
2. Creates a corresponding `WeatherAlert` row with a human-readable message.

So you never create `WeatherAlert` objects directly — they're a derived, automatic side-effect of recording a measurement.

Severity bands (whichever is more severe of the two wins):

| Severity    | WBGT ≥               | Heat Index ≥         |
| ----------- | -------------------- | -------------------- |
| Extreme     | 31.0                 | 51.0                 |
| Danger      | 29.0                 | 39.0                 |
| Warning     | 27.0                 | 32.0                 |
| Info (safe) | below all thresholds | below all thresholds |

---

## 4. Authentication

There are **two separate auth mechanisms** depending on who's calling:

### A. Human users — JWT (for managing accounts / API keys)

Standard email+password login issuing JWT access/refresh tokens (`rest_framework_simplejwt`). Used only for the `accounts` endpoints below (signup, login, managing your own API keys) — **not** for the telemetry data endpoints.

- Access token lifetime: 30 minutes
- Refresh token lifetime: 7 days

### B. Machine / app clients — API Key (for reading telemetry data)

All `telemetry` endpoints require an **API key**, sent via header:

```
X-API-KEY: <your-key>
```

This is implemented in `accounts/authentication.py` (`APIKeyAuthentication`) and enforces, on every request:

1. The key exists and `is_active=True` (otherwise: `401 Invalid API key`).
2. **Per-minute rate limit** — based on `APIKey.requests_per_minute` (default 60).
3. **Daily quota** — based on `APIKey.daily_quota` (default 10,000).
4. Logs the request to `APIRequestLog` for rate-limit accounting.

If either limit is exceeded, the request is rejected with `401` and a message (`Rate limit exceeded (per minute)` / `Daily quota exceeded`).

> To get a key: sign up → log in → call the API-key creation endpoint (requires JWT auth, see below).

---

## 5. API Reference

Base URL: `/api/v1/`

### 5.1 Auth & Account Management — `/api/v1/auth/` (JWT-protected, except signup/login)

| Method | Endpoint                 | Auth | Description                                                 |
| ------ | ------------------------ | ---- | ----------------------------------------------------------- |
| POST   | `/auth/signup/`          | —    | Create a new user account (`email`, `username`, `password`) |
| POST   | `/auth/login/`           | —    | Log in, returns JWT `access` + `refresh` tokens             |
| POST   | `/auth/refresh/`         | —    | Exchange a refresh token for a new access token             |
| GET    | `/auth/me/`              | JWT  | Get the current logged-in user's profile                    |
| GET    | `/auth/api-keys/`        | JWT  | List your API keys                                          |
| POST   | `/auth/api-keys/create/` | JWT  | Create a new API key (optionally named)                     |
| DELETE | `/auth/api-keys/<id>/`   | JWT  | Revoke/delete an API key                                    |

### 5.2 Weather Telemetry — `/api/v1/` (API Key required, header `X-API-KEY`)

| Method | Endpoint                                          | Description                                                                                                             |
| ------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| GET    | `/stations/`                                      | List all weather stations (unpaginated)                                                                                 |
| GET    | `/stations/<slug>/`                               | Get details of a single station                                                                                         |
| GET    | `/stations/current/`                              | Current/latest reading for **every active station** (global snapshot)                                                   |
| GET    | `/stations/<slug>/current/`                       | Current/latest reading for a single station                                                                             |
| GET    | `/stations/<slug>/timeline/?resolution=hourly`    | Bucketed time-series of recent readings. `resolution` ∈ `minutely` (last 1h) / `hourly` (last 24h) / `daily` (last 30d) |
| GET    | `/stations/<slug>/summary/`                       | Daily aggregated summary (max/min/avg temp, avg humidity, total rain) for the last 30 days                              |
| GET    | `/stations/<slug>/history/?start_date=&end_date=` | Paginated raw measurement history (filterable by date range)                                                            |
| GET    | `/stations/alerts/current/`                       | Latest alert per active station                                                                                         |
| GET    | `/stations/<slug>/alerts/`                        | Paginated alert history for a single station                                                                            |

**Pagination** (on `/history/` and `/alerts/` for a station): standard DRF page-number pagination — `?page=1&page_size=100` (default page size 100, max 1000).

---

## 6. Example Requests

**Sign up & log in:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","username":"dev","password":"supersecret123"}'

curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"supersecret123"}'
# -> { "access": "...", "refresh": "..." }
```

**Create an API key (using the JWT access token):**

```bash
curl -X POST http://localhost:8000/api/v1/auth/api-keys/create/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-dashboard"}'
# -> { "id": "...", "name": "my-dashboard", "key": "<API_KEY>", ... }
```

**Call the telemetry API (using the API key):**

```bash
curl http://localhost:8000/api/v1/stations/ \
  -H "X-API-KEY: <API_KEY>"

curl "http://localhost:8000/api/v1/stations/site-jkuat/timeline/?resolution=hourly" \
  -H "X-API-KEY: <API_KEY>"
```

---

## 7. Response Shape Notes

- `current` / `history` endpoints return measurements grouped into nested objects: `system_health`, `weather_readings` (with sub-groups `temperature`, `light`, `rain`, `wind`, `indices`). This is a deliberately "tidy" API shape — the flat DB columns are reorganized by the serializers (`telemetry/serializers.py`), they aren't 1:1 with the model fields.
- `timeline` and `summary` return **derived/aggregated** values (averages, max, totals) computed in `telemetry/aggregation.py` — not raw rows.
- Temperature in aggregates falls back across sensors in this order: `bmx_temperature` → `mcp_temperature` → `sht_temperature` (first non-null wins).
- Rain totals fall back: `rain_gauge_1` → `rain_gauge_2` per row, then summed.

---

## 8. Local Setup

```bash
cd config
python -m venv venv && source venv/bin/activate   # or your preferred env tool
pip install -r ../requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

Admin site: `http://localhost:8000/admin/`

To bulk-import historical measurements from a JSON file into an existing station:

```bash
python manage.py import_geocsv <path_to_json> <station_id>
```

---
