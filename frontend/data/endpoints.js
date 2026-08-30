// Endpoint highlights shown on the homepage. These mirror the real routes
// exposed by the Conduit backend (see config/*/urls.py) — kept in sync
// with libs/docsData.js, which has the full reference.
const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/stations/",
    title: "List Stations",
    desc: "Retrieve every registered weather station with its metadata: coordinates, elevation, sensor ID, and current status.",
  },
  {
    method: "GET",
    path: "/api/v1/stations/{slug}/current/",
    title: "Current Weather",
    desc: "Get the most recent reading for a station — temperature, humidity, pressure, wind, rainfall, light, and heat-stress indices.",
  },
  {
    method: "GET",
    path: "/api/v1/stations/{slug}/timeline/",
    title: "Timeline Data",
    desc: "Aggregated time-series data at minutely, hourly, or daily resolution — built for charts and dashboards.",
  },
  {
    method: "GET",
    path: "/api/v1/stations/{slug}/history/",
    title: "Historical Data",
    desc: "Paginated raw observations for a station over any date range, for trend analysis and research.",
  },
  {
    method: "GET",
    path: "/api/v1/alerts/",
    title: "Hydrology & Livestock Alerts",
    desc: "Runoff-risk and heat-stress alerts derived from live telemetry, filterable by type, station, and active status.",
  },
  {
    method: "POST",
    path: "/api/v1/alerts/webhooks/",
    title: "Webhook Subscriptions",
    desc: "Register a URL to receive signed HTTP callbacks the moment an alert is created or resolved.",
  },
];

export default ENDPOINTS;
