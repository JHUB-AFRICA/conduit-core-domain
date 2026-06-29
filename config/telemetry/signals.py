from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import WeatherAlert, WeatherMeasurement
from .severity import compute_severity


@receiver(post_save, sender=WeatherMeasurement)
def create_alert_for_measurement(sender, instance, created, **kwargs):
    """
    Every time a measurement is recorded, compute its heat-stress severity
    and store a WeatherAlert alongside it. This runs regardless of how the
    measurement was created (ingestion endpoint, admin, script, fixture),
    and regardless of whether anyone has subscribed to anything — alerts
    are a public read, not a subscription benefit.
    """
    if not created:
        return

    severity, message = compute_severity(instance.wbgt, instance.heat_index)

    WeatherAlert.objects.create(
        station=instance.station,
        measurement=instance,
        time=instance.time,
        severity=severity,
        message=message,
        wbgt=instance.wbgt,
        heat_index=instance.heat_index,
    )
