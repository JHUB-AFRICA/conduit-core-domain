import json
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError
from telemetry.models import WeatherMeasurement, WeatherStation


def clean(value):
    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()
        if value == "" or value.lower() == "nan":
            return None

    return value


class Command(BaseCommand):
    help = "Import weather data from JSON file"

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str)
        parser.add_argument("station_id", type=str)

    def handle(self, *args, **kwargs):
        file_path = kwargs["file_path"]
        station_id = kwargs["station_id"]

        try:
            station = WeatherStation.objects.get(id=station_id)
        except WeatherStation.DoesNotExist:
            raise CommandError(
                f"WeatherStation with id={station_id} does not exist"
            )

        # Load JSON file
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                data = json.load(file)

        except Exception as e:
            raise CommandError(
                f"Could not read JSON file: {e}"
            )

        measurements = []
        skipped = 0

        for row in data:

            time_raw = row.get("Time")

            if not time_raw:
                skipped += 1
                continue

            try:
                if isinstance(time_raw, str):
                    time_obj = datetime.fromisoformat(
                        time_raw.replace("Z", "")
                    )
                else:
                    skipped += 1
                    continue

            except Exception:
                skipped += 1
                continue


            measurements.append(
                WeatherMeasurement(
                    station=station,
                    time=time_obj,

                    health=clean(row.get("Health")) or 0,

                    battery_voltage=clean(row.get("Battery Voltage")),
                    battery_charge_status=clean(row.get("Battery charge status")),
                    cell_signal_strength=clean(row.get("Cell signal strength")),

                    rain_gauge_1=clean(row.get("Rain Gauge 1")),
                    rain_gauge_2=clean(row.get("Rain Gauge 2")),
                    rain_gauge_1_total_today=clean(row.get("Rain Gauge 1 Total Today")),
                    rain_gauge_2_total_today=clean(row.get("Rain Gauge 2 Total Today")),
                    rain_gauge_1_total_prior=clean(row.get("Rain Gauge 1 Total Prior")),
                    rain_gauge_2_total_prior=clean(row.get("Rain Gauge 2 Total Prior")),

                    bmx_temperature=clean(row.get("BMX Temperature 1")),
                    bmx_pressure=clean(row.get("BMX Pressure 1")),
                    mcp_temperature=clean(row.get("MCP Temperature 1")),

                    sht_temperature=clean(row.get("SHT Temperature")),
                    sht_humidity=clean(row.get("SHT Humidity")),

                    visible_light=clean(row.get("SI1145 Visible 1")),
                    infrared=clean(row.get("SI1145 Infrared 1")),
                    ultraviolet=clean(row.get("SI1145 Ultraviolet 1")),

                    wind_speed=clean(row.get("Wind Speed")),
                    wind_direction=clean(row.get("Wind Direction")),
                    wind_gust=clean(row.get("Wind Gust")),
                    wind_gust_direction=clean(row.get("Wind Gust Direction")),

                    heat_index=clean(row.get("Heat Index")),
                    wet_bulb_temperature=clean(row.get("Wet Bulb Temperature")),
                    wbgt=clean(row.get("Wet Bulb Globe Temperature")),
                )
            )


        WeatherMeasurement.objects.bulk_create(
            measurements,
            batch_size=500
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {len(measurements)} weather measurements"
                + (
                    f" ({skipped} rows skipped)"
                    if skipped
                    else ""
                )
            )
        )