## Implementation Tasks: Basic City Weather Search (Simplified, Atomic)

**Feature ID**: WEATHER-001
**Created**: 2026-02-02
**Owner**: Architect Agent
**Status**: Draft

---

Purpose: concise, actionable, atomic steps for each task. Each checklist item should be small (15–240 minutes). Agents must request explicit human approval before marking items complete.

---

### TASK-001: Create Django `WeatherCache` model

- [x] Add `WeatherCache` class to `backend/api/models.py` with fields: `city_name`, `temperature`, `humidity`, `wind_speed`, `updated_at`.
- [x] Add unique constraint on `city_name` and indexes on `city_name` and `updated_at`.
- [x] Implement `__str__` and a simple `clean()` to normalize `city_name` (lowercase + trim).
- [x] Run `python manage.py makemigrations` and commit migration file.
- [x] Run `python manage.py migrate` and verify table exists.
- [x] Add unit test that creates and retrieves a `WeatherCache` entry.

Acceptance: migration present, DB table exists, unit test passes.

---

### TASK-002: Implement OpenWeatherMap API client

- [ ] Create `backend/api/weather_api_client.py` with `WeatherAPIClient` class.
- [ ] Read `WEATHER_API_KEY` from environment and raise a helpful error if missing.
- [ ] Implement `get_weather(city_name)` using HTTPS, 5s timeout, and 1 retry (exponential backoff).
- [ ] Map common HTTP errors to explicit exceptions (`CityNotFoundError`, `RateLimitError`, generic `APIError`).
- [ ] Add logging (no secrets) and docstrings.
- [ ] Add unit tests mocking success, 404, timeout, and 429 responses.

Acceptance: client added, env var used, tests pass.

---

### TASK-003: WeatherService (orchestration)

- [ ] Create `backend/api/weather_service.py` with `WeatherService` class and `get_weather(city_name)` method.
- [ ] Normalize input and check cache first.
- [ ] If cache is fresh (<30 min) return cached data.
- [ ] If cache stale or missing, call `WeatherAPIClient` and update cache atomically.
- [ ] On API failure, return stale cache if available with a `warning` flag.
- [ ] Add unit tests for cache hit/miss/stale-fallback and normalization.

Acceptance: service added and tests cover behaviors.

---

### TASK-004: CacheManager utility

- [ ] Implement `backend/api/cache_manager.py` with `get`, `save` (atomic `update_or_create`), `is_fresh`, and `cleanup_old_entries`.
- [ ] Add a simple management command for `cleanup_old_entries`.
- [ ] Add unit tests for `get`, `save`, `is_fresh`, and cleanup.

Acceptance: cache manager implemented and tested.

---

### TASK-005: Weather API endpoint

- [ ] Add GET `/api/weather?city=<name>` in `backend/api/views.py` (APIView or ViewSet).
- [ ] Validate `city` parameter (2–100 chars) using a serializer or validator.
- [ ] Call `WeatherService.get_weather()` and return JSON with `status`, `data`, `warning`.
- [ ] Add rate limiting (100 requests/hour per IP) and CORS as needed.
- [ ] Add unit tests for valid/invalid requests and error paths.

Acceptance: endpoint implemented and tests pass.

---

### TASK-006: Input validation utilities

- [ ] Add `backend/api/validators.py` with `validate_city_name()` regex for international chars.
- [ ] Wire validator into serializers/views.
- [ ] Add unit tests covering valid and invalid inputs.

Acceptance: validation exists and is tested.

---

### TASK-007: Response TTL and headers

- [ ] Ensure API responses include `cache_ttl` field and `Cache-Control` header.
- [ ] Make TTL configurable in settings (default 1800s).
- [ ] Add a unit test verifying header and TTL.

Acceptance: TTL present and configurable.

---

### TASK-008: Frontend service

- [ ] Create `frontend/src/app/services/weather.service.ts` with `getWeather(city)` returning unified model.
- [ ] Handle loading, success, error states.
- [ ] Add unit tests mocking HTTP client.

Acceptance: frontend service added and tested.

---

### TASK-009: Search component

- [ ] Create `SearchComponent` with input and submit button.
- [ ] Validate input client-side (min 2 chars) and show validation errors.
- [ ] Connect to `weather.service` and display loading state.
- [ ] Add unit tests for interactions.

Acceptance: component works and tests pass.

---

### TASK-010: Results UI

- [ ] Implement results card showing temp, conditions, humidity, wind.
- [ ] Show stale-data warning when applicable.
- [ ] Add accessibility attributes and role-based locators used by tests.
- [ ] Add snapshot/aria tests as appropriate.

Acceptance: UI displays required fields and indicates stale data.

---

### TASK-011: Unit conversion utility

- [ ] Add `src/app/utils/convert.ts` with Celsius↔Fahrenheit functions.
- [ ] Add unit tests for conversions.

Acceptance: utility added and tested.

---

### TASK-012: Logging & metrics

- [ ] Add logging for cache hit/miss and API errors in backend modules.
- [ ] Add simple counters for `cache_hit`, `cache_miss`, `api_errors` (in-memory or placeholder).
- [ ] Document where logs/metrics are written locally.

Acceptance: logging and basic metrics present.

---

### TASK-013: Backend tests

- [ ] Add unit tests for models, cache manager, API client, and service.
- [ ] Add an integration test that uses mocked external API to exercise flow.

Acceptance: tests added and runnable via `python manage.py test`.

