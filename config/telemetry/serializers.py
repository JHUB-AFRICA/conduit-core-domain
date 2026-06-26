from rest_framework import serializers
from .models import WeatherMeasurement, WeatherStation


class CurrentWeatherSerializer(serializers.ModelSerializer):
    temperature = serializers.FloatField(source="sht_temperature")
    humidity = serializers.FloatField(source="sht_humidity")
    rain = serializers.FloatField(source="rain_gauge_1_total_today")

    class Meta:
        model = WeatherMeasurement
        fields = [
            "time",
            "temperature",
            "humidity",
            "wind_speed",
            "rain",
            "heat_index",
            "wbgt",
        ]



class WeatherTrendSerializer(serializers.ModelSerializer):
    temperature = serializers.FloatField(source="sht_temperature")
    humidity = serializers.FloatField(source="sht_humidity")
    rain = serializers.FloatField(source="rain_gauge_1")

    class Meta:
        model = WeatherMeasurement
        fields = [
            "time",
            "temperature",
            "humidity",
            "wind_speed",
            "rain",
            "wbgt",
        ]


class WeatherHistorySerializer(serializers.ModelSerializer):
    temperature = serializers.FloatField(source="sht_temperature")
    humidity = serializers.FloatField(source="sht_humidity")
    rain = serializers.FloatField(source="rain_gauge_1")

    class Meta:
        model = WeatherMeasurement
        fields = [
            "time",
            "temperature",
            "humidity",
            "rain",
            "wbgt",
        ]



class DailyWeatherSerializer(serializers.Serializer):
    day = serializers.DateField()
    avg_temp = serializers.FloatField()
    max_temp = serializers.FloatField()
    min_temp = serializers.FloatField()
    avg_humidity = serializers.FloatField()



class WeatherStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherStation
        fields = "__all__"







