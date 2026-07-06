from datetime import timedelta
from collections import defaultdict

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
    values = [value for value in values if value is not None]
    return sum(values) / len(values) if values else None


def _max(values):
    values = [value for value in values if value is not None]
    return max(values) if values else None


def build_timeline(measurements, resolution):
    """Aggregate measurements into timeline buckets."""

    buckets = defaultdict(list)

    for measurement in measurements:
        buckets[_bucket_start(measurement.time, resolution)].append(measurement)

    points = []

    for timestamp in sorted(buckets):
        rows = buckets[timestamp]

        temperatures = [
            row.bmx_temperature
            if row.bmx_temperature is not None
            else (
                row.mcp_temperature
                if row.mcp_temperature is not None
                else row.sht_temperature
            )
            for row in rows
        ]

        humidity = [row.sht_humidity for row in rows]
        wind_gusts = [row.wind_gust for row in rows]

        rain_increments = [
            row.rain_gauge_1
            if row.rain_gauge_1 is not None
            else row.rain_gauge_2
            for row in rows
        ]
        rain_increments = [
            value for value in rain_increments if value is not None
        ]

        points.append(
            {
                "timestamp": timestamp,
                "temperature_avg_c": _avg(temperatures),
                "humidity_avg_pct": _avg(humidity),
                "wind_gust_max_mps": _max(wind_gusts),
                "rain_total_mm": (
                    sum(rain_increments) if rain_increments else None
                ),
            }
        )

    return points


def build_daily_summary(measurements):
    """Aggregate measurements into daily summaries."""

    buckets = defaultdict(list)

    for measurement in measurements:
        local_time = (
            timezone.localtime(measurement.time)
            if timezone.is_aware(measurement.time)
            else measurement.time
        )

        buckets[local_time.date()].append(measurement)

    history = []

    for date in sorted(buckets, reverse=True):
        rows = buckets[date]

        temperatures = [
            row.bmx_temperature
            if row.bmx_temperature is not None
            else (
                row.mcp_temperature
                if row.mcp_temperature is not None
                else row.sht_temperature
            )
            for row in rows
        ]

        valid_temperatures = [
            value for value in temperatures if value is not None
        ]

        humidity = [row.sht_humidity for row in rows]

        rain_increments = [
            row.rain_gauge_1
            if row.rain_gauge_1 is not None
            else row.rain_gauge_2
            for row in rows
        ]
        rain_increments = [
            value for value in rain_increments if value is not None
        ]

        history.append(
            {
                "date": date,
                "temperature": {
                    "max": (
                        max(valid_temperatures)
                        if valid_temperatures
                        else None
                    ),
                    "min": (
                        min(valid_temperatures)
                        if valid_temperatures
                        else None
                    ),
                    "avg": _avg(temperatures),
                },
                "humidity_avg": _avg(humidity),
                "total_rain_mm": (
                    sum(rain_increments)
                    if rain_increments
                    else None
                ),
            }
        )

    return history


def resolution_window(
    resolution,
    latest_time,
    start=None,
    end=None,
):
    """
    Return the requested timeline window.

    Priority:
    1. User-supplied start and end.
    2. Default lookback ending at the latest measurement.
    """

    if start and end:
        return start, end

    windows = {
        "minutely": timedelta(hours=1),
        "hourly": timedelta(hours=24),
        "daily": timedelta(days=30),
    }

    end = latest_time or timezone.now()
    start = end - windows[resolution]

    return start, end