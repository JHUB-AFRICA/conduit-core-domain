from django.contrib import admin
from .models import WeatherSyncLog


@admin.register(WeatherSyncLog)
class WeatherSyncLogAdmin(admin.ModelAdmin):
    list_display = (
        "requested_start",
        "requested_end",
        "status",
        "records_fetched",
        "records_created",
        "records_skipped",
        "triggered_by",
        "created_at",
    )
    list_filter = ("status",)
