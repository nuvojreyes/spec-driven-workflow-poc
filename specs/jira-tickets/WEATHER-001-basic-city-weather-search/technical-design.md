# Technical Design: Basic City Weather Search

**Feature ID**: WEATHER-001  
**Created**: 2026-02-02  
**Owner**: Architect Agent  
**Status**: Draft  
**Confidence Score**: 88%

---

## Design Overview

### Objective

Design and implement a fast, reliable city-based weather search system that fetches real-time weather data from an external API, caches results efficiently, and displays comprehensive weather information with temperature unit conversion capabilities.

### Approach

**Three-tier architecture** with clear separation of concerns:

1. **Backend (Django)**: REST API layer handling external API integration, caching, validation, and business logic
2. **Frontend (Angular)**: Responsive SPA with reactive state management, user input handling, and unit conversion
3. **Data Layer**: SQLite (dev) / PostgreSQL (prod) for weather data caching

**Key Principles**:

- API-first design with clear contracts
- Client-side unit conversion (no server round-trips)
- Aggressive caching with stale-data fallback
- Security-first (OWASP compliance)
- Performance-optimized (<2s response time)

### Key Design Decisions

1. **Weather API Provider: OpenWeatherMap**
   - **Rationale**:
     - Free tier offers 1000 calls/day (sufficient with caching)
     - Reliable API with 99.9% uptime
     - Comprehensive weather data (current + forecast)
     - Good documentation and community support
   - **Alternatives considered**:
     - WeatherAPI.com (similar features, less mature)
     - AccuWeather API (limited free tier)
   - **Trade-offs**:
     - Pros: Battle-tested, reliable, good DX
     - Cons: Rate limits require careful caching strategy

2. **Caching Strategy: Database-Backed with 30-Minute TTL**
   - **Rationale**:
     - Reduces API calls by ~70% (target >60% cache hit rate)
     - Enables stale-data serving on API failures
     - Persistent across server restarts
     - Simple to implement and maintain
   - **Alternatives considered**:
     - Redis cache (overkill for MVP, adds complexity)
     - Memory cache (lost on restart, not shared across instances)
     - No caching (too expensive, 1000 calls/day insufficient)
   - **Trade-offs**:
     - Pros: Simple, persistent, reliable, cost-effective
     - Cons: Slightly slower than Redis (acceptable for 30-min TTL)

3. **Temperature Unit Conversion: Client-Side**
   - **Rationale**:
     - No API calls needed for unit toggle
     - Instant conversion (better UX)
     - Reduces server load
     - Local storage for preference persistence
   - **Alternatives considered**:
     - Server-side conversion (unnecessary round-trip)
     - Fetch both units from API (wastes bandwidth)
   - **Trade-offs**:
     - Pros: Fast, offline-capable, reduces server load
     - Cons: Conversion logic in frontend (acceptable, simple formula)

4. **Input Validation: Dual-Layer (Client + Server)**
   - **Rationale**:
     - Client: Immediate feedback, prevents invalid API calls
     - Server: Security enforcement, prevents malicious requests
     - Defense in depth
   - **Alternatives considered**:
     - Client-only (insecure, bypass-able)
     - Server-only (poor UX, wasted API calls)
   - **Trade-offs**:
     - Pros: Secure, good UX, prevents wasted API calls
     - Cons: Slight code duplication (acceptable)

---

## Architecture

### System Components

