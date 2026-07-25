"""
Livestock Thermal Comfort: compares the pre-computed WBGT on each new
WeatherMeasurement against a configurable threshold and raises a heat
stress alert on crossing. WBGT itself is never recalculated here — it's
taken as-is from the measurement.
"""

from collections import defaultdict

from django.conf import settings

from alerts.models import Alert
from alerts.services.coalescence import create_alert, get_active_alert, resolve_active_alert

# How far above the threshold WBGT is determines severity. Crossing the
# threshold at all is at least "moderate" — this function only runs once
# WBGT >= threshold, so "low" never applies here.
SEVERITY_DELTA_BANDS = [
    (6.0, Alert.Severity.EXTREME),
    (3.0, Alert.Severity.HIGH),
    (0.0, Alert.Severity.MODERATE),
]


def _classify(delta):
    for lower_bound, severity in SEVERITY_DELTA_BANDS:
        if delta >= lower_bound:
            return severity
    return Alert.Severity.MODERATE


def _evaluate_station_measurements(station, measurements, threshold):
    """Walk one station's measurements in time order, opening/closing alerts on each WBGT crossing."""
    is_active = get_active_alert(station, Alert.AlertType.LIVESTOCK) is not None
    created_alerts = []

    for measurement in sorted(measurements, key=lambda m: m.time):
        if measurement.wbgt is None:
            continue

        if measurement.wbgt >= threshold:
            if not is_active:
                severity = _classify(measurement.wbgt - threshold)
                alert = create_alert(
                    station=station,
                    alert_type=Alert.AlertType.LIVESTOCK,
                    severity=severity,
                    message=(
                        f"Livestock heat stress at {station.instrument_name}: "
                        f"WBGT {measurement.wbgt:.1f}°C exceeds the "
                        f"{threshold:.1f}°C threshold."
                    ),
                    wbgt_value=measurement.wbgt,
                    threshold=threshold,
                    triggering_measurement=measurement,
                )
                created_alerts.append(alert)
                is_active = True
            # else: already active, this crossing is coalesced into it.
        elif is_active:
            resolve_active_alert(station, Alert.AlertType.LIVESTOCK)
            is_active = False

    return created_alerts


def evaluate_livestock_thermal(measurements, threshold=None):
    """
    Evaluate a batch of newly created WeatherMeasurements for livestock heat
    stress. Measurements may span multiple stations; each station's alert
    state is tracked independently.

    Returns the list of newly created Alert objects (crossings that were
    coalesced into an already-active alert don't appear here).
    """
    threshold = threshold if threshold is not None else settings.ALERTS_LIVESTOCK_WBGT_THRESHOLD

    by_station = defaultdict(list)
    for measurement in measurements:
        by_station[measurement.station_id].append(measurement)

    created_alerts = []
    for station_measurements in by_station.values():
        station = station_measurements[0].station
        created_alerts.extend(_evaluate_station_measurements(station, station_measurements, threshold))

    return created_alerts
