from datetime import timedelta
from collections import defaultdict
from django.utils import timezone


# ============================================================================
# Helper Functions
# ============================================================================

def _bucket_start(dt, resolution):
    """Get the start of the bucket for a given resolution."""
    if resolution == "minutely":
        return dt.replace(second=0, microsecond=0)
    if resolution == "hourly":
        return dt.replace(minute=0, second=0, microsecond=0)
    if resolution == "daily":
        return dt.replace(hour=0, minute=0, second=0, microsecond=0)
    raise ValueError(f"Unknown resolution: {resolution}")


def _avg(values):
    """Calculate average of list, return None if empty."""
    values = [v for v in values if v is not None]
    return sum(values) / len(values) if values else None


def _max(values):
    """Calculate max of list, return None if empty."""
    values = [v for v in values if v is not None]
    return max(values) if values else None


def _sum(values):
    """Calculate sum of list, return None if empty."""
    values = [v for v in values if v is not None]
    return sum(values) if values else None


def _mode(values):
    """Calculate mode (most common value) of list, return None if empty."""
    values = [v for v in values if v is not None]
    if not values:
        return None
    from collections import Counter
    return Counter(values).most_common(1)[0][0]


def resolution_window(resolution, latest_time, start=None, end=None):
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


# ============================================================================
# Timeline Builder
# ============================================================================

def build_timeline(measurements, resolution):
    """Aggregate measurements into timeline buckets."""
    buckets = defaultdict(list)

    for measurement in measurements:
        buckets[_bucket_start(measurement.time, resolution)].append(measurement)

    points = []

    for timestamp in sorted(buckets):
        rows = buckets[timestamp]

        # Temperature - prefer BMX, fallback to MCP, then SHT
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

        # Humidity - prefer SHT
        humidity = [row.sht_humidity for row in rows if row.sht_humidity is not None]
        
        # Pressure - BMX
        pressure = [row.bmx_pressure for row in rows if row.bmx_pressure is not None]
        
        # Rain - total accumulation
        rain_total = []
        for row in rows:
            if row.rain_gauge_1 is not None:
                rain_total.append(row.rain_gauge_1)
            elif row.rain_gauge_2 is not None:
                rain_total.append(row.rain_gauge_2)
        
        # Rain - today's total
        rain_today = []
        for row in rows:
            if row.rain_gauge_1_total_today is not None:
                rain_today.append(row.rain_gauge_1_total_today)
            elif row.rain_gauge_2_total_today is not None:
                rain_today.append(row.rain_gauge_2_total_today)
        
        # Rain - yesterday's total
        rain_yesterday = []
        for row in rows:
            if row.rain_gauge_1_total_prior is not None:
                rain_yesterday.append(row.rain_gauge_1_total_prior)
            elif row.rain_gauge_2_total_prior is not None:
                rain_yesterday.append(row.rain_gauge_2_total_prior)
        
        # Wind - Speed (average) and Gust (max)
        wind_speed = [row.wind_speed for row in rows if row.wind_speed is not None]
        wind_gust = [row.wind_gust for row in rows if row.wind_gust is not None]
        
        # Wind Direction - use mode (most common direction) instead of average
        wind_direction = [row.wind_direction for row in rows if row.wind_direction is not None]
        wind_gust_direction = [row.wind_gust_direction for row in rows if row.wind_gust_direction is not None]
        
        # Light
        visible_light = [row.visible_light for row in rows if row.visible_light is not None]
        infrared = [row.infrared for row in rows if row.infrared is not None]
        ultraviolet = [row.ultraviolet for row in rows if row.ultraviolet is not None]
        
        # Derived metrics
        heat_index = [row.heat_index for row in rows if row.heat_index is not None]
        wet_bulb = [
            row.wet_bulb_temperature for row in rows if row.wet_bulb_temperature is not None
        ]
        wbgt = [row.wbgt for row in rows if row.wbgt is not None]

        points.append({
            "timestamp": timestamp,
            "temperature_avg_c": _avg(temperatures),
            "humidity_avg_pct": _avg(humidity),
            "pressure_hpa": _avg(pressure),
            "rain": {
                "total_mm": _sum(rain_total),
                "today_mm": _avg(rain_today),
                "yesterday_mm": _avg(rain_yesterday)
            },
            "wind": {
                "speed_mps": _avg(wind_speed),  # Average wind speed
                "direction_deg": _mode(wind_direction),  # Most common direction
                "gust_max_mps": _max(wind_gust),  # Max gust
                "gust_direction_deg": _mode(wind_gust_direction)  # Most common gust direction
            },
            "light": {
                "visible_lux": _avg(visible_light),
                "infrared": _avg(infrared),
                "ultraviolet": _avg(ultraviolet)
            },
            "indices": {
                "heat_index_c": _avg(heat_index),
                "wet_bulb_c": _avg(wet_bulb),
                "wbgt_c": _avg(wbgt)
            }
        })

    return points