---

### TASK-014: Frontend tests

- [ ] Add Angular integration tests for `SearchComponent` + `weather.service`.
- [ ] Ensure tests run in CI/local with `npm test`.

Acceptance: frontend tests added and passing.

---

### TASK-015: E2E Playwright test

- [ ] Add Playwright test validating search flow and stale-cache scenario.
- [ ] Document how to run E2E locally (backend required).

Acceptance: E2E test exists and can be run locally.

---

### TASK-016: Documentation

- [ ] Update `technical-design.md` with final data shapes and endpoint contract.
- [ ] Add `README.md` in the ticket folder with run instructions and env vars.

Acceptance: docs updated and reproducible steps present.

---

### TASK-017: Deployment checklist

- [ ] Add `WEATHER_API_KEY` to `.env.example` and README deployment notes.
- [ ] Add migration step to deployment checklist.
- [ ] Verify `docker-compose` integration locally.

Acceptance: deployment notes present.

---

### TASK-018: Final review & PR

- [ ] Run the full test suite (backend + frontend + E2E).
- [ ] Create PR `feature/WEATHER-001-core` → `master` with summary of simplification and changes.
- [ ] Request reviews, address comments, and merge.

Acceptance: PR created and merged; mark tasks complete.

# Implementation Tasks: Basic City Weather Search

**Feature ID**: WEATHER-001  
**Created**: 2026-02-02  
**Owner**: Architect Agent  
**Status**: Draft

---

## Task Overview

### Summary

Implementation plan for WEATHER-001 Basic City Weather Search feature, broken down into 18 atomic tasks across four phases: Foundation, Backend Implementation, Frontend Implementation, and Testing & Deployment. Tasks are designed to be completable in 1-4 hours each with clear dependencies and acceptance criteria.

### Estimation

- **Total Effort**: 56 hours
- **Backend Tasks**: 7 tasks, 24 hours
- **Frontend Tasks**: 6 tasks, 18 hours
- **Testing Tasks**: 3 tasks, 10 hours
- **DevOps Tasks**: 2 tasks, 4 hours
- **Developer Count**: 1-2 full-stack developers
- **Timeline**: 2-3 weeks (20 hours/week capacity)

### Dependencies Graph

```
Foundation Phase:
TASK-001 (Django Model) ────────┐
                                 ├─→ TASK-003 (Weather Service)
TASK-002 (External API Client)──┘         │
                                           ↓
Backend Phase:                    TASK-004 (Cache Manager)
TASK-003 ──────────────────────┐          │
TASK-004 ──────────────────────┤          ↓
                                ├─→ TASK-005 (API View)
                                │          │
Frontend Phase:                 │          ↓
TASK-008 (Angular Service) ─────┤    TASK-007 (API Endpoint)
TASK-009 (Unit Converter) ──────┘          │
         │                                  ↓
         └──→ TASK-010 (Search Component) ←┘
                     │
                     ↓
Integration Phase:
TASK-014 (Backend Integration Tests)
TASK-015 (Frontend Integration Tests)
TASK-016 (E2E Tests)
         │
         ↓
TASK-017 (Documentation)
TASK-018 (Deployment)
```

---

## Phase 1: Foundation (Day 1-2)

### TASK-001: Create Django WeatherCache Model

**Status**: Not Started

**Priority**: High  
**Effort**: 3 hours  
**Assignee**: Backend

**Description**:

Create Django model for caching weather data with proper fields, indexes, and constraints. This model will store weather information fetched from the external API to reduce API calls and enable stale-data fallback.

**Acceptance Criteria**:

- [ ] WeatherCache model created in `backend/api/models.py`
- [ ] All required fields defined (see technical-design.md)
- [ ] Unique constraint on `city_name`
- [ ] Indexes created on `city_name` and `updated_at`
- [ ] Model includes `__str__` method for admin interface
- [ ] Migration file created successfully
- [ ] Migration applied to database
- [ ] Model passes Django check (`python manage.py check`)

**Dependencies**:

- None (foundational task)

**Files to Modify**:

- `backend/api/models.py` (create WeatherCache model)
- `backend/api/migrations/000X_create_weather_cache.py` (auto-generated)

**Implementation Steps**:

- [ ] Define WeatherCache model with all fields from schema
- [ ] Add unique constraint on city_name
- [ ] Add Meta class with indexes
- [ ] Implement `__str__` method
- [ ] Register model in admin (optional for MVP)
- [ ] Run `python manage.py makemigrations`
- [ ] Review generated migration file
- [ ] Run `python manage.py migrate`
- [ ] Verify in database (`python manage.py dbshell`)

**Test Coverage**:

- [ ] Model can be created and saved
- [ ] Unique constraint enforced
- [ ] Indexes exist in database
- [ ] Model fields validate correctly

**Notes**:

- Use DECIMAL for temperature and wind speed (precision important)
- City name should be normalized (lowercase) before storage
- Consider adding `clean()` method for data validation

---

### TASK-002: Implement OpenWeatherMap API Client

**Status**: Not Started

**Priority**: High  
**Effort**: 4 hours  
**Assignee**: Backend

**Description**:

Create a Python client for interacting with the OpenWeatherMap API. This client will handle HTTP requests, authentication, error handling, and response parsing.

**Acceptance Criteria**:

- [ ] API client class created in `backend/api/weather_api_client.py`
- [ ] API key loaded from environment variable
- [ ] `get_weather(city_name)` method implemented
- [ ] 5-second timeout configured
- [ ] HTTPS connection verified
- [ ] Response parsing extracts all required fields
- [ ] Error handling for HTTP errors (404, 429, 500, timeout)
- [ ] Retry logic implemented (1 retry with exponential backoff)
- [ ] Client includes logging for debugging

**Dependencies**:

- None (foundational task)

**Files to Create**:

- `backend/api/weather_api_client.py`

**Implementation Steps**:

- [ ] Install `requests` library (already in requirements.txt)
- [ ] Create WeatherAPIClient class
- [ ] Load API key from environment (`os.getenv('WEATHER_API_KEY')`)
- [ ] Implement `get_weather(city_name)` method
- [ ] Configure timeout (5 seconds)
- [ ] Parse JSON response into structured dict
- [ ] Handle HTTP errors (404 → CityNotFoundError, etc.)
- [ ] Add retry logic with exponential backoff
- [ ] Add logging for API calls and errors
- [ ] Write docstrings for methods

**Test Coverage**:

- [ ] Unit test: Successful API call returns parsed data
- [ ] Unit test: City not found raises CityNotFoundError
- [ ] Unit test: Timeout raises TimeoutError
- [ ] Unit test: Rate limit (429) raises RateLimitError
- [ ] Unit test: Retry logic works on transient failures
- [ ] Mock external API in tests (use `responses` or `requests-mock`)

**Notes**:

