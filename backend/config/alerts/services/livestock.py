"""
Livestock Thermal Comfort: compares the pre-computed WBGT on each new
WeatherMeasurement against a configurable threshold and raises a heat
stress alert on crossing. WBGT itself is never recalculated here — it's
taken as-is from the measurement.
"""

from collections import defaultdict

from django.conf import settings
from django.db.models import Q

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

    Args:
        measurements: Can be either:
            - A list of WeatherMeasurement objects
            - A list of UUIDs (measurement IDs)
            - A queryset of WeatherMeasurement objects
    
    Returns the list of newly created Alert objects (crossings that were
    coalesced into an already-active alert don't appear here).
    """
    from telemetry.models import WeatherMeasurement
    import uuid
    
    threshold = threshold if threshold is not None else settings.ALERTS_LIVESTOCK_WBGT_THRESHOLD
    
    # Handle different input types
    if not measurements:
        return []
    
    # Check if measurements is a list of UUIDs or IDs
    if measurements and isinstance(measurements[0], (uuid.UUID, str)):
        # Convert IDs to actual measurement objects
        measurement_ids = [str(m) for m in measurements]
        measurements = WeatherMeasurement.objects.filter(
            id__in=measurement_ids
        ).select_related('station')
    
    # If measurements is a queryset, ensure it's evaluated
    if hasattr(measurements, 'select_related'):
        measurements = measurements.select_related('station')
    
    # Group by station
    by_station = defaultdict(list)
    for measurement in measurements:
        # Handle both dict and object
        if hasattr(measurement, 'station_id'):
            # It's a model instance
            station_id = measurement.station_id
        elif isinstance(measurement, dict):
            # It's a dict from values()
            station_id = measurement.get('station_id')
        else:
            # Skip unknown types
            continue
        
        if station_id:
            by_station[station_id].append(measurement)
    
    created_alerts = []
    for station_id, station_measurements in by_station.items():
        # Get the station from the first measurement
        if station_measurements:
            # Handle both model instances and dicts
            if hasattr(station_measurements[0], 'station'):
                station = station_measurements[0].station
            elif isinstance(station_measurements[0], dict):
                # Try to get station from station_id
                try:
                    from telemetry.models import Station
                    station = Station.objects.get(id=station_id)
                    # Convert dict measurements to objects if needed
                    # This might require additional querying
                    measurement_ids = [m['id'] for m in station_measurements if 'id' in m]
                    if measurement_ids:
                        station_measurements = list(WeatherMeasurement.objects.filter(
                            id__in=measurement_ids
                        ).order_by('time'))
                except Station.DoesNotExist:
                    continue
            else:
                continue
            
            # Ensure measurements are ordered by time
            station_measurements = sorted(
                station_measurements, 
                key=lambda m: m.time if hasattr(m, 'time') else 0
            )
            
            created_alerts.extend(_evaluate_station_measurements(
                station, station_measurements, threshold
            ))
    
    return created_alerts
