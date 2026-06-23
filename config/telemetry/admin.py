from django.contrib import admin
from .models import WeatherStation,WeatherMeasurement

admin.site.register(WeatherMeasurement)
admin.site.register(WeatherStation)