- API endpoint: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric`
- Use `units=metric` to get Celsius by default
- Handle API response validation (check for required fields)

---

### TASK-003: Implement Weather Service (Business Logic)

**Status**: Not Started

**Priority**: High  
**Effort**: 4 hours  
**Assignee**: Backend

**Description**:

Create the weather service that orchestrates cache lookups and external API calls. This service implements the core business logic for weather data retrieval with caching strategy.

**Acceptance Criteria**:

- [ ] WeatherService class created in `backend/api/weather_service.py`
- [ ] `get_weather(city_name)` method checks cache first
- [ ] Fresh cache data (<30 min) returned immediately
- [ ] Stale cache data triggers API refresh
- [ ] API failures fall back to stale cache data with warning
- [ ] New data stored in cache after successful API call
- [ ] City name normalized (lowercase, trimmed) before processing
- [ ] Service includes logging and metrics

**Dependencies**:

- TASK-001 (WeatherCache model)
- TASK-002 (Weather API Client)

**Files to Create**:

- `backend/api/weather_service.py`

**Implementation Steps**:

- [ ] Create WeatherService class
- [ ] Inject WeatherAPIClient (dependency injection)
- [ ] Implement cache lookup logic (check `updated_at` timestamp)
- [ ] Implement cache freshness check (30-minute TTL)
- [ ] Implement API call and cache update
- [ ] Implement stale-data fallback on API failures
- [ ] Add city name normalization
- [ ] Add logging for cache hits/misses
- [ ] Add metrics tracking (cache hit rate)

**Test Coverage**:

- [ ] Unit test: Cache hit returns cached data
- [ ] Unit test: Cache miss triggers API call
- [ ] Unit test: Stale cache with successful API returns fresh data
- [ ] Unit test: Stale cache with API failure returns stale data with warning
- [ ] Unit test: No cache triggers API call and stores result
- [ ] Unit test: City name normalization works
- [ ] Mock WeatherCache model and API client in tests

**Notes**:

- Cache freshness: `timezone.now() - cache.updated_at < timedelta(minutes=30)`
- Return structure should match API design (status, data, warning)

---

## Phase 2: Backend API (Day 3-5)

### TASK-004: Implement Cache Manager

**Status**: Not Started

**Priority**: High  
**Effort**: 3 hours  
**Assignee**: Backend

**Description**:

Create cache manager utility for interacting with the WeatherCache model. Encapsulates cache CRUD operations and provides clean interface for WeatherService.

**Acceptance Criteria**:

- [ ] CacheManager class created in `backend/api/cache_manager.py`
- [ ] `get(city_name)` method retrieves cache entry
- [ ] `is_fresh(cache_entry)` checks if cache is <30 min old
- [ ] `save(city_name, weather_data)` stores/updates cache
- [ ] `get_stale_data(city_name)` retrieves expired cache
- [ ] `cleanup_old_entries()` removes entries >24 hours old
- [ ] Methods include error handling and logging

**Dependencies**:

- TASK-001 (WeatherCache model)

**Files to Create**:

- `backend/api/cache_manager.py`

**Implementation Steps**:

- [ ] Create CacheManager class
- [ ] Implement `get(city_name)` using Django ORM
- [ ] Implement `is_fresh(cache_entry)` with timedelta check
- [ ] Implement `save(city_name, weather_data)` with update_or_create
- [ ] Implement `get_stale_data(city_name)` for fallback
- [ ] Implement `cleanup_old_entries()` for maintenance
- [ ] Add proper exception handling
- [ ] Add logging for cache operations

**Test Coverage**:

- [ ] Unit test: Get existing cache entry
- [ ] Unit test: Get non-existent entry returns None
- [ ] Unit test: Fresh cache check (< 30 min)
- [ ] Unit test: Stale cache check (> 30 min)
- [ ] Unit test: Save creates new entry
- [ ] Unit test: Save updates existing entry
- [ ] Unit test: Cleanup removes old entries

**Notes**:

- Use Django's `update_or_create()` for atomic save operations
- Consider using `select_for_update()` for race condition handling (optional for MVP)

---

### TASK-005: Create Weather API View

**Status**: Not Started

**Priority**: High  
**Effort**: 4 hours  
**Assignee**: Backend

**Description**:

Create Django REST Framework view/viewset for the `/api/weather` endpoint. Handles HTTP requests, input validation, and response formatting.

**Acceptance Criteria**:

- [ ] WeatherViewSet created in `backend/api/views.py`
- [ ] GET `/api/weather?city=<name>` endpoint implemented
- [ ] Input validation (city name 2-100 chars, valid characters)
- [ ] Calls WeatherService to get data
- [ ] Returns JSON response per API design spec
- [ ] Error responses for validation, 404, 429, 500
- [ ] Rate limiting applied (100 requests/hour per IP)
- [ ] CORS headers configured
- [ ] Logging for all requests and errors

**Dependencies**:

- TASK-003 (WeatherService)
- TASK-004 (CacheManager)

**Files to Modify**:

- `backend/api/views.py` (create WeatherViewSet)

**Implementation Steps**:

1. Create WeatherViewSet or APIView
2. Implement input validation with serializer or manual validation
3. Integrate WeatherService
4. Format successful response (status, data)
5. Format error responses (status, error)
6. Add rate limiting decorator (`@ratelimit`)
7. Configure CORS in settings
8. Add request/response logging
9. Add exception handlers for custom errors

**Test Coverage**:

- [ ] Unit test: Valid city returns 200 with data
- [ ] Unit test: Invalid city name returns 400
- [ ] Unit test: City not found returns 404
- [ ] Unit test: Rate limit returns 429
- [ ] Unit test: Server error returns 500
- [ ] Integration test: Full request/response cycle

**Notes**:

- Use Django REST Framework serializers for validation (optional)
- Consider using `APIView` for simplicity (single endpoint)
- Rate limit: `@ratelimit(key='ip', rate='100/h', method='GET')`

---

### TASK-006: Input Validation and Serializer

**Status**: Not Started

**Priority**: Medium  
**Effort**: 2 hours  
**Assignee**: Backend

**Description**:

Implement robust input validation for city name parameter. Prevents injection attacks and ensures data integrity.

**Acceptance Criteria**:

- [ ] Regex pattern validates city name (letters, spaces, hyphens, international chars)
- [ ] Length validation (2-100 characters)
- [ ] Whitespace trimming
- [ ] Validation errors return clear messages
- [ ] Validation works for international characters (UTF-8)
- [ ] Security: No special characters that could cause injection

**Dependencies**:

- TASK-005 (API View)

**Files to Modify**:

- `backend/api/validators.py` (create validation utilities)
- `backend/api/views.py` (integrate validation)

**Implementation Steps**:

- [ ] Create `validators.py` file
- [ ] Define regex pattern: `^[a-zA-Z\s\-À-ÿ]{2,100}$`
- [ ] Create `validate_city_name(city_name)` function
- [ ] Raise ValidationError with user-friendly message
- [ ] Integrate into WeatherViewSet
- [ ] Test with various inputs

**Test Coverage**:

- [ ] Valid: "London" → passes
- [ ] Valid: "New York" → passes
- [ ] Valid: "São Paulo" → passes
- [ ] Invalid: "City123" → fails
- [ ] Invalid: "A" → fails (too short)
- [ ] Invalid: "City@Name" → fails

**Notes**:

- Follow OWASP injection prevention guidelines
- Reference: `.github/instructions/security-and-owasp.instructions.md`

---

### TASK-007: Configure URL Routing

**Status**: Not Started

**Priority**: High  
**Effort**: 1 hour  
**Assignee**: Backend

**Description**:

Configure Django URL routing to expose the weather API endpoint.

**Acceptance Criteria**:

- [ ] URL pattern defined in `backend/api/urls.py`
- [ ] `/api/weather` endpoint routes to WeatherViewSet
- [ ] URL pattern allows query parameter `?city=<name>`
- [ ] URLs included in main `backend/project/urls.py`
- [ ] API accessible at `http://localhost:8000/api/weather`

**Dependencies**:

- TASK-005 (API View)

**Files to Modify**:

- `backend/api/urls.py` (create/update)
- `backend/project/urls.py` (include API urls)

**Implementation Steps**:

- [ ] Create/update `backend/api/urls.py`
- [ ] Define URL pattern for weather endpoint
- [ ] Include API urls in project urls
- [ ] Test URL routing manually
- [ ] Verify query parameters work

**Test Coverage**:

- [ ] URL resolves correctly
- [ ] Query parameters parsed correctly

**Notes**:

```python
# api/urls.py
from django.urls import path
from .views import WeatherViewSet

urlpatterns = [
    path('weather/', WeatherViewSet.as_view(), name='weather'),
]

# project/urls.py
urlpatterns = [
    path('api/', include('api.urls')),
]
```

---

## Phase 3: Frontend Implementation (Day 6-9)

### TASK-008: Create Angular Weather Service

**Status**: Not Started

**Priority**: High  
**Effort**: 3 hours  
**Assignee**: Frontend

**Description**:

Create Angular service for communicating with the backend weather API. Handles HTTP requests, error handling, and response transformation.

**Acceptance Criteria**:

