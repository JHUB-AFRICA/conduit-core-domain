import uuid
from django.db import models


class WeatherSyncLog(models.Model):
    """Tracks each ingestion run (admin-triggered or CLI backfill) for auditing."""

    class SyncStatus(models.TextChoices):
        SUCCESS = "success", "Success"
        PARTIAL = "partial", "Partial"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    station = models.ForeignKey(
        "telemetry.WeatherStation",
        on_delete=models.CASCADE,
        related_name="sync_logs",
        null=True,
        blank=True,
    )
    requested_start = models.DateField()
    requested_end = models.DateField()
    status = models.CharField(max_length=20, choices=SyncStatus.choices, default=SyncStatus.SUCCESS)
    records_fetched = models.IntegerField(default=0)
    records_created = models.IntegerField(default=0)
    records_skipped = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, default="")
    triggered_by = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Sync {self.requested_start} → {self.requested_end} ({self.status})"
