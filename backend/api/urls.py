from django.urls import path

from .views import city_forecast, cities, current_weather, hello

urlpatterns = [
    path("", hello, name="hello"),
    path("cities/", cities, name="cities"),
    path("weather/<slug:slug>/", current_weather, name="current-weather"),
    path("forecast/<slug:slug>/", city_forecast, name="city-forecast"),
]
