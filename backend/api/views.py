import time

from django.http import JsonResponse

from . import weather

# Upper bound on the ?delay lever, so a stray ?delay=9999 cannot pin a worker.
MAX_DELAY_SECONDS = 10


def hello(request):
    return JsonResponse({"message": "Hello from Django backend"})


def _error(code, message, status):
    """Single error envelope for the whole API.

    The frontend normalizes on this shape, so every failure reaches the UI as
    an actionable message instead of a raw status code.
    """
    return JsonResponse({"error": {"code": code, "message": message}}, status=status)


def _levers(request):
    """Apply the demo levers, if present.

    Returns a response to short-circuit with, or None to continue:

    - ``?delay=<seconds>``  hold the response, so `loading` and `refreshing`
      stay on screen long enough to look at. Capped at MAX_DELAY_SECONDS.
    - ``?fail=1``           return 503, to exercise the `error` state.

    These exist so every canonical UI state can be reached from the address
    bar, with no code change and no need to break the backend on purpose.
    """
    raw_delay = request.GET.get("delay")
    if raw_delay:
        try:
            time.sleep(min(float(raw_delay), MAX_DELAY_SECONDS))
        except ValueError:
            return _error("invalid_delay", f"'{raw_delay}' is not a number of seconds.", 400)

    if request.GET.get("fail") == "1":
        return _error("upstream_unavailable", "The weather provider is unavailable. Try again.", 503)

    return None


def _resolve(request, slug):
    """Run the levers, then look the city up.

    Returns ``(city, None)`` on success or ``(None, response)`` to return.
    """
    short_circuit = _levers(request)
    if short_circuit is not None:
        return None, short_circuit

    city = weather.get_city(slug)
    if city is None:
        return None, _error(
            "city_not_found",
            f"No weather data for '{slug}'. Known cities: {', '.join(weather.city_slugs())}.",
            404,
        )

    return city, None


def current_weather(request, slug):
    """GET /api/weather/<slug>/ — current conditions for one city."""
    city, response = _resolve(request, slug)
    if response is not None:
        return response
    return JsonResponse(weather.current_conditions(city))


def city_forecast(request, slug):
    """GET /api/forecast/<slug>/ — five-day forecast for one city.

    ``days`` can come back empty for a known city. That is a success with no
    results, not a failure, and the frontend renders it as `empty`.
    """
    city, response = _resolve(request, slug)
    if response is not None:
        return response
    return JsonResponse({"city": city["name"], "days": weather.forecast(city)})


def cities(request):
    """GET /api/cities/ — the cities this API can answer for."""
    response = _levers(request)
    if response is not None:
        return response
    return JsonResponse(
        {
            "cities": [
                {"slug": slug, "name": weather.CITIES[slug]["name"], "country": weather.CITIES[slug]["country"]}
                for slug in weather.city_slugs()
            ]
        }
    )
