"""In-memory weather data source.

Deliberately not backed by a real provider: the PoC needs deterministic
responses, no API key, and no network access. The shape is what a real
provider adapter would normalize to, so swapping this module out later does
not change the API contract.

Temperatures are Fahrenheit, wind is mph, humidity and cloud coverage are
percentages. Units live in the field names so the frontend formats them and
the API never ships pre-formatted strings.
"""

CITIES = {
    "san-francisco": {
        "name": "San Francisco",
        "country": "California, USA",
        "heroImage": "https://source.unsplash.com/1600x900/?san-francisco,skyline,blue-sky",
        "current": {
            "temperatureF": 72,
            "status": "Mostly clear",
            "feelsLikeF": 75,
            "windMph": 8,
            "humidityPct": 54,
            "highF": 76,
            "lowF": 58,
            "cloudCoveragePct": 8,
        },
        "forecast": [
            {"day": "Mon", "highF": 76, "lowF": 58, "status": "Mostly clear", "precipitationPct": 8},
            {"day": "Tue", "highF": 74, "lowF": 57, "status": "Coastal haze", "precipitationPct": 12},
            {"day": "Wed", "highF": 71, "lowF": 56, "status": "Low cloud", "precipitationPct": 24},
            {"day": "Thu", "highF": 73, "lowF": 57, "status": "Clearing", "precipitationPct": 10},
            {"day": "Fri", "highF": 77, "lowF": 59, "status": "High sun", "precipitationPct": 4},
        ],
    },
    "seattle": {
        "name": "Seattle",
        "country": "Washington, USA",
        "heroImage": "https://source.unsplash.com/1600x900/?seattle,skyline,cloudy",
        "current": {
            "temperatureF": 64,
            "status": "Light drizzle",
            "feelsLikeF": 63,
            "windMph": 11,
            "humidityPct": 71,
            "highF": 66,
            "lowF": 55,
            "cloudCoveragePct": 62,
        },
        "forecast": [
            {"day": "Mon", "highF": 66, "lowF": 55, "status": "Light drizzle", "precipitationPct": 62},
            {"day": "Tue", "highF": 64, "lowF": 54, "status": "Steady rain", "precipitationPct": 78},
            {"day": "Wed", "highF": 63, "lowF": 53, "status": "Overcast", "precipitationPct": 45},
            {"day": "Thu", "highF": 67, "lowF": 55, "status": "Breaking cloud", "precipitationPct": 30},
            {"day": "Fri", "highF": 69, "lowF": 56, "status": "Mostly clear", "precipitationPct": 15},
        ],
    },
    "miami": {
        "name": "Miami",
        "country": "Florida, USA",
        "heroImage": "https://source.unsplash.com/1600x900/?miami,skyline,blue-sky",
        "current": {
            "temperatureF": 86,
            "status": "Bright and humid",
            "feelsLikeF": 92,
            "windMph": 14,
            "humidityPct": 68,
            "highF": 90,
            "lowF": 81,
            "cloudCoveragePct": 18,
        },
        "forecast": [
            {"day": "Mon", "highF": 90, "lowF": 81, "status": "Bright and humid", "precipitationPct": 18},
            {"day": "Tue", "highF": 91, "lowF": 82, "status": "Afternoon storms", "precipitationPct": 55},
            {"day": "Wed", "highF": 89, "lowF": 80, "status": "Scattered showers", "precipitationPct": 48},
            {"day": "Thu", "highF": 90, "lowF": 81, "status": "Humid haze", "precipitationPct": 22},
            {"day": "Fri", "highF": 92, "lowF": 82, "status": "High sun", "precipitationPct": 12},
        ],
    },
    "denver": {
        "name": "Denver",
        "country": "Colorado, USA",
        "heroImage": "https://source.unsplash.com/1600x900/?denver,mountains,city",
        "current": {
            "temperatureF": 78,
            "status": "High sun",
            "feelsLikeF": 79,
            "windMph": 6,
            "humidityPct": 29,
            "highF": 82,
            "lowF": 60,
            "cloudCoveragePct": 2,
        },
        "forecast": [
            {"day": "Mon", "highF": 82, "lowF": 60, "status": "High sun", "precipitationPct": 2},
            {"day": "Tue", "highF": 84, "lowF": 61, "status": "Thin cloud", "precipitationPct": 6},
            {"day": "Wed", "highF": 79, "lowF": 58, "status": "Mountain storms", "precipitationPct": 40},
            {"day": "Thu", "highF": 81, "lowF": 59, "status": "Clearing", "precipitationPct": 14},
            {"day": "Fri", "highF": 85, "lowF": 62, "status": "High sun", "precipitationPct": 3},
        ],
    },
    # Exists, reports current conditions, and has no forecast on file. Drives
    # the `empty` state: a successful response with zero results, which is
    # neither an error nor a still-loading block.
    "nowhere": {
        "name": "Nowhere",
        "country": "Unmapped territory",
        "heroImage": "",
        "current": {
            "temperatureF": 60,
            "status": "Unremarkable",
            "feelsLikeF": 60,
            "windMph": 0,
            "humidityPct": 50,
            "highF": 60,
            "lowF": 60,
            "cloudCoveragePct": 50,
        },
        "forecast": [],
    },
}


def city_slugs():
    """Slugs of every known city, in insertion order."""
    return list(CITIES.keys())


def get_city(slug):
    """Return the record for `slug`, or None when the city is unknown."""
    return CITIES.get((slug or "").strip().lower())


def current_conditions(city):
    """Flatten a city record into the current-weather payload."""
    return {
        "city": city["name"],
        "country": city["country"],
        "heroImage": city["heroImage"],
        **city["current"],
    }


def forecast(city):
    """Return the city's daily forecast. May be empty — that is a valid answer."""
    return list(city["forecast"])
