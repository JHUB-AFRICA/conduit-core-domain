# 4. Authentication & Authorization

Conduit uses three distinct authentication patterns depending on who — or
what — is calling the API.

## 1. JWT authentication (dashboard / logged-in users)

Used by the frontend "Data Portal" and any first-party web client.

- Provided by `rest_framework_simplejwt`.
- Configured as the **project-wide default** authentication class in
  `REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']`.
- Access token lifetime: **30 minutes**. Refresh token lifetime: **7 days**
  (`SIMPLE_JWT` in `config/settings.py`).
- Obtain tokens via `POST /api/v1/auth/login/`; refresh via
  `POST /api/v1/auth/refresh/`.
- The login serializer (`LoginSerializer`) embeds `email` and `username`
  into the token payload.

Send it as a standard bearer token:

```http
Authorization: Bearer <access_token>
```

## 2. API key authentication (external programmatic consumers)

Used by third-party integrators who are not logged-in dashboard users.

- Implemented in `accounts.authentication.APIKeyAuthentication`.
- Send the key in a header:

  ```http
  X-API-KEY: <your-api-key>
  ```

- Keys are created via `POST /api/v1/auth/api-keys/create/` (requires a
  JWT-authenticated user) — see
  [05-api-accounts.md](./05-api-accounts.md).
- Every successful key authentication:
  1. Checks the key is `is_active`.
  2. Enforces **per-minute** rate limit (`APIKey.requests_per_minute`,
     default 60) by counting `APIRequestLog` rows in the last 60 seconds.
  3. Enforces a **daily quota** (`APIKey.daily_quota`, default 10,000) by
     counting rows since local midnight (server's `timezone.now()`
     day-start).
  4. Logs the request to `APIRequestLog` (endpoint + timestamp).
- Exceeding either limit raises `AuthenticationFailed` — the request never
  reaches the view (`401`-style rejection, not `429`, since it's raised
  from an authentication class).

## 3. Combined JWT-or-API-Key (`JWTOrAPIKeyAuthentication`)

Most **read** endpoints in `telemetry` and `alerts` are consumed both by
the logged-in dashboard *and* by external API-key holders. Rather than
duplicate every view, these endpoints use
`accounts.authentication.JWTOrAPIKeyAuthentication`, which:

1. Tries JWT first. If valid, authentication succeeds immediately and
   **`APIRequestLog` is never written** — from the product's perspective, a
   logged-in dashboard user browsing weather data isn't "using the API",
   so it shouldn't burn their rate limit or show up in usage stats.
2. If JWT is absent or invalid/expired, it falls back to
   `APIKeyAuthentication` — which does log and rate-limit the request.

This means a stale/expired browser session doesn't hard-fail a request
that would otherwise succeed on an attached API key; it just falls
through to key-based auth.

Used by:
- `telemetry`: station list/detail, current weather, timeline, daily
  summary, history archive.
- `alerts`: alert list/detail.

## 4. Internal shared-secret authentication (scheduled jobs)

Two endpoints exist purely for **machine-to-machine scheduled jobs**, not
for any user (JWT or API key):

- `POST /api/v1/internal/sync/` — triggers ingestion of new measurements.
- `POST /api/v1/alerts/internal/retry-webhooks/` — retries failed webhook
  deliveries.

Both:
- Set `authentication_classes = []` and `permission_classes = [AllowAny]`
  at the DRF level (no user context at all).
- Manually validate a shared-secret header instead:

  ```http
  X-SYNC-TOKEN: <SYNC_SECRET_TOKEN>
  ```

- Compare it with `secrets.compare_digest()` (constant-time comparison,
  avoids timing attacks) against `settings.SYNC_SECRET_TOKEN`.
- Return `503` if `SYNC_SECRET_TOKEN` isn't configured server-side, and
  `401` if the header is missing or wrong.

These are called by the GitHub Actions workflow
(`.github/workflows/sync-weather.yml`) every 15 minutes — see
[14-deployment.md](./14-deployment.md).

## 5. Staff-only (`IsAdminUser`) endpoints

Admin dashboard actions that mutate ingestion state use plain JWT auth
(the project default) plus DRF's `IsAdminUser` permission, which requires
`request.user.is_staff = True`:

- `POST /api/v1/ingest/` — manual/admin backfill trigger.
- `POST /api/v1/ingestion/live-sync/` — staff-facing equivalent of the
  cron job, run on demand.
- `GET /api/v1/sync-logs/`, `GET /api/v1/default-range/`,
  `GET /api/v1/ingestion/overview/` — ingestion visibility endpoints.

These are distinguished from the internal shared-secret endpoints above:
staff endpoints represent *a logged-in person clicking a button*; internal
endpoints represent *a scheduled job with no human present*.

## 6. Read-only-or-admin permission

`telemetry.permissions.IsReadOnlyOrAdmin` is a general-purpose permission
class available in the codebase: anyone may `GET`/`HEAD`/`OPTIONS`, but
only `is_staff` users may write (`POST`/`PUT`/`PATCH`/`DELETE`).

## Authentication method summary by endpoint group

| Endpoint group | Auth | Permission |
|---|---|---|
| `accounts` — signup/login/refresh | none / JWT (issued here) | `AllowAny` |
| `accounts` — me, api-keys, api-usage | JWT | `IsAuthenticated` |
| `telemetry` — all read endpoints | JWT or API key | `IsAuthenticated` |
| `ingestion` — ingest, live-sync, sync-logs, overview, default-range | JWT | `IsAdminUser` |
| `ingestion` — internal sync | shared secret (`X-SYNC-TOKEN`) | `AllowAny` (manual check) |
| `alerts` — alert list/detail | JWT or API key | `IsAuthenticated` |
| `alerts` — webhook subscriptions (CRUD, test, deliveries) | JWT | `IsAuthenticated`, owner-scoped |
| `alerts` — internal retry-webhooks | shared secret (`X-SYNC-TOKEN`) | `AllowAny` (manual check) |
| `blog` — all endpoints | none | `AllowAny` |
