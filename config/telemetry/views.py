from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets

from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Max, Min
from django.db.models.functions import TruncDate

from .models import WeatherMeasurement, WeatherStation
from .serializers import (
    WeatherStationSerializer,
    CurrentWeatherSerializer,
    WeatherTrendSerializer,
    WeatherHistorySerializer,
    DailyWeatherSerializer
)

from .permissions import IsReadOnlyOrAdmin
from .pagination import WeatherPagination



class WeatherStationViewSet(viewsets.ModelViewSet):
    queryset = WeatherStation.objects.all()
    serializer_class = WeatherStationSerializer
    lookup_field = "id"
    permission_classes = [IsReadOnlyOrAdmin]



class CurrentWeatherView(APIView):
    def get(self, request):
        latest = WeatherMeasurement.objects.order_by("-time").first()

        if not latest:
            return Response({"detail": "No data available"}, status=404)

        serializer = CurrentWeatherSerializer(latest)
        return Response(serializer.data)



class MinutelyWeatherView(APIView):
    def get(self, request):
        now = timezone.now()
        past_hour = now - timedelta(hours=1)

        qs = WeatherMeasurement.objects.filter(
            time__range=(past_hour, now)
        ).order_by("time")

        serializer = WeatherTrendSerializer(qs, many=True)
        return Response(serializer.data)


class HourlyWeatherView(APIView):
    def get(self, request):
        now = timezone.now()
        past_24h = now - timedelta(hours=24)

        qs = WeatherMeasurement.objects.filter(
            time__range=(past_24h, now)
        ).order_by("time")

        serializer = WeatherTrendSerializer(qs, many=True)
        return Response(serializer.data)



class DailyWeatherView(APIView):
    def get(self, request):
        qs = WeatherMeasurement.objects.annotate(
            day=TruncDate("time")
        ).values("day").annotate(
            avg_temp=Avg("sht_temperature"),
            max_temp=Max("sht_temperature"),
            min_temp=Min("sht_temperature"),
            avg_humidity=Avg("sht_humidity"),
        ).order_by("day")

        serializer = DailyWeatherSerializer(qs, many=True)
        return Response(serializer.data)


class HistoricalWeatherView(APIView):
    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        qs = WeatherMeasurement.objects.all().order_by("-time")

        if start and end:
            qs = qs.filter(time__range=(start, end))

        paginator = WeatherPagination()
        page = paginator.paginate_queryset(qs, request)

        serializer = WeatherHistorySerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)