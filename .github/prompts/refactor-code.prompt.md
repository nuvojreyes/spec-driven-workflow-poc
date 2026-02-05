---
description: "Refactor existing code while maintaining requirements and improving quality"
tools:
  [
    "search/changes",
    "search/codebase",
    "edit/editFiles",
    "read/problems",
    "atlassian/atlassian-mcp-server/search",
    "search/usages",
    "execute/runInTerminal",
    "execute/getTerminalOutput",
  ]
---

# Refactor Code

You are refactoring code to improve quality, maintainability, or performance while preserving functionality and meeting all requirements.

## Refactoring Principles

1. **Preserve Behavior**: All existing tests must pass after refactoring
2. **Maintain Requirements**: All Jira ticket acceptance criteria must still be met
3. **Follow Standards**: Adhere to coding standards in `.github/instructions/`
4. **Improve Quality**: Focus on readability, maintainability, performance, or security
5. **Test Coverage**: Ensure refactored code has adequate test coverage

## Refactoring Process

### Step 1: Understand Current Code

Before refactoring:

1. **Fetch Jira ticket via MCP** - understand what requirements must be preserved
2. Read `technical-design.md` - understand intended architecture
3. Read `tasks.md` - understand implementation approach
4. Review existing code and tests
5. Identify code smells or improvement opportunities
6. Run existing tests to establish baseline

### Step 2: Plan Refactoring

Identify refactoring goals:

- [ ] **Code Smells**: Duplicated code, long methods, large classes
- [ ] **Performance**: Slow queries, inefficient algorithms, memory leaks
- [ ] **Security**: OWASP vulnerabilities, hardcoded secrets
- [ ] **Maintainability**: Complex logic, poor naming, lack of comments
- [ ] **Architecture**: Violation of design patterns, tight coupling
- [ ] **Testing**: Low coverage, brittle tests, missing edge cases

Create refactoring plan:

```markdown
## Refactoring Plan: [Component/Module Name]

**Goal**: [What you're improving]

**Current Issues**:

- Issue 1: [Description]
- Issue 2: [Description]

**Proposed Changes**:

1. [Change 1]: [Rationale]
2. [Change 2]: [Rationale]

**Risk Assessment**: Low | Medium | High
**Impact**: [What could break]
**Mitigation**: [How to minimize risk]

**Test Strategy**:

- [ ] Existing tests still pass
- [ ] Add new tests for refactored code
- [ ] Performance benchmarks (if applicable)
```

### Step 3: Common Refactoring Patterns

#### Extract Method/Function

**Before**:

```python
def process_weather_data(city):
    # Validate city
    if not city or len(city) > 100:
        raise ValueError("Invalid city")

    # Fetch data
    response = requests.get(f"{API_URL}?city={city}")
    if response.status_code != 200:
        raise APIError("API failed")

    # Parse data
    data = response.json()
    temperature = data.get('temp', 0)
    conditions = data.get('conditions', 'Unknown')

    # Format result
    return {
        'city': city,
        'temperature': f"{temperature}°C",
        'conditions': conditions.capitalize()
    }
```

**After**:

```python
def process_weather_data(city):
    validate_city(city)
    raw_data = fetch_weather_api(city)
    return format_weather_response(city, raw_data)

def validate_city(city):
    if not city or len(city) > 100:
        raise ValueError("Invalid city")

def fetch_weather_api(city):
    response = requests.get(f"{API_URL}?city={city}", timeout=5)
    if response.status_code != 200:
        raise APIError("API failed")
    return response.json()

def format_weather_response(city, data):
    return {
        'city': city,
        'temperature': f"{data.get('temp', 0)}°C",
        'conditions': data.get('conditions', 'Unknown').capitalize()
    }
```

#### Extract Class/Service

**Before** (Angular component doing too much):

```typescript
export class WeatherComponent {
	weatherData: any;

	search(city: string) {
		// Validation
		if (!city || city.length > 100) {
			this.showError("Invalid city");
			return;
		}

		// API call
		this.http.get(`/api/weather?city=${city}`).subscribe(
			(data) => {
				// Data transformation
				this.weatherData = {
					temperature: data.temp + "°C",
					conditions: data.conditions,
					humidity: data.humidity + "%",
				};
			},
			(error) => this.showError("API failed"),
		);
	}
}
```

**After**:

```typescript
// weather.service.ts
@Injectable()
export class WeatherService {
	constructor(private http: HttpClient) {}

	getWeather(city: string): Observable<WeatherData> {
		this.validateCity(city);
		return this.http.get<RawWeatherData>(`/api/weather?city=${city}`).pipe(
			map((data) => this.transformWeatherData(data)),
			catchError(this.handleError),
		);
	}

	private validateCity(city: string): void {
		if (!city || city.length > 100) {
			throw new Error("Invalid city");
		}
	}

	private transformWeatherData(data: RawWeatherData): WeatherData {
		return {
			temperature: `${data.temp}°C`,
			conditions: data.conditions,
			humidity: `${data.humidity}%`,
		};
	}
}

// weather.component.ts
export class WeatherComponent {
	weatherData: WeatherData | null = null;

	constructor(private weatherService: WeatherService) {}

	search(city: string) {
		this.weatherService.getWeather(city).subscribe(
			(data) => (this.weatherData = data),
			(error) => this.showError("Failed to fetch weather"),
		);
	}
}
```

