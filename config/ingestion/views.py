import logging
import secrets as secrets_module
from datetime import date, timedelta

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WeatherSyncLog
from .serializers import WeatherSyncLogSerializer
from .services.ingest import run_ingest, run_latest_sync, IngestError
from telemetry.models import WeatherMeasurement

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
    """GET recent ingestion runs, most recent first."""

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        logs = WeatherSyncLog.objects.all()[:20]
        return Response(WeatherSyncLogSerializer(logs, many=True).data)





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