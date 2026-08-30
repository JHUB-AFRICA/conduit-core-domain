// Documentation content for /documentation. Every path, param, and response
// shape here is taken directly from the Conduit backend (Django REST
// Framework) — config/telemetry, config/alerts, and config/accounts — so
// this stays a source of truth rather than aspirational copy.

export const nav = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "authentication", label: "Authentication" },
      { id: "rate-limits", label: "Rate Limits" },
    ],
  },
  {
    title: "Weather Endpoints",
    items: [
      { id: "stations", label: "List Stations" },
      { id: "station-detail", label: "Station Detail" },
      { id: "current-weather", label: "Current Weather (All)" },
      { id: "station-current", label: "Current Weather (Station)" },
      { id: "timeline", label: "Timeline" },
      { id: "history", label: "Historical Data" },
      { id: "daily-summary", label: "Daily Summary" },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "data-model", label: "Data Model" },
      { id: "filtering", label: "Filtering & Pagination" },
      { id: "errors", label: "Error Handling" },
      { id: "code-examples", label: "Code Examples" },
    ],
  },
];

// ============================================================================
// Weather / telemetry endpoints — authenticated with X-API-KEY
// ============================================================================

export const endpoints = [
  {
    id: "stations",
    method: "GET",
    path: "/stations/",
    title: "List All Stations",
    desc: "Retrieve every registered weather station with its metadata including ID, name, location, and status. Not paginated.",
    params: [],
    response: `[
  {
    "id": "209eb029-dfa4-4669-96bd-cff5b2ba2b0b",
    "instrument_name": "Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1",
    "sensor_id": 61,
    "site_name": "Site JKUAT",
    "latitude": "-1.099736",
    "longitude": "37.014528",
    "elevation_m": "1523.00",
    "status": "active",
    "slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1"
  }
]`,
  },
  {
    id: "station-detail",
    method: "GET",
    path: "/stations/{slug}/",
    title: "Station Detail",
    desc: "Get detailed information about a specific weather station by its slug.",
    params: [
      {
        name: "slug",
        type: "string",
        desc: "Unique station identifier (slug), from the stations list",
      },
    ],
    response: `{
  "id": "209eb029-dfa4-4669-96bd-cff5b2ba2b0b",
  "slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
  "instrument_name": "Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1",
  "sensor_id": 61,
  "site_name": "Site JKUAT",
  "latitude": "-1.099736",
  "longitude": "37.014528",
  "elevation_m": "1523.00",
  "status": "active",
  "status_display": "Active",
  "created_at": "2026-07-07T00:21:49.032925Z",
  "updated_at": "2026-07-07T00:21:49.032925Z"
}`,
  },
  {
    id: "current-weather",
    method: "GET",
    path: "/stations/current/",
    title: "All Stations — Current Weather",
    desc: "Get the most recent weather observation for every active station in one call. Stations with status other than active are excluded.",
    params: [],
    response: `[
  {
    "station_name": "Site JKUAT",
    "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
    "coordinates": {
      "latitude": -1.099736,
      "longitude": 37.014528
    },
    "data": {
      "id": "9e31bf67-7cf1-4f8d-a3b4-4ffbd556a4d0",
      "time": "2026-07-05T23:59:47Z",
      "weather_readings": {
        "temperature": { "bmx": 15.9, "mcp": 16.2, "sht": 16.3 },
        "humidity_pct": 87.5,
        "pressure_bmx": 852.4,
        "light": { "visible": 259.0, "infrared": 253.0, "ultraviolet": 0.0 },
        "rain": {
          "gauge_1_current": 0.0,
          "gauge_2_current": 0.0,
          "gauge_1_today": 0.0,
          "gauge_2_today": 0.0,
          "gauge_1_prior": 0.0,
          "gauge_2_prior": 0.0
        },
        "wind": { "speed": 0.0, "direction": 114.0, "gust": 0.0, "gust_direction": 0.0 },
        "indices": { "heat_index": 16.3, "wet_bulb": 14.8, "wbgt": 12.1 }
      }
    }
  }
]`,
  },
  {
    id: "station-current",
    method: "GET",
    path: "/stations/{slug}/current/",
    title: "Station — Current Weather",
    desc: "Get the most recent weather observation for a single station by slug. Returns 404 if no measurements exist yet for the station.",
    params: [
      {
        name: "slug",
        type: "string",
        desc: "Unique station identifier (slug)",
      },
    ],
    response: `{
  "id": "9e31bf67-7cf1-4f8d-a3b4-4ffbd556a4d0",
  "time": "2026-07-05T23:59:47Z",
  "weather_readings": {
    "temperature": { "bmx": 15.9, "mcp": 16.2, "sht": 16.3 },
    "humidity_pct": 87.5,
    "pressure_bmx": 852.4,
    "light": { "visible": 259.0, "infrared": 253.0, "ultraviolet": 0.0 },
    "rain": {
      "gauge_1_current": 0.0,
      "gauge_2_current": 0.0,
      "gauge_1_today": 0.0,
      "gauge_2_today": 0.0,
      "gauge_1_prior": 0.0,
      "gauge_2_prior": 0.0
    },
    "wind": { "speed": 0.0, "direction": 114.0, "gust": 0.0, "gust_direction": 0.0 },
    "indices": { "heat_index": 16.3, "wet_bulb": 14.8, "wbgt": 12.1 }
  }
}`,
  },
  {
    id: "timeline",
    method: "GET",
    path: "/stations/{slug}/timeline/",
    title: "Timeline",
    desc: "Fetch aggregated time-series data for a station with a customizable resolution. If start/end are omitted, defaults to the 24 hours before the latest measurement.",
    params: [
      {
        name: "slug",
        type: "string",
        desc: "Unique station identifier (slug)",
      },
      {
        name: "resolution",
        type: "string",
        desc: "One of minutely, hourly, daily (default: hourly)",
      },
      {
        name: "start",
        type: "string",
        desc: "ISO 8601 window start — must be supplied together with end",
      },
      {
        name: "end",
        type: "string",
        desc: "ISO 8601 window end — must be supplied together with start",
      },
    ],
    response: `{
  "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
  "resolution": "hourly",
  "data_points": [
    {
      "timestamp": "2026-07-05T00:00:00Z",
      "temperature_avg_c": 15.81,
      "humidity_avg_pct": 83.52,
      "pressure_hpa": 851.9,
      "rain": { "total_mm": 0.0, "today_mm": 0.0, "yesterday_mm": 0.0 },
      "wind": { "speed_mps": 0.6, "direction_deg": 110.0, "gust_max_mps": 1.7, "gust_direction_deg": 108.0 },
      "light": { "visible_lux": 12.0, "infrared": 9.0, "ultraviolet": 0.0 },
      "indices": { "heat_index_c": 15.9, "wet_bulb_c": 14.6, "wbgt_c": 12.0 }
    }
  ]
}`,
  },
  {
    id: "history",
    method: "GET",
    path: "/stations/{slug}/history/",
    title: "Historical Data",
    desc: "Retrieve paginated, unaggregated historical weather observations from a station, newest first.",
    params: [
      {
        name: "slug",
        type: "string",
        desc: "Unique station identifier (slug)",
      },
      {
        name: "start_date",
        type: "string",
        desc: "ISO date — only records on/after this date",
      },
      {
        name: "end_date",
        type: "string",
        desc: "ISO date — only records on/before this date",
      },
      { name: "page", type: "integer", desc: "Page number for pagination" },
      {
        name: "page_size",
        type: "integer",
        desc: "Results per page (default 100, max 1000)",
      },
    ],
    response: `{
  "count": 453356,
  "next": "http://127.0.0.1:8000/api/v1/stations/kenya-kiambu-jkuat-iot-aws-conduitempathy1/history/?page=2",
  "previous": null,
  "results": [
    {
      "id": "9e31bf67-7cf1-4f8d-a3b4-4ffbd556a4d0",
      "time": "2026-07-05T23:59:47Z",
      "weather_readings": {
        "temperature": { "bmx": 15.9, "mcp": 16.2, "sht": 16.3 },
        "humidity_pct": 87.5,
        "pressure_bmx": 852.4,
        "light": { "visible": 259.0, "infrared": 253.0, "ultraviolet": 0.0 },
        "rain": {
          "gauge_1_current": 0.0,
          "gauge_2_current": 0.0,
          "gauge_1_today": 0.0,
          "gauge_2_today": 0.0,
          "gauge_1_prior": 0.0,
          "gauge_2_prior": 0.0
        },
        "wind": { "speed": 0.0, "direction": 114.0, "gust": 0.0, "gust_direction": 0.0 },
        "indices": { "heat_index": 16.3, "wet_bulb": 14.8, "wbgt": 12.1 }
      }
    }
  ]
}`,
  },
  {
    id: "daily-summary",
    method: "GET",
    path: "/stations/{slug}/summary/",
    title: "Daily Summary",
    desc: "Get daily aggregated weather statistics including min, max, and average temperatures. Defaults to the last 30 days if no range is given.",
    params: [
      {
        name: "slug",
        type: "string",
        desc: "Unique station identifier (slug)",
      },
      {
        name: "start",
        type: "string",
        desc: "ISO 8601 window start — must be supplied together with end",
      },
      {
        name: "end",
        type: "string",
        desc: "ISO 8601 window end — must be supplied together with start",
      },
    ],
    response: `{
  "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
  "aggregated_by": "day",
  "start_date": "2026-06-05",
  "end_date": "2026-07-05",
  "history": [
    {
      "date": "2026-07-05",
      "temperature": { "max": 19.4, "min": 15.3, "avg": 16.8 },
      "humidity": { "avg_pct": 83.2 },
      "pressure": { "hpa": 852.1 },
      "rain": { "total_mm": 0.0, "today_mm": 0.0, "yesterday_mm": 0.0 },
      "wind": { "speed_mps": 0.7, "direction_deg": 112.0, "gust_max_mps": 2.1 },
      "light": { "visible_lux": 210.0, "infrared": 198.0, "ultraviolet": 0.4 },
      "indices": { "heat_index_c": 17.1, "wet_bulb_c": 15.0, "wbgt_c": 12.4 }
    }
  ]
}`,
  },
];

