from .models import WeatherAlert

Severity = WeatherAlert.Severity

WBGT_BANDS = [
    (31.0, Severity.EXTREME),
    (29.0, Severity.DANGER),
    (27.0, Severity.WARNING),
]

HEAT_INDEX_BANDS = [
    (51.0, Severity.EXTREME),
    (39.0, Severity.DANGER),
    (32.0, Severity.WARNING),
]

SEVERITY_RANK = {
    Severity.INFO: 0,
    Severity.WARNING: 1,
    Severity.DANGER: 2,
    Severity.EXTREME: 3,
}

SEVERITY_LABEL = {
    Severity.INFO: "Fine",
    Severity.WARNING: "Caution",
    Severity.DANGER: "Severe",
    Severity.EXTREME: "Extreme",
}


def _band_severity(value, bands):
    if value is None:
        return Severity.INFO
    for threshold, severity in bands:
        if value >= threshold:
            return severity
    return Severity.INFO


def compute_severity(wbgt, heat_index):
    """Returns (severity, message) for a pair of readings."""
    wbgt_severity = _band_severity(wbgt, WBGT_BANDS)
    heat_severity = _band_severity(heat_index, HEAT_INDEX_BANDS)

    severity = max(wbgt_severity, heat_severity, key=SEVERITY_RANK.get)

    if severity == Severity.INFO:
        message = "Conditions are within a safe range."
    elif severity == Severity.WARNING:
        message = "Heat stress is building — increase shade, water, and ventilation for people and livestock."
    elif severity == Severity.DANGER:
        message = "High heat stress risk — limit outdoor exertion and actively cool livestock."
    else:
        message = "Extreme heat stress risk — move people and animals to cooling/shade immediately."

    return severity, message
