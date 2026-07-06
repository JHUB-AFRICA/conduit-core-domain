"""
Pulls readings from 3D-FEWSNET into WeatherMeasurement.

Uses bulk_create() for speed — there is currently no model signal on
WeatherMeasurement that depends on row-by-row .save(). If a future alert
system (or anything else) needs to react to each new measurement via
post_save, this will need to switch back to individual .save() calls,
since bulk_create() does not fire that signal.
"""

import logging
from datetime import date, datetime, timedelta
from datetime import timezone as dt_timezone

from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.utils.timezone import is_naive, make_aware

from telemetry.models import WeatherStation, WeatherMeasurement
from ingestion.models import WeatherSyncLog
from ingestion.services.client import fetch_station_properties, FewsnetError

logger = logging.getLogger(__name__)

# Readings arrive roughly once a minute, so a wide date range is a large
# payload. Chunking keeps each external request small and means one bad
# chunk doesn't cost you the whole run.
CHUNK_DAYS = 5

SHORTNAME_TO_FIELD = {
    "hth": "health",
    "bv": "battery_voltage",
    "bcs": "battery_charge_status",
    "css": "cell_signal_strength",
    "rg": "rain_gauge_1",
    "rg2": "rain_gauge_2",
    "rgt": "rain_gauge_1_total_today",
    "rgt2": "rain_gauge_2_total_today",
    "rgp": "rain_gauge_1_total_prior",
    "rgp2": "rain_gauge_2_total_prior",
    "bt1": "bmx_temperature",
    "bp1": "bmx_pressure",
    "mt1": "mcp_temperature",
    "st1": "sht_temperature",
    "sh1": "sht_humidity",
    "sv1": "visible_light",
    "si1": "infrared",
    "su1": "ultraviolet",
    "ws": "wind_speed",
    "wd": "wind_direction",
    "wg": "wind_gust",
    "wgd": "wind_gust_direction",
    "hi": "heat_index",
    "wbt": "wet_bulb_temperature",
    "wbgt": "wbgt",
}


class IngestError(Exception):
    pass


def _parse_date(value):
    if isinstance(value, date):
        return value
    return datetime.strptime(value, "%Y-%m-%d").date()


def _daterange_chunks(start_date, end_date, chunk_days=CHUNK_DAYS):
    current = start_date
    while current <= end_date:
        chunk_end = min(current + timedelta(days=chunk_days - 1), end_date)
        yield current, chunk_end
        current = chunk_end + timedelta(days=1)


def _to_aware_datetime(time_str):
    dt = parse_datetime(time_str)
    if dt is None:
        return None
    if is_naive(dt):
        dt = make_aware(dt, timezone=dt_timezone.utc)
    return dt


def _get_or_create_station(props):
    sensor_id = int(props.get("sensor_id", 61))
    station, _ = WeatherStation.objects.get_or_create(
        sensor_id=sensor_id,
        defaults={
            "instrument_name": props.get("instrument", "Unknown instrument"),
            "site_name": props.get("site", "Unknown site"),
        },
    )
    return station


def run_ingest(start_date, end_date=None, triggered_by=""):
    """
    Fetch and store readings for [start_date, end_date] inclusive.
    end_date defaults to yesterday. Returns a summary dict.
    Raises IngestError only if every chunk failed to reach the API.
    """
    start_date = _parse_date(start_date)
    end_date = _parse_date(end_date) if end_date else date.today() - timedelta(days=1)

    if start_date > end_date:
        raise IngestError("start_date must be on or before end_date")

    total_fetched = 0
    total_created = 0
    total_skipped = 0
    station = None
    had_any_success = False
    errors = []

    for chunk_start, chunk_end in _daterange_chunks(start_date, end_date):
        try:
            props = fetch_station_properties(chunk_start, chunk_end)
        except FewsnetError as exc:
            errors.append(f"{chunk_start}–{chunk_end}: {exc}")
            continue

        if props is None:
            continue

        if station is None:
            station = _get_or_create_station(props)

        records = props.get("data", [])
        total_fetched += len(records)

        existing_times = set(
            WeatherMeasurement.objects.filter(station=station).values_list("time", flat=True)
        )

        to_create = []
        for record in records:
            time_str = record.get("time")
            if not time_str:
                continue
            time_val = _to_aware_datetime(time_str)
            if time_val is None or time_val in existing_times:
                total_skipped += 1
                continue

            measurements = record.get("measurements", {})
            field_values = {
                SHORTNAME_TO_FIELD[k]: v
                for k, v in measurements.items()
                if k in SHORTNAME_TO_FIELD
            }

            to_create.append(
                WeatherMeasurement(
                    station=station,
                    time=time_val,
                    is_test=(str(record.get("test", "false")).lower() == "true"),
                    **field_values,
                )
            )
            existing_times.add(time_val)  # guard against dupes within the same chunk

        with transaction.atomic():
            created = WeatherMeasurement.objects.bulk_create(to_create, ignore_conflicts=True)

        total_created += len(created)
        had_any_success = True

    if not had_any_success and errors:
        WeatherSyncLog.objects.create(
            station=station,
            requested_start=start_date,
            requested_end=end_date,
            status=WeatherSyncLog.SyncStatus.FAILED,
            records_fetched=total_fetched,
            records_created=total_created,
            records_skipped=total_skipped,
            error_message="; ".join(errors),
            triggered_by=triggered_by,
        )
        raise IngestError("; ".join(errors))

    log_status = WeatherSyncLog.SyncStatus.PARTIAL if errors else WeatherSyncLog.SyncStatus.SUCCESS
    log = WeatherSyncLog.objects.create(
        station=station,
        requested_start=start_date,
        requested_end=end_date,
        status=log_status,
        records_fetched=total_fetched,
        records_created=total_created,
        records_skipped=total_skipped,
        error_message="; ".join(errors),
        triggered_by=triggered_by,
    )

    return {
        "sync_id": str(log.id),
        "station": station.instrument_name if station else None,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "fetched": total_fetched,
        "created": total_created,
        "skipped_duplicates": total_skipped,
        "status": log_status,
        "errors": errors,
    }
