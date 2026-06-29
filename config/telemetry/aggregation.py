from collections import defaultdict
from datetime import timedelta

from django.utils import timezone


def _bucket_start(dt, resolution):
    if resolution == "minutely":
        return dt.replace(second=0, microsecond=0)
    if resolution == "hourly":
        return dt.replace(minute=0, second=0, microsecond=0)
    if resolution == "daily":
        return dt.replace(hour=0, minute=0, second=0, microsecond=0)
    raise ValueError(f"Unknown resolution: {resolution}")


def _avg(values):
    values = [v for v in values if v is not None]
    return sum(values) / len(values) if values else None


def _max(values):
    values = [v for v in values if v is not None]
    return max(values) if values else None


def build_timeline(measurements, resolution):


    buckets = defaultdict(list)
    for m in measurements:
        buckets[_bucket_start(m.time, resolution)].append(m)

    points = []
    for ts in sorted(buckets):
        rows = buckets[ts]

        temps = [
            row.bmx_temperature
            if row.bmx_temperature is not None
            else (row.mcp_temperature if row.mcp_temperature is not None else row.sht_temperature)
            for row in rows
        ]
        humidity = [row.sht_humidity for row in rows]
        gusts = [row.wind_gust for row in rows]

        # Rain total for the bucket: sum of instantaneous gauge readings
        # (rain_gauge_1, falling back to rain_gauge_2 per row), which
        # represent the rain captured since the last sample tick.
        rain_increments = [
            row.rain_gauge_1 if row.rain_gauge_1 is not None else row.rain_gauge_2
            for row in rows
        ]
        rain_increments = [v for v in rain_increments if v is not None]
        rain_total = sum(rain_increments) if rain_increments else None

        points.append({
            "timestamp": ts,
            "temperature_avg_c": _avg(temps),
            "humidity_avg_pct": _avg(humidity),
            "wind_gust_max_mps": _max(gusts),
            "rain_total_mm": rain_total,
        })

    return points


def build_daily_summary(measurements):
  

    buckets = defaultdict(list)
    for m in measurements:
        local_time = timezone.localtime(m.time) if timezone.is_aware(m.time) else m.time
        buckets[local_time.date()].append(m)

    history = []
    for date in sorted(buckets, reverse=True):
        rows = buckets[date]

        temps = [
            row.bmx_temperature
            if row.bmx_temperature is not None
            else (row.mcp_temperature if row.mcp_temperature is not None else row.sht_temperature)
            for row in rows
        ]
        temps_clean = [t for t in temps if t is not None]
        humidity = [row.sht_humidity for row in rows]

        rain_increments = [
            row.rain_gauge_1 if row.rain_gauge_1 is not None else row.rain_gauge_2
            for row in rows
        ]
        rain_increments = [v for v in rain_increments if v is not None]

        history.append({
            "date": date,
            "temperature": {
                "max": max(temps_clean) if temps_clean else None,
                "min": min(temps_clean) if temps_clean else None,
                "avg": _avg(temps),
            },
            "humidity_avg": _avg(humidity),
            "total_rain_mm": sum(rain_increments) if rain_increments else None,
        })

    return history


def resolution_window(resolution, now=None):
    """Returns (start, end) datetimes for the default lookback window per resolution."""
    now = now or timezone.now()
    windows = {
        "minutely": timedelta(hours=1),
        "hourly": timedelta(hours=24),
        "daily": timedelta(days=30),
    }
    return now - windows[resolution], now