- [ ] WeatherService created in `frontend/src/app/services/weather.service.ts`
- [ ] `getWeather(cityName: string)` method calls backend API
- [ ] Returns Observable<WeatherData>
- [ ] Error handling for HTTP errors
- [ ] Response transformation to TypeScript interfaces
- [ ] Loading state management (optional: use RxJS BehaviorSubject)
- [ ] HttpClient configured in service

**Dependencies**:

- None (frontend foundational task)

**Files to Create**:

- `frontend/src/app/services/weather.service.ts`
- `frontend/src/app/models/weather.model.ts` (TypeScript interfaces)

**Implementation Steps**:

- [ ] Generate service: `ng generate service services/weather`
- [ ] Inject HttpClient
- [ ] Define API base URL (from environment)
- [ ] Implement `getWeather(cityName)` method
- [ ] Create WeatherData interface
- [ ] Transform backend response to frontend model
- [ ] Implement error handling (map HTTP errors to user messages)
- [ ] Add RxJS operators (catchError, map)

**Test Coverage**:

- [ ] Unit test: Successful API call returns WeatherData
- [ ] Unit test: HTTP 404 emits error
- [ ] Unit test: HTTP 400 emits validation error
- [ ] Mock HttpClient in tests

**Notes**:

```typescript
interface WeatherData {
	city: string;
	country: string;
	temperatureCelsius: number;
	weatherCondition: string;
	humidity: number;
	windSpeedKmh: number;
	// ... other fields
}
```

---

### TASK-009: Implement Unit Converter Service

**Status**: Not Started

**Priority**: High  
**Effort**: 2 hours  
**Assignee**: Frontend

**Description**:

Create TypeScript service for client-side temperature and wind speed unit conversion. Manages user preference in local storage.

**Acceptance Criteria**:

- [ ] UnitConverterService created in `frontend/src/app/services/unit-converter.service.ts`
- [ ] `celsiusToFahrenheit(temp)` method implemented
- [ ] `fahrenheitToCelsius(temp)` method implemented
- [ ] `kmhToMph(speed)` method implemented
- [ ] `mphToKmh(speed)` method implemented
- [ ] User preference (C/F) stored in local storage
- [ ] `getCurrentUnit()` and `setCurrentUnit(unit)` methods
- [ ] Conversion formulas are accurate

**Dependencies**:

- None (frontend utility)

**Files to Create**:

- `frontend/src/app/services/unit-converter.service.ts`

**Implementation Steps**:

- [ ] Generate service: `ng generate service services/unit-converter`
- [ ] Implement conversion methods with formulas
- [ ] Implement local storage read/write
- [ ] Set default unit to Celsius
- [ ] Add unit preference persistence
- [ ] Write comprehensive unit tests

**Test Coverage**:

- [ ] Test: 0°C = 32°F
- [ ] Test: 100°C = 212°F
- [ ] Test: 20°C = 68°F
- [ ] Test: 100 km/h = 62.137 mph
- [ ] Test: Preference saves to local storage
- [ ] Test: Preference loads from local storage

**Notes**:

```typescript
// Conversion formulas
fahrenheit = (celsius * 9) / 5 + 32;
mph = kmh * 0.621371;
```

---

### TASK-010: Create Weather Search Component

**Status**: Not Started

**Priority**: High  
**Effort**: 5 hours  
**Assignee**: Frontend

**Description**:

Create main Angular component for weather search UI. Includes search input, button, loading state, and weather results display.

**Acceptance Criteria**:

- [ ] Component created in `frontend/src/app/components/weather-search/`
- [ ] Search input field with validation
- [ ] Search button (disabled when input invalid)
- [ ] Loading indicator during API call
- [ ] Weather results display (temp, condition, humidity, wind)
- [ ] Error message display
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Enter key submits search
- [ ] Input validation (client-side)

**Dependencies**:

- TASK-008 (Weather Service)

**Files to Create**:

- `frontend/src/app/components/weather-search/weather-search.component.ts`
- `frontend/src/app/components/weather-search/weather-search.component.html`
- `frontend/src/app/components/weather-search/weather-search.component.css`
- `frontend/src/app/components/weather-search/weather-search.component.spec.ts`

**Implementation Steps**:

- [ ] Generate component: `ng generate component components/weather-search`
- [ ] Create reactive form with city input
- [ ] Add input validation (pattern, minLength, maxLength)
- [ ] Implement `onSearch()` method
- [ ] Call WeatherService and handle response
- [ ] Implement loading state (boolean flag)
- [ ] Display weather results in template
- [ ] Display error messages
- [ ] Style with responsive CSS
- [ ] Add keyboard event listener (Enter key)

**Test Coverage**:

- [ ] Component renders correctly
- [ ] Search button disabled with invalid input
- [ ] Search button enabled with valid input
- [ ] Loading indicator shows during API call
- [ ] Weather data displays correctly
- [ ] Error message displays on error

**Notes**:

- Use Angular Reactive Forms for validation
- Consider using Angular Material for UI components (optional)
- Ensure accessibility (ARIA labels, keyboard navigation)

---

### TASK-011: Implement Temperature Unit Toggle

**Status**: Not Started

**Priority**: High  
**Effort**: 3 hours  
**Assignee**: Frontend

**Description**:

Add temperature unit toggle button to weather display. Allows user to switch between Celsius and Fahrenheit with instant conversion.

**Acceptance Criteria**:

