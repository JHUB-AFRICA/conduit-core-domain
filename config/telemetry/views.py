from django.utils import timezone
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.views import APIView
from .pagination import HistoryPagination
from rest_framework.reverse import reverse
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from accounts.authentication import APIKeyAuthentication
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import WeatherAlert, WeatherMeasurement, WeatherStation
from .aggregation import build_daily_summary, build_timeline, resolution_window
from .serializers import (
    DailySummaryResponseSerializer,
    GlobalCurrentWeatherSerializer,
    MeasurementDataSerializer,
    StationListSerializer,
    TimelineResponseSerializer,
    StationDetailSerializer,
    WeatherAlertSerializer,
)

def get_station_or_404(slug):

    try:
        return WeatherStation.objects.get(slug=slug)
    except WeatherStation.DoesNotExist:
        raise NotFound("Weather station not found.")


class APIRootView(APIView):

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):

        def templated(name):

            url = reverse(name, request=request, kwargs={"slug": "placeholder-slug"})
            return url.replace("placeholder-slug", "{slug}")

        return Response({
            "message": "Welcome to the Conduit Weather API.",
            "description": (
                "This API serves live and historical weather telemetry, "
                "station metadata, and heat-stress alerts from Conduit "
                "weather stations. Most endpoints require an API key "
                "(header: X-API-KEY). See 'authentication' below to get one."
            ),
            "authentication": {
                "signup": reverse("signup", request=request),
                "login": reverse("login", request=request),
                "refresh": reverse("refresh", request=request),
                "me": reverse("me", request=request),
                "create_api_key": reverse("api-key-create", request=request),
                "note": (
                    "Sign up, log in to get a JWT, then create an API key "
                    "via create_api_key. Use that key as X-API-KEY on all "
                    "endpoints below."
                ),
            },
            "stations": {
                "list": reverse("station-list", request=request),
                "detail": templated("station-detail"),
                "current_all": reverse("station-current-global", request=request),
                "current_one": templated("station-current"),
                "timeline": templated("station-timeline"),
                "summary": templated("station-summary"),
                "history": templated("station-history"),
            },
            "alerts": {
                "current_all": reverse("alerts-current", request=request),
                "history_one": templated("station-alerts"),
            },
        })



class StationListView(ListAPIView):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StationListSerializer
    queryset = WeatherStation.objects.all().order_by("instrument_name")
    pagination_class = None  # doc shows a plain list, not a paginated envelope

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
        stations = list(WeatherStation.objects.filter(status=WeatherStation.Status.ACTIVE))
        station_ids = [s.id for s in stations]
        latest_by_station = {}
        measurements = (
            WeatherMeasurement.objects.filter(station_id__in=station_ids)
            .order_by("station_id", "-time")
        )
        for m in measurements:
            if m.station_id not in latest_by_station:
                latest_by_station[m.station_id] = m

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
                {"detail": f"Invalid resolution '{resolution}'. Must be one of: minutely, hourly, daily."},
                status=400,
            )

        start, end = resolution_window(resolution)
        measurements = WeatherMeasurement.objects.filter(
            station=station, time__gte=start, time__lte=end
        ).order_by("time")

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

        measurements = WeatherMeasurement.objects.filter(
            station=station, time__gte=start, time__lte=end
        ).order_by("time")

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
        qs = WeatherMeasurement.objects.filter(station=station).order_by("-time")

        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if start_date:
            qs = qs.filter(time__date__gte=start_date)
        if end_date:
            qs = qs.filter(time__date__lte=end_date)

        return qs


class CurrentAlertsView(APIView):

    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        latest_alerts = []
        stations = WeatherStation.objects.filter(status=WeatherStation.Status.ACTIVE)

        for station in stations:
            alert = station.alerts.order_by("-time").first()
            if alert is not None:
                latest_alerts.append(alert)

        latest_alerts.sort(key=lambda a: a.time, reverse=True)
        return Response(WeatherAlertSerializer(latest_alerts, many=True).data)


class StationAlertHistoryView(ListAPIView):

    authentication_classes = [APIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WeatherAlertSerializer
    pagination_class = HistoryPagination

    def get_queryset(self):
        station = get_station_or_404(self.kwargs["slug"])
        return WeatherAlert.objects.filter(station=station).order_by("-time")
