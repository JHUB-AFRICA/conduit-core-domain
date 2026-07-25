from rest_framework import serializers

from telemetry.models import WeatherStation

from .models import Alert, WebhookDelivery, WebhookEvent, WebhookSubscription


class AlertSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source="station.instrument_name", read_only=True)
    station_slug = serializers.CharField(source="station.slug", read_only=True)

    class Meta:
        model = Alert
        fields = [
            "id",
            "station_name",
            "station_slug",
            "alert_type",
            "severity",
            "message",
            "is_active",
            "resolved_at",
            "runoff_risk_score",
            "rainfall_summary",
            "pressure_trend",
            "recommendation",
            "wbgt_value",
            "threshold",
            "created_at",
            "updated_at",
        ]


class WebhookSubscriptionSerializer(serializers.ModelSerializer):
    station_slug = serializers.SlugRelatedField(
        source="station",
        slug_field="slug",
        queryset=WeatherStation.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = WebhookSubscription
        fields = [
            "id",
            "url",
            "secret",
            "event_types",
            "alert_type",
            "station_slug",
            "is_active",
            "created_at",
        ]
        # The secret is generated server-side and only ever shown once, on
        # the create response — see AlertWebhookSubscriptionListCreateView.
        read_only_fields = ["id", "secret", "created_at"]

    def validate_event_types(self, value):
        valid = set(WebhookEvent.values)
        if value and not set(value).issubset(valid):
            raise serializers.ValidationError(f"event_types must be a subset of {sorted(valid)}.")
        return value


class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = [
            "id",
            "event_type",
            "success",
            "response_status",
            "error_message",
            "attempt_count",
            "created_at",
            "delivered_at",
        ]