```
┌────────────────────────────────────────────────────────────────┐
│                         User Browser                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Angular Frontend (Port 4200)                  │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │ WeatherSearch  │  │ WeatherService│  │ UnitConverter│ │  │
│  │  │   Component    │→ │  (HTTP Client)│  │   Service    │ │  │
│  │  └────────────────┘  └───────┬──────┘  └─────────────┘  │  │
│  └────────────────────────────────│─────────────────────────┘  │
└────────────────────────────────────│─────────────────────────┘
                                     │ HTTPS
                                     ↓
┌────────────────────────────────────────────────────────────────┐
│                  Django Backend (Port 8000)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Django REST API                        │  │
│  │  ┌────────────┐  ┌───────────────┐  ┌─────────────────┐  │  │
│  │  │ Weather    │  │ WeatherService│  │ CacheManager    │  │  │
│  │  │ ViewSet    │→ │  (Business    │→ │                 │  │  │
│  │  │ /api/      │  │   Logic)      │  │                 │  │  │
│  │  │ weather    │  └───────┬───────┘  └────────┬────────┘  │  │
│  │  └────────────┘          │                   │           │  │
│  └────────────────────────────│───────────────────│───────────┘  │
│                               │                   │              │
│                               ↓                   ↓              │
│  ┌───────────────────────────────────┐  ┌──────────────────┐   │
│  │   External Weather API            │  │   Database       │   │
│  │   (OpenWeatherMap)                │  │   (PostgreSQL)   │   │
│  │   - GET /weather?q={city}         │  │   - WeatherCache │   │
│  │   - API Key Auth                  │  │     table        │   │
│  └───────────────────────────────────┘  └──────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Component Descriptions

#### Component 1: Angular Frontend

- **Purpose**: User interface for weather search with responsive design
- **Technology**: Angular 16, TypeScript 5.1, RxJS 7.8
- **Responsibilities**:
  - Render search UI (input, button, results)
  - Validate user input (client-side)
  - Make HTTP calls to backend API
  - Handle loading states and errors
  - Convert temperature units client-side
  - Persist unit preference to local storage
  - Display weather data responsively
- **Interfaces**:
  - HTTP API: `GET /api/weather?city={name}`
  - Local Storage: `weatherUnitPreference` key

#### Component 2: Django REST API

- **Purpose**: Backend API layer handling weather data orchestration
- **Technology**: Django 4.2+, Django REST Framework
- **Responsibilities**:
  - Expose `/api/weather` endpoint
  - Validate and sanitize input (server-side)
  - Check cache before external API call
  - Fetch data from OpenWeatherMap API
  - Store results in cache
  - Return JSON response
  - Handle errors gracefully
  - Log metrics for monitoring
- **Interfaces**:
  - REST API: `GET /api/weather?city={name}`
  - External API: OpenWeatherMap
  - Database: WeatherCache model

#### Component 3: Weather Service (Backend)

- **Purpose**: Business logic for weather data retrieval
- **Technology**: Python 3.x, requests library
- **Responsibilities**:
  - Coordinate cache lookup and external API calls
  - Implement caching strategy (30-min TTL)
  - Handle API timeouts (5-second limit)
  - Parse and validate API responses
  - Implement retry logic
  - Serve stale data on API failures
- **Interfaces**:
  - Called by Django ViewSet
  - Calls CacheManager and External API

#### Component 4: Cache Manager

- **Purpose**: Manage weather data caching
- **Technology**: Django ORM, PostgreSQL
- **Responsibilities**:
  - Check cache for fresh data (<30 minutes old)
  - Store weather data with timestamp
  - Invalidate expired cache entries
  - Provide cache hit/miss metrics
  - Support stale-data retrieval
- **Interfaces**:
  - Django ORM queries
  - WeatherCache model CRUD operations

#### Component 5: Unit Converter Service (Frontend)

- **Purpose**: Client-side temperature and wind speed conversion
- **Technology**: TypeScript utility service
- **Responsibilities**:
  - Convert Celsius ↔ Fahrenheit
  - Convert km/h ↔ mph
  - Manage user preference in local storage
  - Provide conversion utilities to components
- **Interfaces**:
  - Angular service injected into components
  - Local Storage API

---

## Data Model

### Database Schema

#### Table: WeatherCache

```sql
CREATE TABLE weather_cache (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),
    temperature_celsius DECIMAL(5, 2) NOT NULL,
    feels_like_celsius DECIMAL(5, 2),
    weather_condition VARCHAR(100) NOT NULL,
    weather_description VARCHAR(255),
    weather_icon_code VARCHAR(10),
    humidity INTEGER NOT NULL,
    wind_speed_kmh DECIMAL(5, 2) NOT NULL,
    wind_direction INTEGER,
    pressure INTEGER,
    visibility INTEGER,
    cloudiness INTEGER,
    sunrise_timestamp BIGINT,
    sunset_timestamp BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_city_name UNIQUE (city_name)
);

