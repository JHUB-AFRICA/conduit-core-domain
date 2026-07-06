from rest_framework import serializers
from .models import WeatherSyncLog


class WeatherSyncLogSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source="station.instrument_name", read_only=True, default=None)

    class Meta:
        model = WeatherSyncLog
        fields = [
            "id",
            "station_name",
            "requested_start",
            "requested_end",
            "status",
            "records_fetched",
            "records_created",
            "records_skipped",
            "error_message",
            "triggered_by",
            "created_at",
        ]