export const dataModel = [
  {
    group: "System",
    fields: [
      ["id", "UUID of the measurement"],
      ["time", "Timestamp of the reading (ISO 8601, UTC)"],
    ],
  },
  {
    group: "Temperature",
    fields: [
      ["temperature.bmx", "BMX sensor air temperature (°C)"],
      ["temperature.mcp", "MCP sensor air temperature (°C)"],
      ["temperature.sht", "SHT sensor air temperature (°C)"],
    ],
  },
  {
    group: "Atmospheric",
    fields: [
      ["humidity_pct", "Relative humidity (%)"],
      ["pressure_bmx", "Barometric pressure (hPa)"],
    ],
  },
  {
    group: "Light",
    fields: [
      ["light.visible", "Visible light"],
      ["light.infrared", "Infrared light"],
      ["light.ultraviolet", "Ultraviolet light"],
    ],
  },
  {
    group: "Rain",
    fields: [
      [
        "rain.gauge_1_current / gauge_2_current",
        "Instantaneous rain gauge reading (mm)",
      ],
      ["rain.gauge_1_today / gauge_2_today", "Rain accumulated today (mm)"],
      [
        "rain.gauge_1_prior / gauge_2_prior",
        "Rain accumulated the prior day (mm)",
      ],
    ],
  },
  {
    group: "Wind",
    fields: [
      ["wind.speed", "Wind speed (m/s)"],
      ["wind.direction", "Wind direction (degrees)"],
      ["wind.gust", "Gust speed (m/s)"],
      ["wind.gust_direction", "Gust direction (degrees)"],
    ],
  },
  {
    group: "Heat & Comfort Indices",
    fields: [
      ["indices.heat_index", "Heat index (°C)"],
      ["indices.wet_bulb", "Wet bulb temperature (°C)"],
      [
        "indices.wbgt",
        "Wet Bulb Globe Temperature (°C) — used for livestock heat-stress alerts",
      ],
    ],
  },
  {
    group: "Alert (hydrology)",
    fields: [
      ["runoff_risk_score", "0–100 runoff risk score"],
      [
        "rainfall_summary",
        "JSON breakdown of recent rainfall used to compute the score",
      ],
      ["pressure_trend", "rising, falling, or steady"],
      ["recommendation", "Free-text recommendation, e.g. DELAY_APPLICATION"],
    ],
  },
  {
    group: "Alert (livestock)",
    fields: [
      ["wbgt_value", "WBGT reading that triggered the alert (°C)"],
      ["threshold", "Configured WBGT threshold that was crossed (°C)"],
    ],
  },
];