CREATE INDEX idx_weather_cache_city_name ON weather_cache (city_name);
CREATE INDEX idx_weather_cache_updated_at ON weather_cache (updated_at);
```

**Fields**:

- `id`: SERIAL PRIMARY KEY - Auto-incrementing ID
- `city_name`: VARCHAR(100) NOT NULL - City name (normalized, lowercase)
- `country_code`: VARCHAR(10) - Country code (e.g., "GB", "US")
- `temperature_celsius`: DECIMAL(5, 2) NOT NULL - Temperature in Celsius
- `feels_like_celsius`: DECIMAL(5, 2) - "Feels like" temperature
- `weather_condition`: VARCHAR(100) NOT NULL - Main condition (e.g., "Clouds", "Rain")
- `weather_description`: VARCHAR(255) - Detailed description (e.g., "scattered clouds")
- `weather_icon_code`: VARCHAR(10) - OpenWeatherMap icon code
- `humidity`: INTEGER NOT NULL - Humidity percentage (0-100)
- `wind_speed_kmh`: DECIMAL(5, 2) NOT NULL - Wind speed in km/h
- `wind_direction`: INTEGER - Wind direction in degrees (0-360)
- `pressure`: INTEGER - Atmospheric pressure in hPa
- `visibility`: INTEGER - Visibility in meters
- `cloudiness`: INTEGER - Cloudiness percentage (0-100)
- `sunrise_timestamp`: BIGINT - Sunrise time (Unix timestamp)
- `sunset_timestamp`: BIGINT - Sunset time (Unix timestamp)
- `created_at`: TIMESTAMP NOT NULL - Record creation time
- `updated_at`: TIMESTAMP NOT NULL - Last update time

**Indexes**:

- Primary index on `id`
- Index on `city_name` for fast cache lookups
- Index on `updated_at` for TTL checks

**Relationships**:

- None (single table for MVP)

**Cache Invalidation Logic**:

- Record is considered fresh if `updated_at` > (NOW() - 30 minutes)
- Stale records can be served with warning if API fails
- Expired records cleaned up via scheduled task (daily)

---

## API Design

### Endpoint 1: GET /api/weather

**Purpose**: Retrieve current weather data for a specified city

**Request**:

```
GET /api/weather?city=London HTTP/1.1
Host: localhost:8000
Accept: application/json
```

**Query Parameters**:

- `city` (required, string, 2-100 chars): City name to search

**Request Validation**:

- City name must be 2-100 characters
- Only letters, spaces, hyphens, and international characters allowed
- Input sanitized (trimmed, normalized)

**Response** (Success - 200 OK):

```json
{
	"status": "success",
	"data": {
		"city": "London",
		"country": "GB",
		"temperature_celsius": 15.5,
		"feels_like_celsius": 14.2,
		"weather_condition": "Clouds",
		"weather_description": "scattered clouds",
		"weather_icon": "03d",
		"humidity": 72,
		"wind_speed_kmh": 12.5,
		"wind_direction": 210,
		"pressure": 1013,
		"visibility": 10000,
		"cloudiness": 40,
		"sunrise": 1675321200,
		"sunset": 1675357800,
		"last_updated": "2026-02-02T10:30:00Z",
		"is_cached": true
	}
}
```

**Response** (Error - 400 Bad Request):

```json
{
	"status": "error",
	"error": {
		"code": "INVALID_INPUT",
		"message": "City name can only contain letters, spaces, and hyphens",
		"field": "city"
	}
}
```

**Response** (Error - 404 Not Found):

```json
{
	"status": "error",
	"error": {
		"code": "CITY_NOT_FOUND",
		"message": "We couldn't find weather for 'Nonexistentcity'. Please check the spelling.",
		"city": "Nonexistentcity"
	}
}
```

**Response** (Error - 429 Too Many Requests):

```json
{
	"status": "error",
	"error": {
		"code": "RATE_LIMIT_EXCEEDED",
		"message": "Too many requests. Please try again in a few minutes.",
		"retry_after": 300
	}
}
```

**Response** (Error - 500 Internal Server Error):

```json
{
	"status": "error",
	"error": {
		"code": "INTERNAL_ERROR",
		"message": "Unable to retrieve weather data. Please try again.",
		"details": null
	}
}
```

**Response** (Stale Data - 200 OK with warning):

```json
{
	"status": "success",
	"data": {
		"...": "..."
	},
	"warning": {
		"code": "STALE_DATA",
		"message": "Showing cached data. Weather service temporarily unavailable.",
		"cache_age_minutes": 45
	}
}
```

**Status Codes**:

- `200 OK`: Success (fresh or stale cached data)
- `400 Bad Request`: Invalid input
- `404 Not Found`: City not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: External API unavailable (no cache available)

**Performance**:

- Target response time: <500ms (backend only, excluding external API)
- Cache hit response: <100ms
- External API call: <2000ms total (5s timeout on external API)

---

## Security Considerations

### Authentication & Authorization

**MVP (No Authentication)**:

- Public API endpoint (no auth required)
- Rate limiting per IP address (100 requests/hour)
- Future: JWT-based auth for registered users

**Rate Limiting**:

```python
# Django rate limiting
@ratelimit(key='ip', rate='100/h', method='GET')
def weather_view(request):
    pass