# ============================================================================
# Daily Summary Builder
# ============================================================================

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

        # Temperature - prefer BMX, fallback to MCP, then SHT
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

        valid_temperatures = [v for v in temperatures if v is not None]

        # Humidity - SHT
        humidity = [row.sht_humidity for row in rows if row.sht_humidity is not None]

        # Pressure - BMX
        pressure = [row.bmx_pressure for row in rows if row.bmx_pressure is not None]

        # Rain - total accumulation
        rain_total = []
        for row in rows:
            if row.rain_gauge_1 is not None:
                rain_total.append(row.rain_gauge_1)
            elif row.rain_gauge_2 is not None:
                rain_total.append(row.rain_gauge_2)

        # Rain - today's total
        rain_today = []
        for row in rows:
            if row.rain_gauge_1_total_today is not None:
                rain_today.append(row.rain_gauge_1_total_today)
            elif row.rain_gauge_2_total_today is not None:
                rain_today.append(row.rain_gauge_2_total_today)

        # Rain - yesterday's total
        rain_yesterday = []
        for row in rows:
            if row.rain_gauge_1_total_prior is not None:
                rain_yesterday.append(row.rain_gauge_1_total_prior)
            elif row.rain_gauge_2_total_prior is not None:
                rain_yesterday.append(row.rain_gauge_2_total_prior)

        # Wind - Speed (average) and Gust (max)
        wind_speed = [row.wind_speed for row in rows if row.wind_speed is not None]
        wind_gust = [row.wind_gust for row in rows if row.wind_gust is not None]
        
        # Wind Direction - use mode (most common direction) instead of average
        wind_direction = [row.wind_direction for row in rows if row.wind_direction is not None]

        # Light
        visible_light = [row.visible_light for row in rows if row.visible_light is not None]
        infrared = [row.infrared for row in rows if row.infrared is not None]
        ultraviolet = [row.ultraviolet for row in rows if row.ultraviolet is not None]

        # Derived metrics
        heat_index = [row.heat_index for row in rows if row.heat_index is not None]
        wet_bulb = [
            row.wet_bulb_temperature for row in rows if row.wet_bulb_temperature is not None
        ]
        wbgt = [row.wbgt for row in rows if row.wbgt is not None]

        history.append({
            "date": date,
            "temperature": {
                "max": _max(valid_temperatures),
                "min": min(valid_temperatures) if valid_temperatures else None,
                "avg": _avg(temperatures),
            },
            "humidity": {
                "avg_pct": _avg(humidity),
            },
            "pressure": {
                "hpa": _avg(pressure),
            },
            "rain": {
                "total_mm": _sum(rain_total),
                "today_mm": _avg(rain_today),
                "yesterday_mm": _avg(rain_yesterday),
            },
            "wind": {
                "speed_mps": _avg(wind_speed),  # Average wind speed
                "direction_deg": _mode(wind_direction),  # Most common direction
                "gust_max_mps": _max(wind_gust),  # Max gust
            },
            "light": {
                "visible_lux": _avg(visible_light),
                "infrared": _avg(infrared),
                "ultraviolet": _avg(ultraviolet),
            },
            "indices": {
                "heat_index_c": _avg(heat_index),
                "wet_bulb_c": _avg(wet_bulb),
                "wbgt_c": _avg(wbgt),
            }
        })

    return history