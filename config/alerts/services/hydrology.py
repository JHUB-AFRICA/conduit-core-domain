"""
Smart Hydrology: a simple, rule-based runoff risk score derived from recent
rainfall (Rain Gauge A / B) and barometric pressure trend (BMX). No machine
learning — just thresholds and weighted points, intentionally easy to
reason about and tune.
"""

from datetime import datetime, timedelta

from django.conf import settings
from django.db.models import Sum
from django.utils import timezone

from alerts.models import Alert
from alerts.services.coalescence import create_alert, get_active_alert, resolve_active_alert
from telemetry.models import WeatherMeasurement

# Rainfall contributes up to 70 of the 100 points; pressure trend up to 30.
# Bucketed rather than a continuous formula so the scoring is easy to read
# and tune without a spreadsheet.
RAINFALL_SCORE_BANDS = [
    (40.0, 70),  # >= 40mm in the lookback window
    (20.0, 50),
    (10.0, 30),
    (5.0, 15),
    (0.01, 5),  # any measurable rain below 5mm still adds a little risk
]

PRESSURE_TREND_DELTA_HPA = 1.0  # smaller moves are treated as "steady"
PRESSURE_SCORE_BY_TREND = {
    Alert.PressureTrend.FALLING: 30,  # falling pressure often precedes storms
    Alert.PressureTrend.STEADY: 10,
    Alert.PressureTrend.RISING: 0,
}

# Runoff risk score (0-100) -> classification
SEVERITY_BANDS = [
    (75, Alert.Severity.EXTREME),
    (50, Alert.Severity.HIGH),
    (25, Alert.Severity.MODERATE),
    (0, Alert.Severity.LOW),
]

RECOMMENDATION_BY_SEVERITY = {
    Alert.Severity.LOW: "Safe to apply fertilizer",
    Alert.Severity.MODERATE: "Monitor weather",
    Alert.Severity.HIGH: "Delay fertilizer application",
    Alert.Severity.EXTREME: "Do not apply fertilizer",
}


def _rainfall_score(rainfall_mm):
    for lower_bound, points in RAINFALL_SCORE_BANDS:
        if rainfall_mm >= lower_bound:
            return points
    return 0


def _pressure_trend(measurements):
    """Compare the first and last BMX pressure readings in the window."""
    readings = [m.bmx_pressure for m in measurements if m.bmx_pressure is not None]

    if len(readings) < 2:
        return Alert.PressureTrend.STEADY

    delta = readings[-1] - readings[0]

    if delta <= -PRESSURE_TREND_DELTA_HPA:
        return Alert.PressureTrend.FALLING
    if delta >= PRESSURE_TREND_DELTA_HPA:
        return Alert.PressureTrend.RISING
    return Alert.PressureTrend.STEADY


def _classify(score):
    for lower_bound, severity in SEVERITY_BANDS:
        if score >= lower_bound:
            return severity
    return Alert.Severity.LOW


def evaluate_station_hydrology(station, reference_time=None):
    """
    Analyze the station's recent rainfall + pressure trend, score runoff
    risk, and open or resolve a hydrology alert as needed.

    Returns a summary dict; `alert` is the Alert that was created/left
    active, or None if risk is below the configured threshold.
    """
    # Ensure reference_time is a datetime object, not a tuple
    if reference_time is None:
        reference_time = timezone.now()
    elif isinstance(reference_time, tuple):
        # If it's a tuple, extract the first element as the datetime
        reference_time = reference_time[0] if reference_time else timezone.now()
    
    # Safety check: if it's still not a datetime, use current time
    if not isinstance(reference_time, datetime):
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"reference_time is not a datetime: {type(reference_time)}, using current time")
        reference_time = timezone.now()
    
    window_start = reference_time - timedelta(hours=settings.ALERTS_HYDROLOGY_LOOKBACK_HOURS)

    measurements = list(
        WeatherMeasurement.objects.filter(
            station=station, time__gte=window_start, time__lte=reference_time
        ).order_by("time")
    )

    if not measurements:
        return None

    totals = WeatherMeasurement.objects.filter(
        station=station, time__gte=window_start, time__lte=reference_time
    ).aggregate(
        rain_gauge_a_mm=Sum("rain_gauge_1"),
        rain_gauge_b_mm=Sum("rain_gauge_2"),
    )
    rain_a = totals["rain_gauge_a_mm"] or 0.0
    rain_b = totals["rain_gauge_b_mm"] or 0.0
    # Two gauges are redundant readings of the same rainfall — take the
    # higher one rather than averaging, so a malfunctioning/dry gauge
    # doesn't mask real rainfall the other one caught.
    effective_rainfall_mm = max(rain_a, rain_b)

    pressure_trend = _pressure_trend(measurements)

    score = min(_rainfall_score(effective_rainfall_mm) + PRESSURE_SCORE_BY_TREND[pressure_trend], 100)
    severity = _classify(score)
    recommendation = RECOMMENDATION_BY_SEVERITY[severity]

    rainfall_summary = {
        "rain_gauge_a_mm": round(rain_a, 2),
        "rain_gauge_b_mm": round(rain_b, 2),
        "effective_rainfall_mm": round(effective_rainfall_mm, 2),
        "window_hours": settings.ALERTS_HYDROLOGY_LOOKBACK_HOURS,
    }

    alert = None
    if score >= settings.ALERTS_HYDROLOGY_ALERT_THRESHOLD:
        alert = get_active_alert(station, Alert.AlertType.HYDROLOGY)
        if alert is None:
            alert = create_alert(
                station=station,
                alert_type=Alert.AlertType.HYDROLOGY,
                severity=severity,
                message=(
                    f"Runoff risk is {severity} ({score}/100) at "
                    f"{station.instrument_name}: {effective_rainfall_mm:.1f}mm "
                    f"rainfall in the last {settings.ALERTS_HYDROLOGY_LOOKBACK_HOURS}h, "
                    f"pressure {pressure_trend}."
                ),
                runoff_risk_score=score,
                rainfall_summary=rainfall_summary,
                pressure_trend=pressure_trend,
                recommendation=recommendation,
            )
    else:
        resolve_active_alert(station, Alert.AlertType.HYDROLOGY)

    return {
        "runoff_risk_score": score,
        "severity": severity,
        "recommendation": recommendation,
        "rainfall_summary": rainfall_summary,
        "pressure_trend": pressure_trend,
        "alert": alert,
    }