```

### Data Protection

**Secrets Management**:

- OpenWeatherMap API key stored in environment variable `WEATHER_API_KEY`
- Never committed to git
- Separate keys for dev/staging/production
- Keys loaded from `.env` file (development) or environment (production)

**HTTPS**:

- All production traffic over HTTPS (enforced by middleware)
- HSTS header configured (max-age=31536000)
- External API calls use HTTPS

**CORS**:

```python
# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',  # Development
    'https://weather.example.com'  # Production
]
```

### OWASP Top 10 Mitigations

**A01 Broken Access Control**:

- Public endpoint by design (no access control needed for MVP)
- Rate limiting prevents abuse
- Future: Role-based access for premium features

**A02 Cryptographic Failures**:

- API keys in environment variables only
- HTTPS enforced in production
- No sensitive user data collected (no passwords, PII)

**A03 Injection**:

- Input validation: Regex pattern allows only safe characters
- Django ORM used (parameterized queries, no raw SQL)
- Output encoding for JSON responses
- City name sanitized before external API call

```python
# Input validation
import re
CITY_NAME_PATTERN = re.compile(r'^[a-zA-Z\s\-À-ÿ]{2,100}$')

if not CITY_NAME_PATTERN.match(city_name):
    raise ValidationError("Invalid city name")
```

**A05 Security Misconfiguration**:

- `DEBUG = False` in production
- Django security middleware enabled
- Security headers configured (CSP, X-Frame-Options, X-Content-Type-Options)
- ALLOWED_HOSTS restricted

```python
# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

**A07 Identification and Authentication Failures**:

- N/A for MVP (no authentication)
- Future: Django authentication with bcrypt password hashing

**A10 Server-Side Request Forgery (SSRF)**:

- External API URL hardcoded (not from user input)
- API endpoint validated and whitelisted
- No user-controlled URLs

```python
# SSRF prevention
WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5'
# URL not constructed from user input
```

---

## Performance & Scalability

### Performance Targets

- **API Response Time**: <2 seconds (p95), <1 second (average)
- **Backend Processing**: <500ms (excluding external API call)
- **Frontend Rendering**: <100ms
- **Cache Hit Response**: <100ms
- **Database Query Time**: <50ms
- **External API Timeout**: 5 seconds maximum

### Scalability Strategy

**Horizontal Scaling**:

- Django app is stateless (can run multiple instances)
- Database connection pooling (5-20 connections per instance)
- Load balancer distributes traffic (AWS ALB)
- Auto-scaling based on CPU/memory usage

**Database Scaling**:

- PostgreSQL with read replicas (future)
- Connection pooling prevents connection exhaustion
- Proper indexing for fast queries

**Caching Strategy Scalability**:

- Database cache scales with database
- Future: Redis cluster for distributed caching
- Cache warming for popular cities

### Caching Strategy

**Cache Layers**:

1. **Database Cache (Primary)**:
   - TTL: 30 minutes
   - Stores complete weather data
   - Shared across all app instances
   - Persistent across restarts

2. **Browser Cache (Future)**:
   - HTTP cache headers (`Cache-Control: max-age=1800`)
   - Reduces backend load for repeated requests

**Cache Key Strategy**:

```python
cache_key = f"{city_name.lower()}_{date.today()}"
```

**Cache Invalidation**:

- Time-based: 30-minute TTL
- Manual: Admin endpoint to clear cache (future)
- Automatic cleanup: Daily job removes entries >24 hours old

**Cache Hit/Miss Flow**:

