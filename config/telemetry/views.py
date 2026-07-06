from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework import permissions
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.authentication import APIKeyAuthentication

from .aggregation import build_daily_summary, build_timeline, resolution_window
from .models import WeatherMeasurement, WeatherStation
from .pagination import HistoryPagination
from .serializers import (
    DailySummaryResponseSerializer,
    GlobalCurrentWeatherSerializer,
    MeasurementDataSerializer,
    StationDetailSerializer,
    StationListSerializer,
    TimelineResponseSerializer,
)


def get_station_or_404(slug):
    try:
        return WeatherStation.objects.get(slug=slug)
    except WeatherStation.DoesNotExist:
        raise NotFound("Weather station not found.")


class StationListView(ListAPIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StationListSerializer
    queryset = WeatherStation.objects.all().order_by("instrument_name")
    pagination_class = None


class StationDetailView(RetrieveAPIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StationDetailSerializer
    queryset = WeatherStation.objects.all()

    lookup_field = "slug"
    lookup_url_kwarg = "slug"


class GlobalCurrentWeatherView(ListAPIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GlobalCurrentWeatherSerializer
    pagination_class = None

    def get_queryset(self):
        stations = list(
            WeatherStation.objects.filter(status=WeatherStation.Status.ACTIVE)
        )

        station_ids = [station.id for station in stations]
        latest_by_station = {}

        measurements = (
            WeatherMeasurement.objects.filter(station_id__in=station_ids)
            .order_by("station_id", "-time")
        )

        for measurement in measurements:
            if measurement.station_id not in latest_by_station:
                latest_by_station[measurement.station_id] = measurement

        for station in stations:
            station.latest_measurement = latest_by_station.get(station.id)

        return stations


class StationCurrentWeatherView(APIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        station = get_station_or_404(slug)

        latest = (
            WeatherMeasurement.objects.filter(station=station)
            .order_by("-time")
            .first()
        )

        if latest is None:
            return Response(
                {"detail": "No measurements recorded for this station yet."},
                status=404,
            )

        return Response(MeasurementDataSerializer(latest).data)


class StationTimelineView(APIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    VALID_RESOLUTIONS = {"minutely", "hourly", "daily"}

    def get(self, request, slug):
        station = get_station_or_404(slug)

        resolution = request.query_params.get("resolution", "hourly")

        if resolution not in self.VALID_RESOLUTIONS:
            return Response(
                {
                    "detail": (
                        f"Invalid resolution '{resolution}'. "
                        "Must be one of: minutely, hourly, daily."
                    )
                },
                status=400,
            )

        latest = (
            WeatherMeasurement.objects.filter(station=station)
            .order_by("-time")
            .first()
        )

        if latest is None:
            payload = {
                "station_slug": station.slug,
                "resolution": resolution,
                "data_points": [],
            }
            return Response(TimelineResponseSerializer(payload).data)

        start_param = request.query_params.get("start")
        end_param = request.query_params.get("end")

        if bool(start_param) != bool(end_param):
            return Response(
                {"detail": "Both 'start' and 'end' must be supplied together."},
                status=400,
            )

        start = parse_datetime(start_param) if start_param else None
        end = parse_datetime(end_param) if end_param else None

        start, end = resolution_window(
            resolution=resolution,
            latest_time=latest.time,
            start=start,
            end=end,
        )

        measurements = (
            WeatherMeasurement.objects.filter(
                station=station,
                time__gte=start,
                time__lte=end,
            )
            .order_by("time")
        )

        data_points = build_timeline(measurements, resolution)

        payload = {
            "station_slug": station.slug,
            "resolution": resolution,
            "data_points": data_points,
        }

        return Response(TimelineResponseSerializer(payload).data)


class StationDailySummaryView(APIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    DEFAULT_LOOKBACK_DAYS = 30

    def get(self, request, slug):
        station = get_station_or_404(slug)

        end = timezone.now()
        start = end - timezone.timedelta(days=self.DEFAULT_LOOKBACK_DAYS)

        measurements = (
            WeatherMeasurement.objects.filter(
                station=station,
                time__gte=start,
                time__lte=end,
            )
            .order_by("time")
        )

        history = build_daily_summary(measurements)

        payload = {
            "station_slug": station.slug,
            "aggregated_by": "day",
            "history": history,
        }

        return Response(DailySummaryResponseSerializer(payload).data)


class StationHistoryArchiveView(ListAPIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeasurementDataSerializer
    pagination_class = HistoryPagination

    def get_queryset(self):
        station = get_station_or_404(self.kwargs["slug"])

        queryset = WeatherMeasurement.objects.filter(
            station=station
        ).order_by("-time")

        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(time__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(time__date__lte=end_date)

        return queryset