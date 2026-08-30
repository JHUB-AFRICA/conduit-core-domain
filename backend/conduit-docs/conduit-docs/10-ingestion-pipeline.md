# 10. Ingestion Pipeline

This document explains how a raw reading on a physical weather station
becomes a queryable `WeatherMeasurement` row, step by step. Code lives in
`config/ingestion/services/client.py` and
`config/ingestion/services/ingest.py`.

## Source: the 3D-FEWSNET API

3D-FEWSNET (CHORDS) is the external platform that owns the physical
sensor network. Conduit is a **consumer**, not the source of truth for raw
readings — it periodically pulls a window of data and stores its own copy.

`fetch_station_properties(start_date, end_date=None)`
(`ingestion/services/client.py`) makes one HTTP GET to
`settings.FEWSNET_API_BASE_URL` with:

```
email=<FEWSNET_EMAIL>
api_key=<FEWSNET_API_KEY>
instruments=<FEWSNET_SENSOR_ID>
start=<YYYY-MM-DD>
end=<YYYY-MM-DD>       # omitted for "live" requests
```

Behavior:
- Raises `FewsnetError` if credentials aren't configured, the request
  fails at the transport level, or the response isn't valid JSON.
- Returns `None` if the response has no `features` (i.e. no data for that
  window) — this is a normal, expected outcome, not an error.
- Otherwise returns the `properties` object of the first GeoJSON feature,
  which contains `instrument`, `site`, `sensor_id`, and a `data` array of
  individual readings.
- **Omitting `end`** is meaningful: the API then returns everything from
  `start` up to the latest available reading. This is how "live sync"
  requests work (see below) without Conduit needing to know what "now"
  means to the sensor network.

## Field mapping

Each raw reading arrives with short field codes (`SHORTNAME_TO_FIELD` in
`ingest.py`) that map to `WeatherMeasurement` columns, e.g.:

| Source code | Model field |
|---|---|
| `bt1` | `bmx_temperature` |
| `sh1` | `sht_humidity` |
| `ws` / `wd` | `wind_speed` / `wind_direction` |
| `rg` / `rg2` | `rain_gauge_1` / `rain_gauge_2` |
| `wbgt` | `wbgt` |

Unknown codes are silently ignored (not every reading includes every
sensor). `wbgt`, `hi` (heat index), and `wbt` (wet bulb) arrive
pre-computed from 3D-FEWSNET — Conduit does not calculate these itself.

## Two entry points: historical vs. live

### `run_ingest(start_date, end_date=None, triggered_by="", live_sync=False)`

The core function. Two modes:

**Historical (`live_sync=False`)** — used by the admin backfill endpoint
and the CLI command.
- `end_date` defaults to **yesterday** if not given.
- Raises `IngestError` if `start_date > end_date`.
- The range is split into **5-day chunks** (`CHUNK_DAYS`) and fetched one
  chunk at a time. Rationale: readings arrive roughly once a minute, so a
  wide date range is a large payload; chunking keeps each request small
  and means one bad chunk doesn't cost the whole run — errors are
  collected per-chunk rather than aborting immediately.

**Live (`live_sync=True`)** — used by the 15-minute cron and the
"sync now" dashboard button, via `run_latest_sync()`.
- `end_date` stays `None`, so the API returns everything up to its own
  latest reading — no chunking needed since the window is inherently
  small (whatever's new since the last stored measurement).

### `run_latest_sync(triggered_by="github-actions")`

The "give me whatever's new" entry point:
1. Finds the most recent `WeatherMeasurement.time` already stored.
2. Uses that date as `start_date` (so re-running every 15 minutes only
   re-fetches a small trailing window, not the whole history).
3. If the database is completely empty (first-ever run), seeds
   `start_date` as **2 days ago** rather than "today" — a same-day-only
   window could miss data if today's window hasn't produced anything yet.
4. Delegates to `run_ingest(..., live_sync=True)`.

## Parsing and deduplication

For each chunk/request, once a non-empty `props` is returned:

1. **Station resolution** — `_get_or_create_station(props)` looks up (or
   creates) a `WeatherStation` by `sensor_id`, seeding `instrument_name`
   and `site_name` from the API response on first creation.
2. **Timestamp parsing** — each record's `time` string is parsed and made
   timezone-aware (assumed UTC if naive) via `_to_aware_datetime`.
3. **Duplicate detection** — all candidate timestamps for the chunk are
   collected, then a **single query** checks which of them already exist
   for this station (`WeatherMeasurement.objects.filter(station=..,
   time__in=record_times)`), rather than one query per record. Records
   matching an existing timestamp are counted as `skipped`; records
   sharing a timestamp *within the same response* are also caught via a
   local `existing_times` set built up as records are processed.
4. **Bulk insert** — surviving records are built as unsaved
   `WeatherMeasurement` instances and written with
   `WeatherMeasurement.objects.bulk_create(to_create, ignore_conflicts=True)`
   inside a transaction. `ignore_conflicts=True` is a second line of
   defense against the `(station, time)` unique constraint, in case of a
   race with another concurrent sync.

> **Why `bulk_create` matters for the rest of the system:** `bulk_create()`
> does **not** fire Django's `post_save` signal. There is currently no
> code depending on that signal, but if a future feature needs to react to
> each new measurement individually (beyond the batch-level alert
> evaluation described below), ingestion would need to switch back to
> row-by-row `.save()` calls.

## Triggering alert evaluation

After a **live-sync** chunk successfully creates new rows, ingestion
directly calls into the `alerts` app (this is the one place `ingestion`
depends on `alerts`, see [02-architecture.md](./02-architecture.md)):

```python
evaluate_station_hydrology(station, time_range)      # all recent measurements
evaluate_livestock_thermal(measurement_ids)           # only the new batch
```

- **Hydrology** evaluates using a rolling lookback window (all recent
  measurements, not just the new ones) because runoff risk depends on
  accumulated rainfall/pressure trend over hours.
- **Livestock** evaluates only the newly created measurements, in time
  order, because heat stress is a per-reading threshold crossing.

This call happens **only in the live-sync path**, not the historical
chunked path — a large backfill of old data does not re-trigger alert
notifications for conditions that have long since resolved. See
[11-alerts-engine.md](./11-alerts-engine.md) for what happens next.

## Audit trail: `WeatherSyncLog`

Every call to `run_ingest()` — regardless of mode or outcome — writes
exactly one `WeatherSyncLog` row summarizing the run: status
(`success`/`partial`/`failed`), fetched/created/skipped counts, any
per-chunk error messages, and who triggered it
(`"cli"`, `"github-actions"`, or an admin's email).

- **`failed`**: every chunk failed and nothing was ingested → `IngestError`
  is also raised to the caller (surfaces as `502` from the API views).
- **`partial`**: at least one chunk succeeded but others failed.
- **`success`**: no errors at all.

See [07-api-ingestion.md](./07-api-ingestion.md) for how this log is
exposed (`GET /sync-logs/`, `GET /ingestion/overview/`).