- [ ] Toggle button/switch in weather results display
- [ ] Button labeled with °C and °F
- [ ] Clicking toggle converts temperature and wind speed
- [ ] Current unit visually highlighted
- [ ] Preference persists on page reload
- [ ] Default unit is Celsius
- [ ] Conversion updates instantly (no API call)
- [ ] Toggle accessible via keyboard

**Dependencies**:

- TASK-009 (Unit Converter Service)
- TASK-010 (Weather Search Component)

**Files to Modify**:

- `frontend/src/app/components/weather-search/weather-search.component.ts`
- `frontend/src/app/components/weather-search/weather-search.component.html`
- `frontend/src/app/components/weather-search/weather-search.component.css`

**Implementation Steps**:

- [ ] Inject UnitConverterService into component
- [ ] Add `currentUnit` property (C or F)
- [ ] Load initial unit from service (default: C)
- [ ] Create `toggleUnit()` method
- [ ] Add conversion logic in template (using pipe or method)
- [ ] Create toggle button in HTML
- [ ] Style toggle button (active/inactive states)
- [ ] Test preference persistence

**Test Coverage**:

- [ ] Default unit is Celsius
- [ ] Toggle switches to Fahrenheit
- [ ] Temperature converts correctly
- [ ] Wind speed converts correctly
- [ ] Preference persists after reload
- [ ] Keyboard accessible

**Notes**:

```html
<button (click)="toggleUnit()" [attr.aria-pressed]="currentUnit === 'C'">
	<span [class.active]="currentUnit === 'C'">°C</span>
	<span [class.active]="currentUnit === 'F'">°F</span>
</button>
```

---

### TASK-012: Responsive Design and Styling

**Status**: Not Started

**Priority**: Medium  
**Effort**: 4 hours  
**Assignee**: Frontend

**Description**:

Implement responsive CSS for mobile, tablet, and desktop viewports. Ensure weather app looks good and is usable on all screen sizes.

**Acceptance Criteria**:

- [ ] Mobile layout (<768px): Single column, touch-friendly buttons
- [ ] Tablet layout (768px-1024px): Optimized for medium screens
- [ ] Desktop layout (>1024px): Wider layout with better spacing
- [ ] Minimum tap target size: 44x44px
- [ ] Readable text without zooming (16px minimum)
- [ ] No horizontal scrolling on any viewport
- [ ] Weather icons display correctly
- [ ] Loading spinner centered and visible

**Dependencies**:

- TASK-010 (Weather Search Component)
- TASK-011 (Unit Toggle)

**Files to Modify**:

- `frontend/src/app/components/weather-search/weather-search.component.css`
- `frontend/src/styles.css` (global styles)

**Implementation Steps**:

1. Use CSS Grid or Flexbox for layout
2. Define breakpoints (768px, 1024px)
3. Mobile-first approach (start with mobile styles)
4. Add media queries for tablet and desktop
5. Ensure touch-friendly button sizes
6. Test on various screen sizes (Chrome DevTools)
7. Optimize font sizes and spacing
8. Add weather condition icons (from OpenWeatherMap CDN)

**Test Coverage**:

- [ ] Visual regression tests at different viewports
- [ ] Manual testing on real devices

**Notes**:

- Consider using CSS variables for theming (future dark mode)
- Icons: `http://openweathermap.org/img/wn/{icon_code}@2x.png`

---

### TASK-013: Accessibility Improvements

**Status**: Not Started

**Priority**: Medium  
**Effort**: 2 hours  
**Assignee**: Frontend

**Description**:

Ensure weather app meets WCAG 2.1 Level AA accessibility standards. Improve keyboard navigation, screen reader support, and color contrast.

**Acceptance Criteria**:

- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] ARIA labels for screen readers
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast ratio ≥4.5:1 for text
- [ ] Alt text for weather icons
- [ ] Error messages announced to screen readers
- [ ] Loading state announced to screen readers
- [ ] Semantic HTML (header, main, section)

**Dependencies**:

- TASK-010 (Weather Search Component)

**Files to Modify**:

- `frontend/src/app/components/weather-search/weather-search.component.html`
- `frontend/src/app/components/weather-search/weather-search.component.css`

**Implementation Steps**:

1. Add ARIA labels (`aria-label`, `aria-describedby`)
2. Add `role` attributes where needed
3. Ensure focus indicators visible (`:focus` CSS)
4. Check color contrast with tool (e.g., WebAIM)
5. Add alt text to images
6. Test with screen reader (NVDA or VoiceOver)
7. Test keyboard navigation
8. Add live regions for dynamic updates (`aria-live`)

**Test Coverage**:

- [ ] Automated accessibility tests (axe-core)
- [ ] Manual keyboard navigation test
- [ ] Manual screen reader test
- [ ] Color contrast validation

**Notes**:

- Use `aria-live="polite"` for loading/error messages
- Use `aria-invalid="true"` for invalid input
- Reference WCAG 2.1 guidelines

---

## Phase 4: Integration & Testing (Day 10-12)

### TASK-014: Backend Integration Tests

**Status**: Not Started

**Priority**: High  
**Effort**: 4 hours  
**Assignee**: Backend

**Description**:

Create integration tests for backend API that test the full request/response cycle with real database and mocked external API.

**Acceptance Criteria**:

