# 7. API Reference — Ingestion

Base path: `/api/v1/`

Admin/dashboard and machine-to-machine endpoints for pulling data from
3D-FEWSNET into Conduit, and for observing ingestion health. For the
underlying pull/parse/dedupe logic, see
[10-ingestion-pipeline.md](./10-ingestion-pipeline.md).

---

## `POST /api/v1/ingest/`

Trigger a **historical backfill** for an explicit date range. Intended for
admin dashboard use (e.g. "pull last month's data").

**Auth:** JWT, `IsAdminUser`

**Body**
```json
{
  "start_date": "2026-07-01",
  "end_date": "2026-07-31"
}
```
`end_date` is optional and defaults to yesterday.

**Response `200`**
```json
{
  "sync_id": "c1d2...",
  "station": "Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1",
  "start_date": "2026-07-01",
  "end_date": "2026-07-31",
  "fetched": 44640,
  "created": 44201,
  "skipped_duplicates": 439,
  "status": "success",
  "errors": []
}
```

**Errors**
- `400` — missing `start_date`, or `start_date` after `end_date`.
- `502` — every chunk of the request failed to reach 3D-FEWSNET (see
  `IngestError` in the pipeline doc).

---

## `POST /api/v1/ingestion/live-sync/`

Staff-facing, on-demand equivalent of the scheduled cron sync — fetches
anything newer than the latest stored measurement. Useful for "sync now"
buttons in the dashboard.

**Auth:** JWT, `IsAdminUser`

**Body:** none required.

**Response `200`**: same shape as `/ingest/`'s response.

---

## `POST /api/v1/internal/sync/`

The endpoint the 15-minute GitHub Actions cron actually calls. Not for
human/dashboard use — see
[04-authentication-and-authorization.md](./04-authentication-and-authorization.md#4-internal-shared-secret-authentication-scheduled-jobs).

**Auth:** shared secret

```http
X-SYNC-TOKEN: <SYNC_SECRET_TOKEN>
```

**Body:** none required.

**Response `200`**: same shape as `/ingest/`'s response, with
`"triggered_by": "github-actions"`.

**Errors**
- `503` — `SYNC_SECRET_TOKEN` not configured on the server.
- `401` — missing/invalid token.
- `502` — sync failed entirely.

---

## `GET /api/v1/sync-logs/`

Recent ingestion runs, most recent first.

**Auth:** JWT, `IsAdminUser`

**Query parameters**

| Param | Description |
|---|---|
| `limit` | max rows to return, default 20, capped at 100 |

**Response `200`**
```json
[
  {
    "id": "c1d2...",
    "station": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
    "requested_start": "2026-08-11",
    "requested_end": "2026-08-11",
    "status": "success",
    "records_fetched": 15,
    "records_created": 15,
    "records_skipped": 0,
    "error_message": "",
    "triggered_by": "github-actions",
    "created_at": "2026-08-11T09:45:12Z"
  }
]
```
*(exact serialized fields come from `WeatherSyncLogSerializer` — station is
included via `select_related`)*

---

## `GET /api/v1/default-range/`

Suggests a `{start_date, end_date}` pair for a manual backfill form —
`start_date` is the latest measurement already stored (or yesterday if the
database is empty), `end_date` is always yesterday.

**Auth:** JWT, `IsAdminUser`

**Response `200`**
```json
{ "suggested_start": "2026-08-05", "suggested_end": "2026-08-10" }
```

---

## `GET /api/v1/ingestion/overview/`

A single aggregated snapshot for the admin ingestion console — deliberately
one endpoint (not several small ones) so the dashboard loads in one round
trip.

**Auth:** JWT, `IsAdminUser`

**Response `200`**
```json
{
  "totals": {
    "total_measurements": 128340,
    "total_stations": 1,
    "records_last_24h": 96,
    "records_last_7d": 672
  },
  "stations": [
    {
      "id": "61a1...",
      "instrument_name": "Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1",
      "sensor_id": 61,
      "site_name": "Site JKUAT",
      "status": "active",
      "measurement_count": 128340,
      "records_last_24h": 96,
      "latest_measurement_time": "2026-08-11T09:45:00Z",
      "minutes_since_last_reading": 12
    }
  ],
  "sync_health": {
    "last_run": { "...": "WeatherSyncLog, see /sync-logs/" },
    "runs_considered": 20,
    "success_count": 19,
    "partial_count": 1,
    "failed_count": 0
  },
  "suggested_range": {
    "suggested_start": "2026-08-10",
    "suggested_end": "2026-08-10"
  },
  "source_config": {
    "sensor_id": "61",
    "api_base_url": "https://3d-fewsnet.icdp.ucar.edu/api/v1/data",
    "configured": true,
    "cron_interval_minutes": 15
  }
}
```

`minutes_since_last_reading` lets the dashboard flag a station that has
stopped reporting even though the last sync run technically "succeeded"
(e.g. the station itself is offline, not the pipeline).

---

## CLI: `backfill_weather` management command

For large backfills that would otherwise hit an HTTP request timeout, run
directly from the container/terminal:

```bash
python manage.py backfill_weather --start 2026-06-01
python manage.py backfill_weather --start 2026-06-01 --end 2026-07-04
```

`--end` defaults to yesterday, same as the API. Internally calls the same
`run_ingest()` function as `POST /api/v1/ingest/`, with
`triggered_by="cli"`.