#### Remove Duplication (DRY)

**Before**:

```python
class WeatherView(APIView):
    def get(self, request):
        city = request.GET.get('city')
        if not city:
            return Response({'error': 'City required'}, status=400)
        if len(city) > 100:
            return Response({'error': 'City too long'}, status=400)
        # ... fetch weather

    def post(self, request):
        city = request.data.get('city')
        if not city:
            return Response({'error': 'City required'}, status=400)
        if len(city) > 100:
            return Response({'error': 'City too long'}, status=400)
        # ... save weather
```

**After**:

```python
class WeatherView(APIView):
    def validate_city(self, city):
        if not city:
            raise ValidationError('City required')
        if len(city) > 100:
            raise ValidationError('City too long')
        return city

    def get(self, request):
        city = self.validate_city(request.GET.get('city'))
        # ... fetch weather

    def post(self, request):
        city = self.validate_city(request.data.get('city'))
        # ... save weather
```

#### Improve Naming

**Before**:

```python
def proc_data(d):
    t = d.get('temp')
    c = d.get('cond')
    return {'t': t, 'c': c}
```

**After**:

```python
def format_weather_data(raw_api_response):
    temperature = raw_api_response.get('temp')
    conditions = raw_api_response.get('cond')
    return {
        'temperature': temperature,
        'conditions': conditions
    }
```

#### Optimize Queries (Django)

**Before** (N+1 problem):

```python
def get_weather_history(user_id):
    searches = WeatherSearch.objects.filter(user_id=user_id)
    return [{
        'city': search.city,
        'user_name': search.user.name,  # N+1: query for each search
        'timestamp': search.timestamp
    } for search in searches]
```

**After**:

```python
def get_weather_history(user_id):
    searches = WeatherSearch.objects.filter(user_id=user_id)\
        .select_related('user')  # Single JOIN query
    return [{
        'city': search.city,
        'user_name': search.user.name,
        'timestamp': search.timestamp
    } for search in searches]
```

#### Fix Security Issues

**Before** (SQL injection risk):

```python
def search_city(name):
    query = f"SELECT * FROM cities WHERE name = '{name}'"
    return db.execute(query)
```

**After**:

```python
def search_city(name):
    return City.objects.filter(name=name)  # ORM prevents injection
```

**Before** (XSS risk):

```typescript
updateWeather(data: any) {
  this.element.innerHTML = `<h1>${data.city}</h1>`;  // XSS risk
}
```

**After**:

```typescript
updateWeather(data: WeatherData) {
  this.element.textContent = data.city;  // Safe text content
  // Or use Angular binding: {{ data.city }}
}
```

### Step 4: Execute Refactoring

Refactor in small, safe steps:

1. **Write Tests First** (if missing):

   ```python
   # Add tests that verify current behavior
   def test_weather_search_valid_city(self):
       result = search_weather('London')
       self.assertIsNotNone(result)
   ```

2. **Refactor Incrementally**:
   - Make one change at a time
   - Run tests after each change
   - Commit after each successful refactoring

3. **Update Tests** (if needed):
   - Refactor tests to match new structure
   - Keep test behavior unchanged
   - Improve test readability

4. **Update Documentation**:
   - Update code comments
   - Update `technical-design.md` if architecture changed
   - Update README if API changed

### Step 5: Validate Refactoring

After refactoring:

1. **Run All Tests**:

   ```bash
   # Backend
   python backend/manage.py test

   # Frontend
   cd frontend && npm test

   # E2E
   cd qa && npm test
   ```

2. **Check Coverage** (should not decrease):

   ```bash
   coverage run --source='.' backend/manage.py test
   coverage report
   ```

3. **Verify Requirements** still met:
   - Review Jira ticket acceptance criteria
   - Manually verify each requirement
   - Run acceptance tests

4. **Performance Testing** (if performance refactoring):

   ```python
   import time
   start = time.time()
   result = refactored_function()
   end = time.time()
   assert end - start < 2.0  # Should be faster
   ```

5. **Security Scan** (if security refactoring):
   - Check against OWASP guidelines
   - Run security linters
   - Code review for vulnerabilities

## Refactoring Checklist

Before committing refactored code:

- [ ] All existing tests pass
- [ ] Code coverage maintained or improved
- [ ] All Jira ticket acceptance criteria still met
- [ ] Follows coding standards in `.github/instructions/`
- [ ] No new security vulnerabilities introduced
- [ ] Performance not degraded (or improved if that was goal)
- [ ] Code is more readable and maintainable
- [ ] Documentation updated
- [ ] Commit message explains refactoring rationale

## Commit Message Format

```bash
git commit -m "refactor(weather): extract weather service from component

- Moved API logic to WeatherService
- Improved separation of concerns
- Made component easier to test
- No functional changes

Refs: REQ-001, REQ-002"
```

## When NOT to Refactor

Avoid refactoring if:

- No tests exist (write tests first)
- Requirements are unclear
- Under tight deadline (technical debt is acceptable temporarily)
- Change would break compatibility without migration path
- Risk outweighs benefit

## Reference

- `.github/instructions/python.instructions.md` - Python refactoring patterns
- `.github/instructions/angular.instructions.md` - Angular refactoring patterns
- `.github/instructions/security-and-owasp.instructions.md` - Security improvements
- **Jira Ticket** (via MCP) - Functionality to preserve
- `technical-design.md` - Intended architecture