- [ ] Test database configured (separate from dev DB)
- [ ] Tests cover full weather retrieval flow
- [ ] Tests use real PostgreSQL queries (not mocked ORM)
- [ ] External API mocked with `responses` or `requests-mock`
- [ ] Tests verify cache hit scenario
- [ ] Tests verify cache miss scenario
- [ ] Tests verify stale data fallback
- [ ] Tests verify error responses
- [ ] All tests pass consistently

**Dependencies**:

- All backend tasks (TASK-001 through TASK-007)

**Files to Create**:

- `backend/api/tests/test_integration.py`

**Implementation Steps**:

- [ ] Configure test database settings
- [ ] Create test fixtures for weather data
- [ ] Mock external OpenWeatherMap API
- [ ] Write test: Successful weather retrieval (cache miss)
- [ ] Write test: Successful weather retrieval (cache hit)
- [ ] Write test: Stale cache with API success
- [ ] Write test: Stale cache with API failure (fallback)
- [ ] Write test: Invalid input returns 400
- [ ] Write test: City not found returns 404
- [ ] Run tests: `python manage.py test api.tests.test_integration`

**Test Coverage**:

- [ ] Integration test coverage >80%

**Notes**:

- Use Django's TestCase for database transactions
- Use `@override_settings` for test configuration
- Mock external API to avoid real API calls

---

### TASK-015: Frontend Component Tests

**Status**: Not Started

**Priority**: High  
**Effort**: 3 hours  
**Assignee**: Frontend

**Description**:

Create comprehensive unit and component tests for Angular weather search component and services.

**Acceptance Criteria**:

- [ ] Tests for WeatherService (HTTP calls)
- [ ] Tests for UnitConverterService (conversions)
- [ ] Tests for WeatherSearchComponent (interactions)
- [ ] Test coverage >85%
- [ ] All tests pass
- [ ] Tests use Angular testing utilities (TestBed)
- [ ] HTTP calls mocked with HttpTestingController

**Dependencies**:

- All frontend tasks (TASK-008 through TASK-013)

**Files to Modify**:

- `frontend/src/app/services/weather.service.spec.ts`
- `frontend/src/app/services/unit-converter.service.spec.ts`
- `frontend/src/app/components/weather-search/weather-search.component.spec.ts`

**Implementation Steps**:

- [ ] Configure TestBed for each test suite
- [ ] Mock HttpClient for WeatherService tests
- [ ] Test successful API call
- [ ] Test error handling
- [ ] Test unit conversions with known values
- [ ] Test component rendering
- [ ] Test user interactions (click, input)
- [ ] Run tests: `npm test`
- [ ] Generate coverage report: `npm test -- --code-coverage`

**Test Coverage**:

- [ ] WeatherService: >90% coverage
- [ ] UnitConverterService: 100% coverage
- [ ] WeatherSearchComponent: >85% coverage

**Notes**:

- Use Angular's `HttpClientTestingModule`
- Use `async` and `fakeAsync` for async tests
- Mock local storage for unit preference tests

---

### TASK-016: End-to-End Tests with Playwright

**Status**: Not Started

**Priority**: High  
**Effort**: 4 hours  
**Assignee**: QA

**Description**:

Create comprehensive E2E tests using Playwright that validate all user journeys and requirements from requirements.md.

**Acceptance Criteria**:

- [ ] E2E tests created in `qa/tests/weather-search.spec.ts`
- [ ] Test: Happy path (search for city, see results)
- [ ] Test: Invalid input shows error message
- [ ] Test: City not found shows error
- [ ] Test: Loading indicator appears during search
- [ ] Test: Unit toggle converts temperature
- [ ] Test: Unit preference persists on reload
- [ ] Test: Responsive design on mobile/tablet/desktop
- [ ] Test: Keyboard navigation works
- [ ] All tests pass consistently
- [ ] Tests run in CI/CD pipeline

**Dependencies**:

- TASK-007 (Backend API endpoint)
- TASK-010, TASK-011 (Frontend components)

**Files to Create**:

- `qa/tests/weather-search.spec.ts`

**Implementation Steps**:

- [ ] Start backend: `python manage.py runserver`
- [ ] Start frontend: `cd frontend && npm start`
- [ ] Create test file in `qa/tests/`
- [ ] Write test: Search for "London" → verify results display
- [ ] Write test: Enter "City123" → verify error message
- [ ] Write test: Search for "Nonexistentcity" → verify 404 error
- [ ] Write test: Click search → verify loading indicator
- [ ] Write test: Toggle unit → verify temperature converts
- [ ] Write test: Test on different viewports
- [ ] Write test: Tab navigation and Enter key
- [ ] Run tests: `cd qa && npm test`
- [ ] Review test report

**Test Coverage**:

- [ ] All acceptance criteria from requirements.md verified
- [ ] All user stories from backlog verified

**Notes**:

- Follow `.github/instructions/playwright-typescript.instructions.md`
- Use user-facing locators (`getByRole`, `getByLabel`, `getByText`)
- Use auto-retrying assertions (`await expect(locator).toBeVisible()`)
- Group tests with `test.describe()`

---

## Phase 5: Documentation & Deployment (Day 13-14)

### TASK-017: Update Documentation

**Status**: Not Started

**Priority**: Medium  
**Effort**: 2 hours  
**Assignee**: All

**Description**:

Update project documentation to reflect the new weather search feature.

**Acceptance Criteria**:

- [ ] README.md updated with feature description
- [ ] API documentation created (endpoint, parameters, responses)
- [ ] Setup instructions updated (environment variables)
- [ ] Architecture diagram updated (optional)
- [ ] Code comments added for complex logic
- [ ] Changelog updated

