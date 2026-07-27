import secrets as secrets_module

from django.conf import settings
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.authentication import JWTOrAPIKeyAuthentication
from telemetry.pagination import HistoryPagination

from .models import Alert, WebhookDelivery, WebhookSubscription
from .serializers import AlertSerializer, WebhookDeliverySerializer, WebhookSubscriptionSerializer
from .services.webhooks import retry_failed_deliveries, send_test_ping


class AlertListView(ListAPIView):
    """
    GET /api/v1/alerts/

    Optional filters: ?type=hydrology|livestock, ?station=<slug>,
    ?active=true|false. Same auth as the telemetry read endpoints, since
    alerts are part of the same consumer-facing API surface.
    """

    authentication_classes = [JWTOrAPIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AlertSerializer
    pagination_class = HistoryPagination

    def get_queryset(self):
        queryset = Alert.objects.select_related("station").all()

        alert_type = self.request.query_params.get("type")
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)

        station_slug = self.request.query_params.get("station")
        if station_slug:
            queryset = queryset.filter(station__slug=station_slug)

        active_param = self.request.query_params.get("active")
        if active_param is not None:
            queryset = queryset.filter(is_active=active_param.lower() == "true")

        return queryset


class AlertDetailView(RetrieveAPIView):
    """GET /api/v1/alerts/<uuid:pk>/"""

    authentication_classes = [JWTOrAPIKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AlertSerializer
    queryset = Alert.objects.select_related("station").all()


class WebhookSubscriptionListCreateView(APIView):
    """
    GET  /api/v1/alerts/webhooks/       list this user's subscriptions
    POST /api/v1/alerts/webhooks/       create one

    JWT-authenticated (account/dashboard action), not API-key — matches
    accounts.views.APIKeyListView / APIKeyCreateView.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        subscriptions = WebhookSubscription.objects.filter(user=request.user).select_related("station")
        # The secret is only ever returned on creation (see below) — strip
        # it from list responses so it can't leak into logs/screenshots.
        serializer = WebhookSubscriptionSerializer(subscriptions, many=True)
        data = [{**item, "secret": None} for item in serializer.data]
        return Response(data)

    def post(self, request):
        serializer = WebhookSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save(user=request.user)
        # Full response here — including `secret` — is the only time the
        # client gets to see it. They're expected to store it themselves.
        return Response(WebhookSubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)


class WebhookSubscriptionDetailView(APIView):
    """GET/DELETE /api/v1/alerts/webhooks/<uuid:pk>/ — owner only."""

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return WebhookSubscription.objects.get(pk=pk, user=request.user)
        except WebhookSubscription.DoesNotExist:
            return None

    def get(self, request, pk):
        subscription = self.get_object(request, pk)
        if subscription is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        data = {**WebhookSubscriptionSerializer(subscription).data, "secret": None}
        return Response(data)

    def delete(self, request, pk):
        subscription = self.get_object(request, pk)
        if subscription is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        subscription.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WebhookSubscriptionTestView(APIView):
    """POST /api/v1/alerts/webhooks/<uuid:pk>/test/ — send a sample ping."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            subscription = WebhookSubscription.objects.get(pk=pk, user=request.user)
        except WebhookSubscription.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        result = send_test_ping(subscription)
        return Response(
            result, status=status.HTTP_200_OK if result["success"] else status.HTTP_502_BAD_GATEWAY
        )


class WebhookDeliveryListView(ListAPIView):
    """GET /api/v1/alerts/webhooks/<uuid:pk>/deliveries/ — owner only."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WebhookDeliverySerializer
    pagination_class = HistoryPagination

    def get_queryset(self):
        return WebhookDelivery.objects.filter(
            subscription_id=self.kwargs["pk"], subscription__user=self.request.user
        )


class InternalRetryWebhooksView(APIView):
    """
    POST /api/v1/alerts/internal/retry-webhooks/

    Same shared-secret pattern as ingestion's InternalSyncView — meant to
    be called on a schedule (GitHub Actions or similar), not by end users.
    """

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.SYNC_SECRET_TOKEN:
            return Response(
                {"error": "Internal sync is not configured on this server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        provided_token = request.headers.get("X-SYNC-TOKEN", "")
        if not secrets_module.compare_digest(provided_token, settings.SYNC_SECRET_TOKEN):
            return Response(
                {"error": "Invalid or missing X-SYNC-TOKEN."}, status=status.HTTP_401_UNAUTHORIZED
            )

        result = retry_failed_deliveries()
        return Response(result, status=status.HTTP_200_OK)