```
1. Request received
2. Normalize city name (lowercase, trim)
3. Check database cache
4. IF cache exists AND fresh (< 30 min):
     - Return cached data (cache hit)
   ELSE IF cache exists AND stale:
     - Call external API
     - IF API succeeds: Update cache, return fresh data
     - IF API fails: Return stale data with warning
   ELSE (no cache):
     - Call external API
     - Store in cache
     - Return data
```

### Optimization Techniques

**Backend**:

- Database connection pooling
- Index on `city_name` and `updated_at` columns
- Async external API calls (Django async views)
- Bulk cache cleanup (scheduled task)
- Query optimization (select only needed fields)

**Frontend**:

- Lazy loading for forecast data (future)
- Debounced autocomplete (future)
- Local storage for unit preference (no server call)
- Minified and bundled JavaScript
- Image optimization (weather icons from CDN)

**Network**:

- GZIP compression enabled
- CDN for static assets (future)
- HTTP/2 for multiplexing

---

## Testing Strategy

### Unit Tests

**Backend (Python)**:

Target Coverage: >90%

Tests to implement:

- `test_weather_api_client.py`:
  - Test OpenWeatherMap API integration
  - Test API response parsing
  - Test timeout handling
  - Test error response handling
  - Mock external API calls

- `test_cache_manager.py`:
  - Test cache hit scenario
  - Test cache miss scenario
  - Test stale data retrieval
  - Test cache expiration logic
  - Test cache key generation

- `test_weather_service.py`:
  - Test weather data retrieval flow
  - Test fallback to stale data
  - Test error handling
  - Test input validation

- `test_weather_views.py`:
  - Test API endpoint responses
  - Test input validation
  - Test error responses (400, 404, 429, 500)
  - Test rate limiting

**Frontend (TypeScript)**:

Target Coverage: >85%

Tests to implement:

- `weather-search.component.spec.ts`:
  - Test search input validation
  - Test search button enable/disable
  - Test loading state display
  - Test error message display
  - Test weather data display

- `weather.service.spec.ts`:
  - Test HTTP calls to backend
  - Test error handling
  - Test response transformation

- `unit-converter.service.spec.ts`:
  - Test Celsius to Fahrenheit conversion
  - Test Fahrenheit to Celsius conversion
  - Test km/h to mph conversion
  - Test unit preference persistence

### Integration Tests

**Backend Integration Tests**:

- Test full weather retrieval flow (input → cache check → API call → response)
- Test database cache operations with real PostgreSQL (test database)
- Test external API integration with OpenWeatherMap (use test API key)
- Test rate limiting with multiple requests
- Test concurrent request handling

**Frontend-Backend Integration**:

- Test frontend can successfully call backend API
- Test CORS configuration
- Test error propagation from backend to frontend

### End-to-End Tests

**Playwright E2E Tests**:

Location: `qa/tests/weather-search.spec.ts`

Test scenarios:

1. **Happy path**: Search for "London" → See weather data
2. **Invalid input**: Enter "City123" → See error message
3. **City not found**: Search for "Nonexistentcity" → See error message
4. **Loading state**: Submit search → See loading indicator
5. **Unit toggle**: Toggle to Fahrenheit → See converted temperature
6. **Unit persistence**: Reload page → Unit preference retained
7. **Responsive design**: Test on mobile, tablet, desktop viewports
8. **Keyboard accessibility**: Tab navigation, Enter to submit
9. **Error recovery**: Trigger error → Clear input → Search again

Requirements:

- Backend must be running at `http://127.0.0.1:8000`
- Test database with sample cache data
- Mock external API for consistent test results (optional)

### Test Data

**Sample Cities for Testing**:

- London, GB
- New York, US
- Tokyo, JP
- São Paulo, BR
- Sydney, AU

**Edge Cases**:

- Cities with spaces: "New York"
- Cities with hyphens: "Winston-Salem"
- Cities with accents: "São Paulo", "Zürich"
- Non-existent cities: "Nonexistentcity123"

**Mock API Responses**:

- Success response (200)
- City not found (404)
- Rate limit (429)
- Server error (500)
- Timeout (simulate 6-second delay)

---

## Deployment Strategy

### Environment Setup

**Development**:

```bash
# Backend
export WEATHER_API_KEY="dev_key_here"
export DEBUG=True
export DATABASE_URL="sqlite:///db.sqlite3"

# Frontend
export API_BASE_URL="http://localhost:8000"
```

