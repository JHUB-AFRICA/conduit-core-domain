from rest_framework import serializers
from .models import WeatherMeasurement, WeatherStation


# ============================================================================
# Station Serializers
# ============================================================================

class StationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherStation
        fields = [
            "id",
            "instrument_name",
            "sensor_id",
            "site_name",
            "latitude",
            "longitude",
            "elevation_m",
            "status",
            "slug",
        ]


class StationDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = WeatherStation
        fields = [
            "id",
            "slug",
            "instrument_name",
            "sensor_id",
            "site_name",
            "latitude",
            "longitude",
            "elevation_m",
            "status",
            "status_display",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


# ============================================================================
# Current Weather Serializers
# ============================================================================

class SystemHealthSerializer(serializers.Serializer):
    health_score = serializers.IntegerField(source="health")
    battery_voltage = serializers.FloatField(allow_null=True)
    battery_charge_status = serializers.IntegerField(allow_null=True)
    cell_signal_strength = serializers.IntegerField(allow_null=True)


class TemperatureGroupSerializer(serializers.Serializer):
    bmx = serializers.FloatField(source="bmx_temperature", allow_null=True)
    mcp = serializers.FloatField(source="mcp_temperature", allow_null=True)
    sht = serializers.FloatField(source="sht_temperature", allow_null=True)


class LightGroupSerializer(serializers.Serializer):
    visible = serializers.FloatField(source="visible_light", allow_null=True)
    infrared = serializers.FloatField(allow_null=True)
    ultraviolet = serializers.FloatField(allow_null=True)


class RainGroupSerializer(serializers.Serializer):
    gauge_1_current = serializers.FloatField(source="rain_gauge_1", allow_null=True)
    gauge_2_current = serializers.FloatField(source="rain_gauge_2", allow_null=True)
    gauge_1_today = serializers.FloatField(source="rain_gauge_1_total_today", allow_null=True)
    gauge_2_today = serializers.FloatField(source="rain_gauge_2_total_today", allow_null=True)
    gauge_1_prior = serializers.FloatField(source="rain_gauge_1_total_prior", allow_null=True)
    gauge_2_prior = serializers.FloatField(source="rain_gauge_2_total_prior", allow_null=True)


class WindGroupSerializer(serializers.Serializer):
    speed = serializers.FloatField(source="wind_speed", allow_null=True)
    direction = serializers.FloatField(source="wind_direction", allow_null=True)
    gust = serializers.FloatField(source="wind_gust", allow_null=True)
    gust_direction = serializers.FloatField(source="wind_gust_direction", allow_null=True)


class IndicesGroupSerializer(serializers.Serializer):
    heat_index = serializers.FloatField(allow_null=True)
    wet_bulb = serializers.FloatField(source="wet_bulb_temperature", allow_null=True)
    wbgt = serializers.FloatField(allow_null=True)


class WeatherReadingsSerializer(serializers.Serializer):
    temperature = TemperatureGroupSerializer(source="*")
    humidity_pct = serializers.FloatField(source="sht_humidity", allow_null=True)
    pressure_bmx = serializers.FloatField(source="bmx_pressure", allow_null=True)
    light = LightGroupSerializer(source="*")
    rain = RainGroupSerializer(source="*")
    wind = WindGroupSerializer(source="*")
    indices = IndicesGroupSerializer(source="*")


class MeasurementDataSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField()
    weather_readings = WeatherReadingsSerializer(source="*")

    class Meta:
        model = WeatherMeasurement
        fields = ["id", "time", "weather_readings"]


class CoordinatesSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class GlobalCurrentWeatherSerializer(serializers.Serializer):
    station_name = serializers.CharField(source="site_name")
    station_slug = serializers.SlugField(source="slug")
    coordinates = serializers.SerializerMethodField()
    data = serializers.SerializerMethodField()

    def get_coordinates(self, obj):
        return CoordinatesSerializer({
            "latitude": float(obj.latitude),
            "longitude": float(obj.longitude),
        }).data

    def get_data(self, obj):
        if obj.latest_measurement is None:
            return None
        return MeasurementDataSerializer(obj.latest_measurement).data


# ============================================================================
# Timeline Serializers
# ============================================================================

class RainTimelineSerializer(serializers.Serializer):
    total_mm = serializers.FloatField(allow_null=True)
    today_mm = serializers.FloatField(allow_null=True)
    yesterday_mm = serializers.FloatField(allow_null=True)


class WindTimelineSerializer(serializers.Serializer):
    speed_mps = serializers.FloatField(allow_null=True)
    direction_deg = serializers.FloatField(allow_null=True)
    gust_max_mps = serializers.FloatField(allow_null=True)
    gust_direction_deg = serializers.FloatField(allow_null=True)


class LightTimelineSerializer(serializers.Serializer):
    visible_lux = serializers.FloatField(allow_null=True)
    infrared = serializers.FloatField(allow_null=True)
    ultraviolet = serializers.FloatField(allow_null=True)


class IndicesTimelineSerializer(serializers.Serializer):
    heat_index_c = serializers.FloatField(allow_null=True)
    wet_bulb_c = serializers.FloatField(allow_null=True)
    wbgt_c = serializers.FloatField(allow_null=True)


class TimelinePointSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    temperature_avg_c = serializers.FloatField(allow_null=True)
    humidity_avg_pct = serializers.FloatField(allow_null=True)
    pressure_hpa = serializers.FloatField(allow_null=True)
    rain = RainTimelineSerializer()
    wind = WindTimelineSerializer()
    light = LightTimelineSerializer()
    indices = IndicesTimelineSerializer()


class TimelineResponseSerializer(serializers.Serializer):
    station_slug = serializers.CharField()
    resolution = serializers.ChoiceField(choices=["minutely", "hourly", "daily"])
    data_points = TimelinePointSerializer(many=True)


# ============================================================================
# Daily Summary Serializers
# ============================================================================

class TemperatureSummarySerializer(serializers.Serializer):
    max = serializers.FloatField(allow_null=True)
    min = serializers.FloatField(allow_null=True)
    avg = serializers.FloatField(allow_null=True)


class HumiditySummarySerializer(serializers.Serializer):
    avg_pct = serializers.FloatField(allow_null=True)


class PressureSummarySerializer(serializers.Serializer):
    hpa = serializers.FloatField(allow_null=True)


class RainSummarySerializer(serializers.Serializer):
    total_mm = serializers.FloatField(allow_null=True)
    today_mm = serializers.FloatField(allow_null=True)
    yesterday_mm = serializers.FloatField(allow_null=True)


class WindSummarySerializer(serializers.Serializer):
    speed_mps = serializers.FloatField(allow_null=True)
    direction_deg = serializers.FloatField(allow_null=True)
    gust_max_mps = serializers.FloatField(allow_null=True)


class LightSummarySerializer(serializers.Serializer):
    visible_lux = serializers.FloatField(allow_null=True)
    infrared = serializers.FloatField(allow_null=True)
    ultraviolet = serializers.FloatField(allow_null=True)


class IndicesSummarySerializer(serializers.Serializer):
    heat_index_c = serializers.FloatField(allow_null=True)
    wet_bulb_c = serializers.FloatField(allow_null=True)
    wbgt_c = serializers.FloatField(allow_null=True)


class DailySummaryPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    temperature = TemperatureSummarySerializer()
    humidity = HumiditySummarySerializer()
    pressure = PressureSummarySerializer()
    rain = RainSummarySerializer()
    wind = WindSummarySerializer()
    light = LightSummarySerializer()
    indices = IndicesSummarySerializer()


class DailySummaryResponseSerializer(serializers.Serializer):
    station_slug = serializers.CharField()
    aggregated_by = serializers.CharField(default="day")
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    history = DailySummaryPointSerializer(many=True)