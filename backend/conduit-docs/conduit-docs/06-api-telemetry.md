# 6. API Reference — Telemetry

Base path: `/api/v1/`

Serves weather station metadata and measurement data: current conditions,
aggregated timelines, daily summaries, and paginated raw history. This is
the read-only surface over data that `ingestion` writes — see
[10-ingestion-pipeline.md](./10-ingestion-pipeline.md) for how it gets
there.

**Auth (all endpoints in this doc):** JWT or API key
(`JWTOrAPIKeyAuthentication`), `IsAuthenticated`. See
[04-authentication-and-authorization.md](./04-authentication-and-authorization.md).

---

## `GET /api/v1/stations/`

List all weather stations, ordered by `instrument_name`. Not paginated.

**Response `200`**
```json
[
  {
    "id": "61a1...",
    "instrument_name": "Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1",
    "sensor_id": 61,
    "site_name": "Site JKUAT",
    "latitude": -1.099736,
    "longitude": 37.014528,
    "elevation_m": 1523.0,
    "status": "active",
    "slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1"
  }
]
```

## `GET /api/v1/stations/<slug>/`

Retrieve one station's full detail (adds `status_display`, `created_at`,
`updated_at`).

**Response `404`** if slug doesn't match any station.

---

## `GET /api/v1/stations/current/`

Current weather for **all active stations** in one call. Not paginated.

**Response `200`**
```json
[
  {
    "station_name": "Site JKUAT",
    "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
    "coordinates": { "latitude": -1.099736, "longitude": 37.014528 },
    "data": {
      "id": "8e2a...",
      "time": "2026-08-11T09:45:00Z",
      "weather_readings": {
        "temperature": { "bmx": 21.4, "mcp": 21.1, "sht": 21.6 },
        "humidity_pct": 68.2,
        "pressure_bmx": 1013.4,
        "light": { "visible": 12000, "infrared": 8400, "ultraviolet": 3.1 },
        "rain": {
          "gauge_1_current": 0.0, "gauge_2_current": 0.0,
          "gauge_1_today": 4.2, "gauge_2_today": 4.0,
          "gauge_1_prior": 0.0, "gauge_2_prior": 0.0
        },
        "wind": { "speed": 2.1, "direction": 180.0, "gust": 3.4, "gust_direction": 190.0 },
        "indices": { "heat_index": 22.0, "wet_bulb": 18.2, "wbgt": 19.5 }
      }
    }
  }
]
```

`data` is `null` if the station has no measurements yet.

## `GET /api/v1/stations/<slug>/current/`

Current (i.e. most recent) weather for one station.

**Response `200`**: a single `weather_readings` object (same shape as
`.data` above), plus `id` and `time`.

**Response `404`**: `{ "detail": "No measurements recorded for this station yet." }`
(or `"Weather station not found."` if the slug itself doesn't exist).

---

## `GET /api/v1/stations/<slug>/timeline/`

Aggregated timeline, bucketed at the requested resolution. See
[03-data-model.md](./03-data-model.md) and the aggregation logic in
`telemetry/aggregation.py` for exactly how each bucket is computed
(averages, sums, max, or mode depending on the field — e.g. rainfall is
summed, wind direction uses mode, temperature/humidity/pressure are
averaged).

**Query parameters**

| Param | Values | Default |
|---|---|---|
| `resolution` | `minutely` \| `hourly` \| `daily` | `hourly` |
| `start` | ISO 8601 datetime | last 24h/1h/30d window ending at latest reading, depending on resolution (see below) |
| `end` | ISO 8601 datetime | required together with `start` |

If neither `start` nor `end` is given, the window defaults to ending at
the station's latest measurement and looking back:
- `minutely` → 1 hour
- `hourly` → 24 hours
- `daily` → 30 days

`start` and `end` must be supplied together (`400` if only one is given),
`start` must be before `end`, and both must parse as ISO 8601 (`400`
otherwise). An invalid `resolution` value also returns `400`.

**Response `200`**
```json
{
  "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
  "resolution": "hourly",
  "data_points": [
    {
      "timestamp": "2026-08-11T08:00:00Z",
      "temperature_avg_c": 20.8,
      "humidity_avg_pct": 70.1,
      "pressure_hpa": 1012.9,
      "rain": { "total_mm": 0.4, "today_mm": 3.8, "yesterday_mm": 0.0 },
      "wind": { "speed_mps": 1.9, "direction_deg": 175.0, "gust_max_mps": 3.0, "gust_direction_deg": 180.0 },
      "light": { "visible_lux": 9800, "infrared": 7000, "ultraviolet": 2.4 },
      "indices": { "heat_index_c": 21.0, "wet_bulb_c": 17.8, "wbgt_c": 18.9 }
    }
  ]
}
```
An empty `data_points` array (with `200`) means the station has no
measurements at all.

---

## `GET /api/v1/stations/<slug>/summary/`

Daily weather summaries (min/max/avg per day) over a date range.

**Query parameters**

| Param | Values | Default |
|---|---|---|
| `start` | ISO 8601 datetime | last 30 days |
| `end` | ISO 8601 datetime | now |

Same pairing/ordering/parse validation as `timeline` above.

**Response `200`**
```json
{
  "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
  "aggregated_by": "day",
  "start_date": "2026-07-12",
  "end_date": "2026-08-11",
  "history": [
    {
      "date": "2026-08-10",
      "temperature": { "max": 26.1, "min": 14.2, "avg": 19.9 },
      "humidity": { "avg_pct": 64.0 },
      "pressure": { "hpa": 1013.1 },
      "rain": { "total_mm": 6.4, "today_mm": 6.4, "yesterday_mm": 0.0 },
      "wind": { "speed_mps": 2.0, "direction_deg": 190.0, "gust_max_mps": 4.1 },
      "light": { "visible_lux": 15000, "infrared": 9200, "ultraviolet": 4.0 },
      "indices": { "heat_index_c": 23.0, "wet_bulb_c": 19.0, "wbgt_c": 20.1 }
    }
  ]
}
```

---

## `GET /api/v1/stations/<slug>/history/`

Paginated raw measurement history (each item has the same shape as
`.current/`'s `data`).

**Query parameters**

| Param | Description |
|---|---|
| `start_date` | `YYYY-MM-DD`, inclusive lower bound on `time` |
| `end_date` | `YYYY-MM-DD`, inclusive upper bound on `time` |
| `page` | page number |
| `page_size` | items per page (default 100, max 1000) |

**Response `200`**
```json
{
  "count": 4032,
  "next": "http://.../history/?page=2",
  "previous": null,
  "results": [
    {
      "id": "8e2a...",
      "time": "2026-08-11T09:45:00Z",
      "weather_readings": { "...": "same shape as /current/" }
    }
  ]
}
```