export const errorCodes = [
  ["200", "OK", "The request was successful."],
  ["201", "Created", "Resource successfully created."],
  ["204", "No Content", "Resource successfully deleted — no response body."],
  ["400", "Bad Request", "Invalid request parameters or malformed payload."],
  ["401", "Unauthorized", "Missing or invalid API key."],
  ["404", "Not Found", "The requested resource was not found."],
  ["429", "Too Many Requests", "Rate limit or daily quota exceeded."],
  ["502", "Bad Gateway", "A downstream call (e.g. webhook delivery) failed."],
  ["500", "Internal Server Error", "Something went wrong on the server."],
];

export const commonErrors = [
  [
    "Invalid API Key",
    "401",
    "The X-API-KEY provided doesn't match an active key.",
  ],
  [
    "Missing API Key",
    "401",
    "The X-API-KEY header was not provided on a telemetry/alerts request.",
  ],
  [
    "Rate Limit Exceeded (per minute)",
    "401",
    "Too many requests this minute for this API key.",
  ],
  [
    "Daily Quota Exceeded",
    "401",
    "The API key's daily request quota has been used up.",
  ],
  ["Invalid Slug", "404", "The station slug does not match any station."],
  [
    "Both Dates Required",
    "400",
    "start/end (or start_date/end_date) must be supplied together, not just one.",
  ],
  [
    "Invalid Resolution",
    "400",
    "Timeline resolution must be one of minutely, hourly, daily.",
  ],
];

export const bestPractices = [
  "Store your API key securely — never expose it in client-side code you don't control.",
  "Use the /stations/ endpoint to discover station slugs before making data requests.",
  "Prefer /timeline/ and /summary/ for dashboards and graphs instead of paging through raw /history/.",
  "Apply start_date/end_date filters on /history/ to keep response sizes manageable.",
  "Store your webhook secret when you create a subscription — it is never shown again after the POST response.",
  "Verify the X-Conduit-Signature header (HMAC-SHA256 of the raw body, using your webhook secret) before trusting a delivered payload.",
  "Handle 429s with backoff — both per-minute and daily-quota limits apply per API key.",
];
