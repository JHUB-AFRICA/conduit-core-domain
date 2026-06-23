from django.urls import path
from .views import (
    CurrentWeatherView,
    MinutelyWeatherView,
    HourlyWeatherView,
    DailyWeatherView,
    HistoricalWeatherView,
    WeatherStationViewSet
)

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"stations", WeatherStationViewSet, basename="stations")

urlpatterns = [
    path("current/", CurrentWeatherView.as_view(), name="current-weather"),
    path("minutely/", MinutelyWeatherView.as_view(), name="minutely-weather"),
    path("hourly/", HourlyWeatherView.as_view(), name="hourly-weather"),
    path("daily/", DailyWeatherView.as_view(), name="daily-weather"),
    path("history/", HistoricalWeatherView.as_view(), name="historical-weather"),
]

urlpatterns += router.urls