**Production (AWS Fargate)**:

```bash
# Environment variables in ECS task definition
WEATHER_API_KEY=<secret_from_aws_secrets_manager>
DEBUG=False
DATABASE_URL=<postgresql_connection_string>
ALLOWED_HOSTS=weather.example.com
SECRET_KEY=<django_secret_key>
```

**Required Environment Variables**:

- `WEATHER_API_KEY` (critical): OpenWeatherMap API key
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (False in production)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

### Migration Plan

**Database Migrations**:

```bash
# Create migration for WeatherCache model
python manage.py makemigrations

# Apply migration
python manage.py migrate

# Verify migration
python manage.py showmigrations
```

**Deployment Steps**:

1. **Prepare**:
   - Run tests: `python manage.py test && cd qa && npm test`
   - Build frontend: `cd frontend && npm run build`
   - Collect static files: `python manage.py collectstatic`

2. **Deploy Backend**:
   - Build Docker image
   - Push to ECR
   - Update ECS task definition
   - Run database migrations
   - Deploy new task revision

3. **Deploy Frontend**:
   - Build production bundle
   - Upload to S3
   - Invalidate CloudFront cache

4. **Verify**:
   - Health check endpoint: `GET /api/health`
   - Test weather search
   - Check logs for errors

### Rollback Plan

**Immediate Rollback**:

1. **ECS Rollback**:

   ```bash
   aws ecs update-service \
     --cluster weather-cluster \
     --service weather-backend \
     --task-definition weather-backend:previous-revision
   ```

2. **Database Rollback** (if migration fails):

   ```bash
   python manage.py migrate api <previous_migration_number>
   ```

3. **Frontend Rollback**:
   - Restore previous S3 version
   - Invalidate CloudFront cache

**Rollback Triggers**:

- Error rate >5% for 5 minutes
- Response time >5 seconds for 5 minutes
- Health check failures
- Critical bugs reported

---

## Risks & Mitigations

### Risk 1: External API Rate Limit Exceeded

- **Impact**: High (service unusable if API calls fail)
- **Probability**: Medium (possible if cache hit rate <60%)
- **Mitigation**:
  - Aggressive 30-minute caching (target 70% cache hit rate)
  - Monitor API usage daily
  - Serve stale data if rate limit hit
  - Alert administrators at 80% of daily quota
  - Upgrade to paid tier if needed (~$40/month for 60,000 calls)

### Risk 2: External API Downtime or Timeout

- **Impact**: High (no fresh data available)
- **Probability**: Medium (99.9% uptime = ~40 minutes/month downtime)
- **Mitigation**:
  - Serve stale cached data with warning message
  - 5-second timeout to prevent hanging requests
  - Retry logic (1 retry with exponential backoff)
  - Monitor external API status page
  - User-friendly error messages

### Risk 3: Database Performance Degradation

- **Impact**: Medium (slow response times)
- **Probability**: Low (with proper indexing)
- **Mitigation**:
  - Index on `city_name` and `updated_at`
  - Connection pooling (5-20 connections)
  - Regular cache cleanup (daily job)
  - Database monitoring and alerting
  - Read replicas for scaling (future)

### Risk 4: Security Vulnerability (Input Validation Bypass)

- **Impact**: High (potential SQL injection or XSS)
- **Probability**: Low (with dual-layer validation)
- **Mitigation**:
  - Client and server-side validation
  - Django ORM (no raw SQL)
  - Input sanitization with regex
  - Security testing (OWASP ZAP scan)
  - Regular dependency updates
  - Follow OWASP guidelines

### Risk 5: Poor Frontend Performance on Mobile

- **Impact**: Medium (user experience degraded)
- **Probability**: Low (with optimization)
- **Mitigation**:
  - Responsive design testing
  - Lazy loading for non-critical data
  - Minified and bundled JavaScript
  - Image optimization (WebP format)
  - Lighthouse performance audits (target >90)

### Risk 6: Unit Conversion Bugs

- **Impact**: Low (user sees incorrect temperature)
- **Probability**: Medium (conversion formula errors)
- **Mitigation**:
  - Comprehensive unit tests for conversion logic
  - Test with known values (0°C = 32°F, 100°C = 212°F)
  - Manual testing during QA
  - Display both units in tooltip (future)

