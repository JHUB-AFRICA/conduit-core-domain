import logging
import secrets as secrets_module
from datetime import date, timedelta

from django.conf import settings
from django.db.models import Count, Max, Q
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WeatherSyncLog
from .serializers import WeatherSyncLogSerializer
from .services.ingest import run_ingest, run_latest_sync, IngestError
from telemetry.models import WeatherMeasurement, WeatherStation

logger = logging.getLogger(__name__)


class WeatherIngestView(APIView):
    """
    POST { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" (optional) }
    end_date defaults to yesterday.

    Uses the project's default JWT authentication (see accounts app) —
    this is an admin dashboard action, not an external API-key consumer,
    so it's gated on is_staff rather than the APIKeyAuthentication used
    by telemetry's read endpoints.
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date") or None

        if not start_date:
            return Response(
                {"error": "start_date is required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = run_ingest(
                start_date=start_date,
                end_date=end_date,
                triggered_by=getattr(request.user, "email", "admin"),
            )
        except IngestError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_200_OK)


class AdminLiveSyncView(APIView):
    """
    POST /api/v1/ingestion/live-sync/

    Staff-facing equivalent of the GitHub Actions cron job — runs
    run_latest_sync() (fetch anything newer than what's already stored)
    on demand from the admin console. Distinct from InternalSyncView:
    this is IsAdminUser + JWT, not the shared-secret header, since it's
    a logged-in person clicking a button rather than a scheduled job.
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        try:
            result = run_latest_sync(triggered_by=getattr(request.user, "email", "admin"))
        except IngestError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result, status=status.HTTP_200_OK)


class InternalSyncView(APIView):
    """
    POST /api/internal/sync/

    Called every 15 minutes by GitHub Actions (or EasyCron) — not by a
    logged-in user, so it's authenticated by a shared-secret header
    instead of JWT/API keys:

        X-SYNC-TOKEN: <SYNC_SECRET_TOKEN>

    Finds the latest measurement already in Postgres and fetches only
    what's newer than that from 3D-FEWSNET (see run_latest_sync()).
    """

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.SYNC_SECRET_TOKEN:
            logger.error("SYNC_SECRET_TOKEN is not configured — refusing internal sync request.")
            return Response(
                {"error": "Internal sync is not configured on this server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        provided_token = request.headers.get("X-SYNC-TOKEN", "")
        if not secrets_module.compare_digest(provided_token, settings.SYNC_SECRET_TOKEN):
            return Response({"error": "Invalid or missing X-SYNC-TOKEN."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            result = run_latest_sync(triggered_by="github-actions")
        except IngestError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result, status=status.HTTP_200_OK)


class WeatherSyncLogListView(APIView):
    """GET recent ingestion runs, most recent first.

    Accepts an optional ?limit= query param (default 20, capped at 100)
    so the admin console can page through more history than the default
    dashboard view needs.
    """

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            limit = int(request.query_params.get("limit", 20))
        except (TypeError, ValueError):
            limit = 20
        limit = max(1, min(limit, 100))

        logs = WeatherSyncLog.objects.select_related("station").all()[:limit]
        return Response(WeatherSyncLogSerializer(logs, many=True).data)


class IngestionOverviewView(APIView):
    """
    GET a single-call snapshot for the admin ingestion console:
    per-station coverage, recent throughput, and sync run health.

    Kept as one aggregated endpoint (rather than several small ones) so
    the dashboard loads with one round trip.
    """

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)

        stations = list(
            WeatherStation.objects.annotate(
                measurement_count=Count("measurements"),
                latest_measurement_time=Max("measurements__time"),
                records_last_24h=Count(
                    "measurements", filter=Q(measurements__time__gte=last_24h)
                ),
            ).order_by("instrument_name")
        )

        station_data = [
            {
                "id": str(s.id),
                "instrument_name": s.instrument_name,
                "sensor_id": s.sensor_id,
                "site_name": s.site_name,
                "status": s.status,
                "measurement_count": s.measurement_count,
                "records_last_24h": s.records_last_24h,
                "latest_measurement_time": s.latest_measurement_time,
                # How stale this station's feed is, in minutes — lets the
                # UI flag a station that's stopped reporting even though
                # the last sync run technically "succeeded".
                "minutes_since_last_reading": (
                    round((now - s.latest_measurement_time).total_seconds() / 60)
                    if s.latest_measurement_time
                    else None
                ),
            }
            for s in stations
        ]

        total_measurements = WeatherMeasurement.objects.count()
        records_last_24h = WeatherMeasurement.objects.filter(time__gte=last_24h).count()
        records_last_7d = WeatherMeasurement.objects.filter(time__gte=last_7d).count()

        recent_runs = list(WeatherSyncLog.objects.all()[:20])
        last_run = recent_runs[0] if recent_runs else None

        run_counts = {"success": 0, "partial": 0, "failed": 0}
        for run in recent_runs:
            if run.status in run_counts:
                run_counts[run.status] += 1

        yesterday = date.today() - timedelta(days=1)
        latest_measurement = WeatherMeasurement.objects.order_by("-time").first()
        suggested_start = latest_measurement.time.date() if latest_measurement else yesterday

        return Response(
            {
                "totals": {
                    "total_measurements": total_measurements,
                    "total_stations": len(station_data),
                    "records_last_24h": records_last_24h,
                    "records_last_7d": records_last_7d,
                },
                "stations": station_data,
                "sync_health": {
                    "last_run": WeatherSyncLogSerializer(last_run).data if last_run else None,
                    "runs_considered": len(recent_runs),
                    "success_count": run_counts["success"],
                    "partial_count": run_counts["partial"],
                    "failed_count": run_counts["failed"],
                },
                "suggested_range": {
                    "suggested_start": suggested_start.isoformat(),
                    "suggested_end": yesterday.isoformat(),
                },
                "source_config": {
                    "sensor_id": settings.FEWSNET_SENSOR_ID,
                    "api_base_url": settings.FEWSNET_API_BASE_URL,
                    "configured": bool(settings.FEWSNET_EMAIL and settings.FEWSNET_API_KEY),
                    "cron_interval_minutes": 15,
                },
            }
        )





class DefaultDateRangeView(APIView):
    """
    GET a suggested {start_date, end_date} pair.

    suggested_start -> latest measurement date in the database
    suggested_end   -> yesterday
    """

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        yesterday = date.today() - timedelta(days=1)

        latest_measurement = (
            WeatherMeasurement.objects.order_by("-time").first()
        )

        if latest_measurement:
            suggested_start = latest_measurement.time.date()
        else:
            # Database is empty
            suggested_start = yesterday

        return Response(
            {
                "suggested_start": suggested_start.isoformat(),
                "suggested_end": yesterday.isoformat(),
            }
        )