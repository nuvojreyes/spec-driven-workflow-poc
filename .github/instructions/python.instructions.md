---
description: "Python and Django coding conventions and guidelines"
applyTo: "**/*.py"
---

# Python & Django Coding Conventions

## Python Instructions

- Write clear and concise comments for each function.
- Ensure functions have descriptive names and include type hints.
- Provide docstrings following PEP 257 conventions.
- Use the `typing` module for type annotations (e.g., `List[str]`, `Dict[str, int]`).
- Break down complex functions into smaller, more manageable functions.

## Django-Specific Instructions

### Models

- Use descriptive field names that clearly indicate the data stored
- Add `verbose_name` and `help_text` to fields for better admin interface
- Define `__str__()` method for meaningful string representation
- Use `Meta` class to define ordering, indexes, and constraints
- Leverage Django's field types appropriately (`CharField`, `TextField`, `JSONField`, etc.)
- Add database indexes for frequently queried fields
- Use `related_name` for reverse relationships to improve readability

```python
class WeatherCache(models.Model):
    city = models.CharField(max_length=100, db_index=True, help_text="City name")
    temperature = models.FloatField(verbose_name="Temperature (°C)")
    cached_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-cached_at']
        indexes = [
            models.Index(fields=['city', '-cached_at']),
        ]

    def __str__(self):
        return f"{self.city} - {self.cached_at.strftime('%Y-%m-%d %H:%M')}"
```

### Views

- Use class-based views (CBVs) for CRUD operations and complex logic
- Use function-based views (FBVs) for simple, one-off endpoints
- For REST APIs, prefer Django REST Framework's `APIView` or `ViewSet`
- Always validate input data before processing
- Return appropriate HTTP status codes (200, 201, 400, 404, 500, etc.)
- Use Django's `get_object_or_404()` for retrieving single objects

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

class WeatherDetailView(APIView):
    """Retrieve weather data for a specific city."""

    def get(self, request, city: str):
        weather = get_object_or_404(WeatherCache, city__iexact=city)
        serializer = WeatherSerializer(weather)
        return Response(serializer.data, status=status.HTTP_200_OK)
```

### URLs

- Use clear, RESTful URL patterns
- Name all URL patterns for easy reversal
- Group related URLs with `include()`
- Use path converters (`<int:pk>`, `<str:city>`) for type safety
- Avoid hardcoding URLs in templates or views; use `reverse()` or `{% url %}`

```python
from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('weather/<str:city>/', views.WeatherDetailView.as_view(), name='weather-detail'),
    path('weather/', views.WeatherListView.as_view(), name='weather-list'),
]
```

### Serializers (Django REST Framework)

- Use `ModelSerializer` for models with standard CRUD operations
- Define explicit fields in `Meta.fields` instead of using `'__all__'`
- Add custom validation methods (`validate_<field_name>`)
- Use `read_only_fields` for fields that shouldn't be modified via API

```python
from rest_framework import serializers
from .models import WeatherCache

class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherCache
        fields = ['id', 'city', 'temperature', 'humidity', 'cached_at']
        read_only_fields = ['id', 'cached_at']

    def validate_temperature(self, value):
        if value < -100 or value > 100:
            raise serializers.ValidationError("Temperature out of valid range")
        return value
```

### Migrations

- Always review auto-generated migrations before committing
- Use descriptive migration names with `--name` flag when needed
- Combine related schema changes in a single migration
- Write data migrations for complex data transformations
- Test migrations with both `migrate` and `migrate --fake-zero`

### Security

- Never commit `SECRET_KEY` or credentials to version control
- Use environment variables for sensitive settings
- Enable CSRF protection (enabled by default, don't disable)
- Use Django's built-in authentication and permission systems
- Sanitize user input and use parameterized queries (ORM does this)
- Set `DEBUG = False` in production
- Configure `ALLOWED_HOSTS` appropriately

### Testing

- Write tests in `tests.py` or `tests/` directory within each app
- Use Django's `TestCase` for tests requiring database access
- Use `SimpleTestCase` for tests that don't need database
- Use `APITestCase` from DRF for API endpoint tests
- Test models, views, serializers, and custom logic separately
- Aim for meaningful test names: `test_<what>_<condition>_<expected_result>`

```python
from django.test import TestCase
from .models import WeatherCache

class WeatherCacheModelTest(TestCase):
    def test_str_representation_includes_city_and_date(self):
        weather = WeatherCache.objects.create(
            city="London",
            temperature=15.5
        )
        self.assertIn("London", str(weather))
        self.assertIn("-", str(weather))
```

### Query Optimization

- Use `select_related()` for forward ForeignKey/OneToOne relationships
- Use `prefetch_related()` for reverse ForeignKey and ManyToMany relationships
- Use `only()` and `defer()` to limit fields loaded from database
- Use `exists()` instead of `count()` for existence checks
- Avoid N+1 queries by using proper `select_related`/`prefetch_related`

```python
# Bad - N+1 query problem
cities = WeatherCache.objects.all()
for city in cities:
    print(city.location.country)  # Hits DB each time

# Good - Single query with join
cities = WeatherCache.objects.select_related('location').all()
for city in cities:
    print(city.location.country)  # Already loaded
```

### Settings Management

- Split settings into multiple files for different environments (`settings/base.py`, `settings/production.py`)
- Use `django-environ` or similar for environment variable management
- Keep sensitive data in environment variables, not in settings files
- Document all custom settings with comments

### Admin Interface

- Register all models with meaningful admin classes
- Customize `list_display`, `list_filter`, and `search_fields`
- Use `readonly_fields` for fields that shouldn't be edited
- Add custom actions for bulk operations

```python
from django.contrib import admin
from .models import WeatherCache

@admin.register(WeatherCache)
class WeatherCacheAdmin(admin.ModelAdmin):
    list_display = ['city', 'temperature', 'cached_at']
    list_filter = ['cached_at']
    search_fields = ['city']
    readonly_fields = ['cached_at']
    ordering = ['-cached_at']
```

## General Instructions

- Always prioritize readability and clarity.
- For algorithm-related code, include explanations of the approach used.
- Write code with good maintainability practices, including comments on why certain design decisions were made.
- Handle edge cases and write clear exception handling.
- For libraries or external dependencies, mention their usage and purpose in comments.
- Use consistent naming conventions and follow language-specific best practices.
- Write concise, efficient, and idiomatic code that is also easily understandable.

## Code Style and Formatting

- Follow the **PEP 8** style guide for Python.
- Maintain proper indentation (use 4 spaces for each level of indentation).
- Ensure lines do not exceed 79 characters.
- Place function and class docstrings immediately after the `def` or `class` keyword.
- Use blank lines to separate functions, classes, and code blocks where appropriate.

## Edge Cases and Testing

- Always include test cases for critical paths of the application.
- Account for common edge cases like empty inputs, invalid data types, and large datasets.
- Include comments for edge cases and the expected behavior in those cases.
- Write unit tests for functions and document them with docstrings explaining the test cases.

## Example of Proper Documentation

```python
def calculate_area(radius: float) -> float:
    """
    Calculate the area of a circle given the radius.

    Parameters:
    radius (float): The radius of the circle.

    Returns:
    float: The area of the circle, calculated as π * radius^2.
    """
    import math
    return math.pi * radius ** 2
```
