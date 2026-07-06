from django.urls import path

from .views import (
    GlobalCurrentWeatherView,
    StationCurrentWeatherView,
    StationDailySummaryView,
    StationHistoryArchiveView,
    StationListView,
    StationTimelineView,
    StationDetailView
)


urlpatterns = [
    path("stations/", StationListView.as_view(), name="station-list"),
    path("stations/current/", GlobalCurrentWeatherView.as_view(), name="station-current-global"),
    path("stations/<slug:slug>/", StationDetailView.as_view(), name="station-detail"),
    path("stations/<slug:slug>/current/", StationCurrentWeatherView.as_view(), name="station-current"),
    path("stations/<slug:slug>/timeline/", StationTimelineView.as_view(), name="station-timeline"),
    path("stations/<slug:slug>/summary/", StationDailySummaryView.as_view(), name="station-summary"),
    path("stations/<slug:slug>/history/", StationHistoryArchiveView.as_view(), name="station-history"),
]