import uuid
import secrets
from django.db import models


class WeatherStation(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        MAINTENANCE = "maintenance", "Maintenance"
        DECOMMISSIONED = "decommissioned", "Decommissioned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instrument_name = models.CharField(max_length=255, default="Kenya Kiambu JKUAT IOT AWS - Conduit@Empathy1")
    sensor_id = models.IntegerField(unique=True, default=61)
    site_name = models.CharField(max_length=255, default="Site JKUAT")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=-1.099736)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=37.014528)
    elevation_m = models.DecimalField(max_digits=7, decimal_places=2, default=1523.0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    slug = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        from django.utils.text import slugify

        if not self.slug:
            self.slug = slugify(self.instrument_name)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.instrument_name} ({self.get_status_display()})"
    



class WeatherMeasurement(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,)  
    station = models.ForeignKey("WeatherStation", on_delete=models.CASCADE, related_name="measurements")
    time = models.DateTimeField()
    health = models.IntegerField()
    battery_voltage = models.FloatField(null=True, blank=True)
    battery_charge_status = models.IntegerField(null=True, blank=True)
    cell_signal_strength = models.IntegerField(null=True, blank=True)

    rain_gauge_1 = models.FloatField(null=True, blank=True)
    rain_gauge_2 = models.FloatField(null=True, blank=True)
    rain_gauge_1_total_today = models.FloatField(null=True, blank=True)
    rain_gauge_2_total_today = models.FloatField(null=True, blank=True)
    rain_gauge_1_total_prior = models.FloatField(null=True, blank=True)
    rain_gauge_2_total_prior = models.FloatField(null=True, blank=True)

    bmx_temperature = models.FloatField(null=True, blank=True)
    mcp_temperature = models.FloatField(null=True, blank=True)
    sht_temperature = models.FloatField(null=True, blank=True)
    sht_humidity = models.FloatField(null=True, blank=True)
    bmx_pressure = models.FloatField(null=True, blank=True)

    visible_light = models.FloatField(null=True, blank=True)
    infrared = models.FloatField(null=True, blank=True)
    ultraviolet = models.FloatField(null=True, blank=True)

    wind_speed = models.FloatField(null=True, blank=True)
    wind_direction = models.FloatField(null=True, blank=True)
    wind_gust = models.FloatField(null=True, blank=True)
    wind_gust_direction = models.FloatField(null=True, blank=True)

    heat_index = models.FloatField(null=True, blank=True)
    wet_bulb_temperature = models.FloatField(null=True, blank=True)
    wbgt = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.station.instrument_name} @ {self.time}"




class WeatherAlert(models.Model):

    class Severity(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        DANGER = "danger", "Danger"
        EXTREME = "extreme", "Extreme"
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,)  
    station = models.ForeignKey("WeatherStation", on_delete=models.CASCADE, related_name="alerts")
    measurement = models.ForeignKey("WeatherMeasurement", on_delete=models.CASCADE, related_name="alerts")

    time = models.DateTimeField()

    severity = models.CharField(max_length=20, choices=Severity.choices)

    message = models.TextField()

    wbgt = models.FloatField(null=True, blank=True)
    heat_index = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-time"]
        indexes = [
            models.Index(fields=["station", "-time"]),
        ]

    def __str__(self):
        return f"{self.station.site_name} [{self.severity}] @ {self.time}"



