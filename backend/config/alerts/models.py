import secrets
import uuid

from django.conf import settings
from django.db import models


class WebhookEvent(models.TextChoices):
    ALERT_CREATED = "alert.created", "Alert created"
    ALERT_RESOLVED = "alert.resolved", "Alert resolved"


class Alert(models.Model):
    """
    A single table for every alert the platform raises, distinguished by
    `alert_type`. Hydrology and livestock alerts share the same lifecycle
    (created -> active -> resolved) and most of the surrounding API/admin
    code, so one model with type-specific nullable fields is simpler than
    two near-identical tables.
    """

    class AlertType(models.TextChoices):
        HYDROLOGY = "hydrology", "Hydrology"
        LIVESTOCK = "livestock", "Livestock"

    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MODERATE = "moderate", "Moderate"
        HIGH = "high", "High"
        EXTREME = "extreme", "Extreme"

    class PressureTrend(models.TextChoices):
        RISING = "rising", "Rising"
        FALLING = "falling", "Falling"
        STEADY = "steady", "Steady"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    station = models.ForeignKey("telemetry.WeatherStation", on_delete=models.CASCADE, related_name="alerts")
    alert_type = models.CharField(max_length=20, choices=AlertType.choices)
    severity = models.CharField(max_length=20, choices=Severity.choices)
    message = models.TextField()

    # Coalescence: while True, no new alert of this (station, alert_type) is
    # raised — the existing one is left standing. Set to False once the
    # underlying condition clears, which allows the next crossing to open
    # a fresh alert.
    is_active = models.BooleanField(default=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Hydrology fields
    runoff_risk_score = models.FloatField(null=True, blank=True)
    rainfall_summary = models.JSONField(null=True, blank=True)
    pressure_trend = models.CharField(max_length=10, choices=PressureTrend.choices, null=True, blank=True)
    recommendation = models.CharField(max_length=255, blank=True, default="")

    # Livestock fields
    wbgt_value = models.FloatField(null=True, blank=True)
    threshold = models.FloatField(null=True, blank=True)
    triggering_measurement = models.ForeignKey(
        "telemetry.WeatherMeasurement",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["station", "alert_type", "is_active"]),
        ]

    def __str__(self):
        return f"{self.get_alert_type_display()} alert ({self.severity}) - {self.station.instrument_name}"


class WebhookSubscription(models.Model):
    """
    A subscriber URL that gets an HTTP POST whenever a matching alert is
    created or resolved. Owned by a user (same account that holds the API
    keys), optionally narrowed to one alert type and/or one station.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="webhook_subscriptions"
    )
    url = models.URLField(max_length=500)

    # Used to HMAC-sign the delivered payload so the receiver can verify it
    # actually came from Conduit. Generated once, never exposed after
    # creation except in the initial create response.
    secret = models.CharField(max_length=64, editable=False)

    event_types = models.JSONField(default=list, blank=True)
    alert_type = models.CharField(max_length=20, choices=Alert.AlertType.choices, null=True, blank=True)
    station = models.ForeignKey(
        "telemetry.WeatherStation",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="webhook_subscriptions",
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.secret:
            self.secret = secrets.token_hex(32)
        if not self.event_types:
            self.event_types = [WebhookEvent.ALERT_CREATED, WebhookEvent.ALERT_RESOLVED]
        super().save(*args, **kwargs)

    def matches(self, alert, event_type):
        if not self.is_active:
            return False
        if event_type not in self.event_types:
            return False
        if self.alert_type and self.alert_type != alert.alert_type:
            return False
        if self.station_id and self.station_id != alert.station_id:
            return False
        return True

    def __str__(self):
        return f"{self.url} ({self.user.email})"


class WebhookDelivery(models.Model):
    """
    One delivery attempt (or retry) of an alert event to a subscription.
    Kept as an audit trail and as the retry queue — see
    alerts/services/webhooks.py:retry_failed_deliveries().
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(WebhookSubscription, on_delete=models.CASCADE, related_name="deliveries")
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name="webhook_deliveries")
    event_type = models.CharField(max_length=20, choices=WebhookEvent.choices)
    payload = models.JSONField()

    success = models.BooleanField(default=False)
    response_status = models.IntegerField(null=True, blank=True)
    error_message = models.TextField(blank=True, default="")
    attempt_count = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["success", "attempt_count"])]

    def __str__(self):
        status = "delivered" if self.success else "failed"
        return f"{self.event_type} -> {self.subscription.url} ({status})"
