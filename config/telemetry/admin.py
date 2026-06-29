from django.contrib import admin
from .models import WeatherStation,WeatherMeasurement, WeatherAlert

admin.site.register(WeatherMeasurement)
admin.site.register(WeatherStation)
admin.site.register(WeatherAlert)