---

## Open Questions

- [ ] **OpenWeatherMap API Key**: Should we use separate API keys for dev/staging/prod, or share one?
  - Recommendation: Separate keys for better tracking and isolation

- [ ] **Cache Cleanup Strategy**: Should we clean up cache entries >24 hours old daily, or keep indefinitely?
  - Recommendation: Daily cleanup to prevent unbounded growth

- [ ] **Error Monitoring**: Which service for production error monitoring (Sentry, CloudWatch, Rollbar)?
  - Recommendation: Sentry for Django + Angular (free tier available)

- [ ] **Analytics**: Should we track search queries for analytics (city popularity)?
  - Recommendation: Yes, but anonymously (no IP addresses or PII)

---

## Dependencies

### Technology Dependencies

**Backend**:

- Django: 4.2+
- djangorestframework: 3.14+
- django-cors-headers: 4.0+
- django-ratelimit: 4.0+
- psycopg2-binary: 2.9+ (PostgreSQL adapter)
- requests: 2.31+ (HTTP client for external API)
- python-decouple: 3.8+ (environment variable management)

**Frontend**:

- @angular/core: 16.x
- @angular/common: 16.x
- @angular/platform-browser: 16.x
- @angular/forms: 16.x
- rxjs: 7.8+
- TypeScript: 5.1+

**Testing**:

- Playwright: 1.38+
- pytest: 7.4+ (backend unit tests)
- pytest-django: 4.5+
- Jasmine/Karma (frontend unit tests)

**Infrastructure**:

- Docker: 24.x
- PostgreSQL: 15.x
- AWS Fargate (production)
- AWS RDS PostgreSQL (production)

### Service Dependencies

- **OpenWeatherMap API**: Current weather data
  - Free tier: 1000 calls/day
  - Endpoint: `https://api.openweathermap.org/data/2.5/weather`
  - Documentation: https://openweathermap.org/current

- **AWS Services** (Production):
  - ECS Fargate: Container orchestration
  - RDS PostgreSQL: Database
  - CloudFront: CDN for frontend (future)
  - S3: Frontend static files hosting (future)
  - Secrets Manager: API key storage
  - CloudWatch: Logging and monitoring

---

## Approval

**Submitted by**: Architect Agent  
**Submitted on**: 2026-02-02  
**Reviewed by**: [Pending User Review]  
**Approval Status**: Pending  
**Approval Date**: [Pending]

---

## Approval Request

I've completed the technical design for WEATHER-001: Basic City Weather Search.

**Location**: `specs/jira-tickets/WEATHER-001-basic-city-weather-search/technical-design.md`

**Key Design Decisions**:

1. **OpenWeatherMap** for weather API (free tier, reliable, good DX)
2. **Database-backed caching** with 30-min TTL (simple, persistent, cost-effective)
3. **Client-side unit conversion** (instant UX, reduces server load)
4. **Dual-layer validation** (security + UX)

**Architecture Highlights**:

- Clear separation: Angular frontend ↔ Django API ↔ External API + Cache
- Security-first: OWASP compliance, input validation, secrets management
- Performance-optimized: Caching, indexing, connection pooling
- Scalable: Stateless design, horizontal scaling ready

**Risks Addressed**:

- External API rate limits → 30-min caching (70% hit rate target)
- API downtime → Stale data fallback
- Database performance → Proper indexing and connection pooling
- Security → Dual validation, OWASP guidelines, Django ORM

**Confidence Score**: 88%

High confidence in core architecture. Remaining 12% uncertainty:

- Cache hit rate may need tuning (30 min vs 60 min TTL)
- OpenWeatherMap API behavior under edge cases (international cities)
- Actual production performance under load (will validate with monitoring)

**Next Steps** (if approved):

Create detailed implementation plan (`tasks.md`) with:

- 15-20 atomic tasks across backend, frontend, QA, DevOps
- Clear dependencies and effort estimates
- Task breakdown by phase (Foundation → Core → Integration → Deployment)

**Questions for Review**:

1. Is OpenWeatherMap acceptable or prefer WeatherAPI.com?
2. Should cache cleanup be daily or weekly?
3. Any additional security concerns to address?
4. Should we include analytics tracking in MVP?

Please review and approve to proceed to implementation planning (Gate 3).
