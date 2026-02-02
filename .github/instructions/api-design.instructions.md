---
description: "REST API design standards and best practices"
applyTo: "**/*.py, **/api/**, **/urls.py, **/views.py, **/serializers.py"
---

# REST API Design Standards

## Overview

This document defines the REST API design standards for the project. Follow these guidelines when designing, implementing, or documenting APIs to ensure consistency, usability, and maintainability.

## HTTP Methods and RESTful Conventions

Use standard HTTP methods according to their semantic meaning:

- **GET**: Retrieve resource(s), safe and idempotent
- **POST**: Create new resource, not idempotent
- **PUT**: Replace entire resource, idempotent
- **PATCH**: Partially update resource, not idempotent
- **DELETE**: Remove resource, idempotent

### Examples

```
GET    /api/weather/           # List all weather records
GET    /api/weather/{city}/    # Retrieve specific city weather
POST   /api/weather/           # Create new weather record
PUT    /api/weather/{city}/    # Replace entire weather record
PATCH  /api/weather/{city}/    # Update specific fields
DELETE /api/weather/{city}/    # Delete weather record
```

## URL Structure

### Base Structure

```
{protocol}://{host}/{api-prefix}/{version}/{resource}/{identifier}
```

**Example**: `https://api.example.com/api/v1/weather/london`

### Naming Conventions

- Use **lowercase** for all paths
- Use **plural nouns** for resource collections (`/users`, `/products`)
- Use **kebab-case** for multi-word resources (`/weather-forecasts`)
- Avoid verbs in URLs (use HTTP methods instead)
- Use hierarchical paths for relationships: `/users/{id}/orders`

### Good vs. Bad Examples

```
✅ Good:
GET  /api/weather/london
POST /api/weather-alerts
GET  /api/users/123/orders

❌ Bad:
GET  /api/getWeather?city=london
POST /api/createWeatherAlert
GET  /api/User/123/Order
```

## Request/Response Format

### Content Type

- Default: `application/json`
- Always set `Content-Type` header in responses
- Accept `Content-Type` header in requests for POST/PUT/PATCH

### Request Body (POST/PUT/PATCH)

```json
{
	"city": "London",
	"temperature": 15.5,
	"humidity": 65,
	"conditions": "Partly Cloudy"
}
```

### Response Body Structure

#### Successful Response (Single Resource)

```json
{
	"id": 123,
	"city": "London",
	"temperature": 15.5,
	"humidity": 65,
	"conditions": "Partly Cloudy",
	"cached_at": "2026-01-29T10:30:00Z"
}
```

#### Successful Response (Collection)

```json
{
	"count": 100,
	"next": "https://api.example.com/api/weather/?page=2",
	"previous": null,
	"results": [
		{
			"id": 123,
			"city": "London",
			"temperature": 15.5
		},
		{
			"id": 124,
			"city": "Paris",
			"temperature": 18.2
		}
	]
}
```

#### Error Response

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Invalid input data",
		"details": {
			"temperature": ["Temperature must be between -100 and 100"]
		}
	}
}
```

## HTTP Status Codes

Use appropriate status codes to indicate the result of API operations:

### Success Codes (2xx)

- **200 OK**: Successful GET, PUT, PATCH, DELETE
- **201 Created**: Successful POST creating a resource
- **204 No Content**: Successful DELETE with no response body

### Client Error Codes (4xx)

- **400 Bad Request**: Invalid request format or validation error
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource does not exist
- **409 Conflict**: Request conflicts with current state (e.g., duplicate)
- **422 Unprocessable Entity**: Validation error (alternative to 400)

### Server Error Codes (5xx)

- **500 Internal Server Error**: Unexpected server error
- **502 Bad Gateway**: Upstream service error
- **503 Service Unavailable**: Server temporarily unavailable

## Error Handling

### Standard Error Format

All error responses should follow a consistent structure:

```json
{
	"error": {
		"code": "ERROR_CODE",
		"message": "Human-readable error message",
		"details": {
			"field_name": ["Specific validation error"]
		}
	}
}
```

### Error Codes

Define application-specific error codes for common scenarios:

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication failed
- `FORBIDDEN`: Permission denied
- `CONFLICT`: Resource conflict (duplicate, etc.)
- `INTERNAL_ERROR`: Unexpected server error
- `SERVICE_UNAVAILABLE`: External service unavailable

### Example Implementation (Django REST Framework)

```python
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_response = {
            'error': {
                'code': get_error_code(exc),
                'message': str(exc),
                'details': response.data
            }
        }
        response.data = error_response

    return response
