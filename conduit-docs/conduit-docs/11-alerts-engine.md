# 11. Alerts Engine

Conduit raises two kinds of alert from incoming telemetry, both
**rule-based** (thresholds and weighted points) rather than machine
learning — intentionally, so the logic is easy to read, reason about, and
tune without a model retrain. Code lives in `config/alerts/services/`.

## Shared lifecycle: coalescence

Both engines route every alert open/close through
`alerts/services/coalescence.py`, which is the **only** place allowed to
call `Alert.objects.create()` for these flows:

- `get_active_alert(station, alert_type)` — the current open alert (if
  any) for a `(station, alert_type)` pair. Alerts are looked up by this
  compound key, indexed at the database level.
- `create_alert(**fields)` — creates the `Alert` row **and** immediately
  calls `notify_webhooks(alert, WebhookEvent.ALERT_CREATED)`.
- `resolve_active_alert(station, alert_type)` — marks the open alert
  `is_active=False`, stamps `resolved_at`, and calls
  `notify_webhooks(alert, WebhookEvent.ALERT_RESOLVED)`.

**Coalescence** means: while a `(station, alert_type)` alert is active, a
persisting or fluctuating-but-still-bad condition does **not** open a
second alert — the existing one stands. Only once the condition drops
below threshold (and the alert is resolved) can the *next* crossing open a
fresh one. This is why both engines check `get_active_alert()` before
creating, and call `resolve_active_alert()` when the condition clears.

## Hydrology engine (`alerts/services/hydrology.py`)

**Question it answers:** how much runoff/flood risk is there right now,
and is it safe to apply fertilizer?

**Entry point:** `evaluate_station_hydrology(station, reference_time=None)`
— called from ingestion after each live-sync batch, using a rolling
lookback window rather than only the newest readings.

### Scoring

1. **Window** — looks back `settings.ALERTS_HYDROLOGY_LOOKBACK_HOURS`
   (default 6h) from `reference_time` (defaults to now).
2. **Rainfall** — sums `rain_gauge_1` and `rain_gauge_2` independently
   over the window, then takes the **higher** of the two totals
   (`effective_rainfall_mm`). The two gauges are redundant readings of the
   same rainfall; taking the max rather than averaging means one
   malfunctioning/dry gauge can't mask real rainfall the other one caught.
3. **Rainfall → points** (up to 70 of 100), bucketed:

   | Rainfall in window | Points |
   |---|---|
   | ≥ 40 mm | 70 |
   | ≥ 20 mm | 50 |
   | ≥ 10 mm | 30 |
   | ≥ 5 mm | 15 |
   | ≥ 0.01 mm | 5 |
   | 0 mm | 0 |

4. **Pressure trend** — compares the first and last `bmx_pressure`
   reading in the window. A delta of at least ±1.0 hPa is classified
   `falling`/`rising`; anything smaller is `steady`. (Fewer than 2
   readings with pressure data → `steady`.)
5. **Pressure → points** (up to 30 of 100):

   | Trend | Points | Why |
   |---|---|---|
   | falling | 30 | often precedes storms |
   | steady | 10 | |
   | rising | 0 | |

6. **Total score** = rainfall points + pressure points, capped at 100.
7. **Severity classification:**

   | Score | Severity |
   |---|---|
   | ≥ 75 | extreme |
   | ≥ 50 | high |
   | ≥ 25 | moderate |
   | < 25 | low |

8. **Recommendation** (attached to the alert, not returned separately):

   | Severity | Recommendation |
   |---|---|
   | low | Safe to apply fertilizer |
   | moderate | Monitor weather |
   | high | Delay fertilizer application |
   | extreme | Do not apply fertilizer |

### Alert decision

- If `score >= settings.ALERTS_HYDROLOGY_ALERT_THRESHOLD` (default 50):
  open an alert if none is active (coalescing into the existing one
  otherwise).
- Otherwise: resolve any currently active hydrology alert for the
  station.

Note the alert-open threshold (50, i.e. "high" or above) is independent
from the severity classification bands above — a "moderate" (25–49) score
never opens an alert on its own, but if an alert is already active from a
prior high/extreme reading, the alert's stored `severity` reflects
whatever the score was computed as at open time, not necessarily the
current instantaneous score.

## Livestock engine (`alerts/services/livestock.py`)

**Question it answers:** is livestock heat stress (WBGT) currently
exceeding a safe threshold?

**Entry point:** `evaluate_livestock_thermal(measurements, threshold=None)`
— called from ingestion with only the **newly created** measurements from
a live-sync batch (accepts a list of model instances, a list/queryset of
UUIDs, or a queryset — normalized internally).

### Logic

Unlike hydrology, WBGT (**W**et **B**ulb **G**lobe **T**emperature) is
never recalculated here — it's taken as-is from
`WeatherMeasurement.wbgt`, which 3D-FEWSNET computes upstream.

1. Group the input measurements by station.
2. Within each station, walk measurements **in time order**:
   - `wbgt is None` → skip (no data to evaluate).
   - `wbgt >= threshold` (default `settings.ALERTS_LIVESTOCK_WBGT_THRESHOLD`,
     22.0°C) and no alert currently active → open one, with severity based
     on how far above threshold:

     | `wbgt - threshold` | Severity |
     |---|---|
     | ≥ 6.0 | extreme |
     | ≥ 3.0 | high |
     | ≥ 0.0 | moderate |

     (Since this branch only runs once WBGT has already crossed the
     threshold, "low" severity never applies to livestock alerts.)
   - `wbgt >= threshold` and an alert **is** already active → the crossing
     is coalesced into it (no new alert).
   - `wbgt < threshold` and an alert is active → resolve it.
3. Returns only the alerts newly **created** in this call — crossings
   that coalesced into an already-active alert aren't included.

The `triggering_measurement` FK on the resulting `Alert` records exactly
which reading caused the alert to open, for traceability.

## Where evaluation is triggered from

Both engines are invoked from `ingestion.services.ingest.run_ingest()`,
only on the **live-sync** path, immediately after a batch of new
measurements is successfully created. See
[10-ingestion-pipeline.md](./10-ingestion-pipeline.md#triggering-alert-evaluation).
They are not run automatically on a schedule independent of ingestion —
an alert can only be raised or resolved as a side effect of new data
arriving.
