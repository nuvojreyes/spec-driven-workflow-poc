---
description: "Synchronize documentation with current code, requirements, and technical design"
tools:
  [
    "search/changes",
    "search/codebase",
    "edit/editFiles",
    "atlassian/atlassian-mcp-server/search",
    "search/usages",
  ]
---

# Synchronize Documentation

You are updating project documentation to reflect the current state of the codebase, requirements, and technical design.

## Documentation Artifacts to Sync

1. **README.md** - User-facing project documentation
2. **AGENTS.md** - AI agent instructions
3. **technical-design.md** - Technical architecture (if changed)
4. **tasks.md** - Implementation plan (if changed)
5. **API Documentation** - OpenAPI/Swagger specs, inline docs
6. **Code Comments** - Inline documentation
7. **Component README files** - Backend, Frontend, QA specific docs

**Note**: Requirements are tracked in Jira tickets (accessed via MCP), not in requirements.md files.

## Synchronization Process

### Step 1: Audit Current State

Compare documentation against reality:

```markdown
## Documentation Audit

| Document            | Last Updated | Status      | Issues Found              |
| ------------------- | ------------ | ----------- | ------------------------- |
| README.md           | 2025-12-01   | ⚠️ Outdated | Missing new API endpoints |
| AGENTS.md           | 2026-01-15   | ✅ Current  | None                      |
| requirements.md     | 2026-01-20   | ✅ Current  | None                      |
| technical-design.md | 2025-12-01   | ⚠️ Outdated | Architecture changed      |
| backend/README.md   | 2025-11-01   | ❌ Stale    | Setup steps incorrect     |
| API docs            | Never        | ❌ Missing  | No API documentation      |
```

### Step 2: README.md Updates

Check README.md against current project:

#### Installation/Setup Instructions

Verify these work:

```bash
# Test setup commands listed in README
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
# ... etc
```

Update if broken or outdated.

#### Features Section

Compare with `requirements.md`:

```markdown
## Features

- ✅ Weather search by city name (REQ-001)
- ✅ Historical weather data (REQ-002)
- 🚧 Weather alerts (REQ-003) - In development
- ❌ International support (REQ-004) - Planned
```

#### API Documentation

List current endpoints:

````markdown
## API Endpoints

### GET /api/weather/

Get current weather for a city.

**Parameters**:

- `city` (string, required): City name

**Response** (200 OK):

```json
{
	"city": "London",
	"temperature": 15,
	"conditions": "Cloudy",
	"humidity": 75
}
```
````

**Errors**:

- 400: Invalid city parameter
- 404: City not found
- 500: External API error

````

#### Technology Stack

Update versions:
```markdown
## Tech Stack

**Backend**:
- Python 3.11
- Django 4.2.9
- djangorestframework 3.14.0

**Frontend**:
- Angular 16.2.0
- TypeScript 5.1.6
- RxJS 7.8.1

**Testing**:
- Playwright 1.38.0
- pytest 7.4.3
````

#### Architecture Diagram

Update if architecture changed:

```markdown
## Architecture
```

┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│ Angular │─────▶│ Django │─────▶│ External │
│ Frontend │ │ Backend │ │ Weather API │
│ (Port 4200)│ │ (Port 8000)│ └──────────────┘
└─────────────┘ └─────────────┘
│ │
│ ▼
│ ┌─────────────┐
│ │ SQLite │
│ │ Database │
│ └─────────────┘
│
▼
┌─────────────┐
│ Playwright │
│ E2E Tests │
└─────────────┘

```

```

### Step 3: AGENTS.md Updates

Ensure AGENTS.md reflects current workflows:

#### Setup Commands

Test every command:

```bash
# Backend setup
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver

# Frontend setup
cd frontend && npm install && npm start

# QA setup
cd qa && npm install && npx playwright install && npm test
```

Update if any fail.

#### New Scripts/Commands

Add any new npm scripts or management commands:

```markdown
## Development Commands

**Backend**:

- `python manage.py runserver` - Start dev server
- `python manage.py test` - Run tests
- `python manage.py makemigrations` - Create migrations
- `python manage.py createsuperuser` - Create admin user (NEW!)

**Frontend**:

- `npm start` - Start dev server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run lint` - Check code style (NEW!)
```

#### File Structure Changes

Update if new directories or key files added:

```markdown
## Project Structure
```

backend/
api/ - REST API application
views.py - API endpoints
models.py - Database models
serializers.py - DRF serializers (NEW!)

```

```

### Step 4: Technical Documentation Updates

#### Update technical-design.md

If implementation deviated from design:

```markdown
## Changes from Original Design

**Data Model**: Changed User.city_preferences from JSONField to separate CityPreference model for better querying.

**API Contract**: Added `last_updated` timestamp to weather response for caching support.

**Security**: Implemented rate limiting using django-ratelimit (not in original design).
```

Update diagrams, schemas, and specifications to match reality.

#### Update requirements.md

If requirements were refined during implementation:

```markdown
## REQ-001: Weather Search (UPDATED)

~~WHEN a user enters a city name and clicks "Search"~~
WHEN a user enters a city name and presses Enter OR clicks "Search"

**Rationale**: Added keyboard support for better UX
```

Mark requirements as implemented:

```markdown
**Status**: ✅ Implemented (2026-01-25)
**Tested**: ✅ E2E tests pass
**Deployed**: ✅ Production (v1.2.0)
```

### Step 5: API Documentation

#### Generate/Update OpenAPI Spec

For Django REST Framework:

```python
# backend/project/urls.py
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Weather API",
        default_version='v1',
        description="Weather search and history API",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('swagger/', schema_view.with_ui('swagger')),
    path('redoc/', schema_view.with_ui('redoc')),
]
```

#### Document Inline

Add docstrings:

```python
class WeatherView(APIView):
    """
    Weather API endpoint.

    GET: Retrieve current weather for a city
    POST: Save weather search to history

    Query Parameters:
        city (str): City name (required, max 100 chars)

    Returns:
        200: Weather data
        400: Invalid parameters
        404: City not found
        500: External API error

    Example:
        GET /api/weather/?city=London
    """
    def get(self, request):
        # ...
```

### Step 6: Code Comments

Update comments to match code:

**Bad** (outdated comment):

```python
# Fetch weather from OpenWeather API
response = requests.get(WEATHER_API_URL)  # Now using WeatherStack!
```

**Good**:

```python
# Fetch weather from WeatherStack API
# See: https://weatherstack.com/documentation
response = requests.get(WEATHER_API_URL, timeout=5)
```

**Add comments for complex logic**:

```python
def calculate_heat_index(temp, humidity):
    """
    Calculate heat index using Rothfusz regression.

    Heat index represents "feels like" temperature.
    Formula: https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml

    Args:
        temp: Temperature in Celsius
        humidity: Relative humidity (0-100)

    Returns:
        Heat index in Celsius
    """
    # Convert to Fahrenheit for formula
    temp_f = temp * 9/5 + 32

    # Rothfusz regression
    hi = -42.379 + 2.04901523*temp_f + 10.14333127*humidity
    # ... complex formula continues
```

### Step 7: Component-Specific Docs

#### Backend README

Update `backend/README.md`:

```markdown
# Backend - Django REST API

## Setup

[Current setup steps]

## Environment Variables

- `DEBUG` - Debug mode (default: False)
- `SECRET_KEY` - Django secret key (required)
- `WEATHER_API_KEY` - WeatherStack API key (required)
- `ALLOWED_HOSTS` - Comma-separated hosts (default: localhost)

## Database Migrations

[Current migration steps]

## API Endpoints

[Link to Swagger docs or list endpoints]

## Testing

[Current test commands]
```

#### Frontend README

Update `frontend/README.md`:

````markdown
# Frontend - Angular SPA

## Development Server

[Current dev server steps]

## Environment Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
	production: false,
	apiUrl: "http://localhost:8000/api",
};
```
````

## Component Structure

- `app/weather/` - Weather search feature
- `app/shared/` - Shared components and services
- `app/core/` - Core services (API, auth)

## Build

[Current build steps]

````

#### QA README

Update `qa/README.md`:
```markdown
# QA - Playwright E2E Tests

## Prerequisites

Backend must be running at http://127.0.0.1:8000

## Running Tests

[Current test commands]

## Test Organization

- `tests/weather-search.spec.ts` - Weather search flows (REQ-001)
- `tests/weather-history.spec.ts` - Weather history (REQ-002)

## Configuration

See `playwright.config.ts` for browser and timeout settings.
````

## Documentation Checklist

Before finalizing:

- [ ] All setup commands tested and work
- [ ] All API endpoints documented
- [ ] Technology stack versions current
- [ ] Architecture diagrams reflect reality
- [ ] Code comments accurate and helpful
- [ ] requirements.md status updated
- [ ] technical-design.md matches implementation
- [ ] Component READMEs updated
- [ ] Examples in docs are valid
- [ ] Links in docs not broken
- [ ] Spelling and grammar checked

## Commit Documentation Changes

```bash
git add README.md AGENTS.md backend/README.md
git commit -m "docs: update documentation to reflect current state

- Updated API endpoints in README
- Added new environment variables to backend docs
- Updated AGENTS.md with new commands
- Fixed outdated setup instructions
- Added OpenAPI documentation

Refs: REQ-001, REQ-002"
```

## Automation Tips

Consider automating documentation:

**API Docs**: Use drf-yasg (Django) or Compodoc (Angular)

**Changelog**: Generate from git commits

```bash
# Use conventional commits to auto-generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

**Dependency Versions**: Auto-extract from package.json, requirements.txt

```bash
# In README template:
<!-- versions:start -->
<!-- Auto-generated by script -->
- Django: 4.2.9
- Angular: 16.2.0
<!-- versions:end -->
```

## Best Practices

- **Document as you code**: Update docs in same PR as code changes
- **Keep it DRY**: Link to authoritative sources instead of duplicating
- **Version docs**: Tag/branch docs with code releases
- **Test docs**: Verify all commands and examples actually work
- **User-focused**: Write for the reader, not for yourself
- **Examples over explanations**: Show don't tell
- **Maintain history**: Keep changelog and migration guides

## Reference

- `README.md` - Project overview
- `AGENTS.md` - AI agent instructions
- `requirements.md` - Feature specifications
- `technical-design.md` - Architecture details
- `.github/instructions/` - Coding standards
