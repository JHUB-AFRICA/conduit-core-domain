from django.urls import path
from .views import (
    WeatherIngestView,
    WeatherSyncLogListView,
    DefaultDateRangeView,
    InternalSyncView,
    IngestionOverviewView,
    AdminLiveSyncView,
)

urlpatterns = [
    path("ingest/", WeatherIngestView.as_view(), name="weather-ingest"),
    path("sync-logs/", WeatherSyncLogListView.as_view(), name="weather-sync-logs"),
    path("default-range/", DefaultDateRangeView.as_view(), name="weather-default-range"),
    path("internal/sync/", InternalSyncView.as_view(), name="internal-sync"),
    path("ingestion/overview/", IngestionOverviewView.as_view(), name="ingestion-overview"),
    path("ingestion/live-sync/", AdminLiveSyncView.as_view(), name="ingestion-live-sync"),
]