**Dependencies**:

- All implementation tasks complete

**Files to Modify**:

- `README.md`
- `backend/README.md`
- `frontend/README.md`
- `CHANGELOG.md` (create if doesn't exist)

**Implementation Steps**:

- [ ] Update main README with feature overview
- [ ] Document API endpoint in backend README
- [ ] Add setup instructions for WEATHER_API_KEY
- [ ] Document frontend components
- [ ] Add code examples for common usage
- [ ] Update changelog with version and features

**Test Coverage**:

- N/A (documentation)

**Notes**:

- Keep documentation concise and accurate
- Include example API requests/responses
- Document common errors and troubleshooting

---

### TASK-018: Deployment Configuration

**Status**: Not Started

**Priority**: High  
**Effort**: 2 hours  
**Assignee**: DevOps

**Description**:

Configure production deployment settings and verify all environment variables are set correctly for AWS Fargate deployment.

**Acceptance Criteria**:

- [ ] Production Django settings configured
- [ ] DEBUG=False in production
- [ ] SECRET_KEY from environment variable
- [ ] ALLOWED_HOSTS configured
- [ ] Database URL configured for PostgreSQL
- [ ] WEATHER_API_KEY configured in AWS Secrets Manager
- [ ] CORS settings for production frontend domain
- [ ] Static files collection configured
- [ ] Deployment checklist completed

**Dependencies**:

- All implementation and testing tasks complete

**Files to Modify**:

- `backend/project/settings.py` (production settings)
- `docker-compose.yml` (if using Docker)
- AWS ECS task definition (create/update)

**Implementation Steps**:

- [ ] Create production settings module or use environment-based config
- [ ] Configure environment variables in ECS task definition
- [ ] Set up AWS Secrets Manager for API keys
- [ ] Configure ALLOWED_HOSTS
- [ ] Test production settings locally (with DEBUG=False)
- [ ] Run Django deployment check: `python manage.py check --deploy`
- [ ] Build Docker image for production
- [ ] Push to AWS ECR
- [ ] Update ECS service
- [ ] Verify deployment

**Test Coverage**:

- [ ] Deployment checklist passed
- [ ] Django security check passed
- [ ] Production environment tested

**Notes**:

```bash
# Django deployment check
python manage.py check --deploy

# Expected: No issues found
```

---

## Completion Checklist

### Pre-Deployment

- [ ] All 18 tasks completed
- [ ] All unit tests passing (backend >90%, frontend >85%)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Code review completed
- [ ] Security audit completed (OWASP checklist)
- [ ] Performance testing completed (<2s response time)
- [ ] Documentation updated
- [ ] Changelog updated

### Deployment

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Production deployment successful
- [ ] Health check endpoint returning 200 OK
- [ ] Smoke tests passed (manual weather search)
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

### Post-Deployment

- [ ] Monitor error rates (target <5%)
- [ ] Monitor response times (target <2s p95)
- [ ] Monitor cache hit rate (target >60%)
- [ ] Monitor API usage (stay within 1000 calls/day)
- [ ] User acceptance testing
- [ ] Gather feedback for future improvements

---

## Approval

**Submitted by**: Architect Agent  
**Submitted on**: 2026-02-02  
**Reviewed by**: [Pending User Review]  
**Approval Status**: Pending  
**Approval Date**: [Pending]

---

## Approval Request

I've completed the implementation plan for WEATHER-001: Basic City Weather Search.

**Location**: `specs/jira-tickets/WEATHER-001-basic-city-weather-search/tasks.md`

**Task Summary**:

- **Total Tasks**: 18 tasks across 5 phases
- **Total Effort**: 56 hours (2-3 weeks at 20 hours/week)
- **Backend**: 7 tasks, 24 hours
- **Frontend**: 6 tasks, 18 hours
- **Testing**: 3 tasks, 10 hours
- **Ops**: 2 tasks, 4 hours

**Task Breakdown by Phase**:

1. **Foundation (Day 1-2)**: Database model, API client, business logic
2. **Backend API (Day 3-5)**: Cache manager, views, validation, routing
3. **Frontend (Day 6-9)**: Services, components, UI, responsive design, accessibility
4. **Integration & Testing (Day 10-12)**: Backend tests, frontend tests, E2E tests
5. **Documentation & Deployment (Day 13-14)**: Docs, production config

**Key Highlights**:

- Tasks are atomic (1-4 hours each) and independently testable
- Clear dependencies prevent blocking
- Comprehensive test coverage at all levels
- Security and accessibility built-in from start
- Each task has clear acceptance criteria

**Risk Mitigation**:

- Early foundation tasks unblock parallel work
- Testing integrated throughout (not at end)
- Deployment configuration validated before production
- Rollback plan documented

**Confidence Score**: 88% (same as technical design)

Ready for implementation with high confidence. Remaining uncertainty:

- Actual task durations may vary ±20% based on developer experience
- Integration complexity may surface additional edge cases

**Next Steps** (if approved):

Begin implementation following task order. Suggested approach:

1. Backend developer starts TASK-001, TASK-002, TASK-003
2. Once TASK-007 complete, frontend developer starts TASK-008, TASK-009, TASK-010
3. QA prepares test scenarios during implementation
4. Daily stand-ups to track progress and adjust estimates

Please review and approve to begin implementation (start coding).