```

## Pagination

Use cursor or offset-based pagination for large collections:

### Query Parameters

- `page`: Page number (1-indexed)
- `page_size` or `limit`: Number of items per page (default: 20, max: 100)

### Response Format

```json
{
  "count": 250,
  "next": "https://api.example.com/api/weather/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering and Sorting

### Filtering

Use query parameters for filtering:

```
GET /api/weather/?city=London&temperature__gte=10
```

### Sorting

Use `ordering` or `sort` parameter:

```
GET /api/weather/?ordering=-cached_at
GET /api/weather/?sort=city,asc
```

**Conventions**:

- Prefix with `-` for descending order
- Use comma-separated values for multiple fields

## Versioning

### URL Path Versioning (Recommended)

```
/api/v1/weather/
/api/v2/weather/
```

**Advantages**:

- Clear and explicit
- Easy to route and document
- Works with all HTTP clients

### Alternative: Header Versioning

```
Accept: application/vnd.myapp.v1+json
```

**When to Version**:

- Breaking changes to request/response format
- Removal of fields or endpoints
- Changes to authentication/authorization

**Backward Compatibility**:

- Deprecate old versions gradually
- Support at least 2 versions simultaneously
- Document migration path

## Authentication and Authorization

### Authentication

Use **Token-based** or **JWT** authentication:

```
Authorization: Bearer <token>
```

### Django REST Framework Example

```python
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

class WeatherView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
```

### Endpoints

```
POST /api/auth/login/     # Obtain token
POST /api/auth/logout/    # Invalidate token
POST /api/auth/refresh/   # Refresh token (JWT)
```

## Rate Limiting

Implement rate limiting to prevent abuse:

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643472000
```

### Error Response (429 Too Many Requests)

```json
{
	"error": {
		"code": "RATE_LIMIT_EXCEEDED",
		"message": "Rate limit exceeded. Try again in 60 seconds.",
		"details": {
			"retry_after": 60
		}
	}
}
```

## API Documentation

### Use OpenAPI/Swagger

Generate API documentation using Django REST Framework's built-in schema generation:

```python
from rest_framework.schemas import get_schema_view

schema_view = get_schema_view(
    title="Weather API",
    description="API for weather data",
    version="1.0.0"
)

urlpatterns = [
    path('api/schema/', schema_view, name='api-schema'),
]
```

### Documentation Requirements

For each endpoint, document:

- HTTP method and URL pattern
- Request parameters and body
- Response format and status codes
- Authentication requirements
- Example request/response

## CORS (Cross-Origin Resource Sharing)

Configure CORS for frontend-backend separation:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "https://app.example.com",
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate all input** before processing
3. **Sanitize output** to prevent XSS
4. **Use parameterized queries** to prevent SQL injection (ORM does this)
5. **Implement rate limiting** to prevent abuse
6. **Don't expose sensitive data** in responses (passwords, tokens, internal IDs)
7. **Use proper authentication** for protected endpoints
8. **Log security events** (failed auth, permission denied)

## Examples

### Complete Django REST Framework View

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import WeatherCache
from .serializers import WeatherSerializer

class WeatherDetailAPIView(APIView):
    """
    Retrieve, update, or delete weather data for a specific city.

    GET /api/v1/weather/{city}/
    PUT /api/v1/weather/{city}/
    PATCH /api/v1/weather/{city}/
    DELETE /api/v1/weather/{city}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, city: str):
        """Retrieve weather data for a city."""
        weather = get_object_or_404(WeatherCache, city__iexact=city)
        serializer = WeatherSerializer(weather)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, city: str):
        """Replace entire weather record."""
        weather = get_object_or_404(WeatherCache, city__iexact=city)
        serializer = WeatherSerializer(weather, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"error": {"code": "VALIDATION_ERROR", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, city: str):
        """Partially update weather record."""
        weather = get_object_or_404(WeatherCache, city__iexact=city)
        serializer = WeatherSerializer(weather, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"error": {"code": "VALIDATION_ERROR", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, city: str):
        """Delete weather record."""
        weather = get_object_or_404(WeatherCache, city__iexact=city)
        weather.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

## References

- [REST API Tutorial](https://restfulapi.net/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
