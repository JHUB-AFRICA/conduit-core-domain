from django.urls import path
from .views import WeatherIngestView, WeatherSyncLogListView, DefaultDateRangeView

urlpatterns = [
    path("ingest/", WeatherIngestView.as_view(), name="weather-ingest"),
    path("sync-logs/", WeatherSyncLogListView.as_view(), name="weather-sync-logs"),
    path("default-range/", DefaultDateRangeView.as_view(), name="weather-default-range"),
]
