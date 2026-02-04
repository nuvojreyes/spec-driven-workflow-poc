---
description: "Generate comprehensive test suite based on requirements.md"
tools:
  [
    "search/changes",
    "search/codebase",
    "edit/editFiles",
    "read/problems",
    "atlassian/atlassian-mcp-server/search",
    "execute/runInTerminal",
    "execute/getTerminalOutput",
  ]
---

# Generate Test Suite

You are creating comprehensive tests based on Jira ticket acceptance criteria. Your goal is to ensure every requirement has corresponding automated tests that verify acceptance criteria.

## Prerequisites

1. **Fetch Jira ticket via MCP** - understand all requirements and acceptance criteria
2. Read `technical-design.md` - understand implementation approach
3. Read `tasks.md` - understand what was implemented
4. Check existing test files - avoid duplication

## Test Types to Generate

### 1. Backend Tests (Django)

**Location**: `backend/api/tests.py` or `backend/api/tests/`

**Coverage**:

- Unit tests for models, views, serializers
- Integration tests for API endpoints
- Edge case and error scenario tests
- Authentication/authorization tests

**Follow**: `.github/instructions/python.instructions.md`

### 2. Frontend Tests (Angular)

**Location**: `frontend/src/app/**/*.spec.ts`

**Coverage**:

- Component unit tests
- Service unit tests
- Integration tests for component interactions
- Form validation tests

**Follow**: `.github/instructions/angular.instructions.md`

### 3. End-to-End Tests (Playwright)

**Location**: `qa/tests/*.spec.ts`

**Coverage**:

- Happy path user workflows
- Error scenarios
- Edge cases
- Cross-browser compatibility

**Follow**: `.github/instructions/playwright-typescript.instructions.md`

## Test Generation Process

### Step 1: Map Requirements to Tests

For each requirement in `requirements.md`:

```markdown
REQ-001: Weather Search
WHEN a user enters a city name and clicks "Search",
THE SYSTEM SHALL retrieve and display weather data within 2 seconds.

Acceptance Criteria:

- [ ] City name validated before API call
- [ ] Loading indicator shown during fetch
- [ ] Results display temperature, conditions, humidity
- [ ] Error message shown if city not found
```

Generate corresponding tests:

**E2E Test** (main user workflow):

```typescript
test("REQ-001: should search for weather by city name", async ({ page }) => {
	await test.step("Navigate and search", async () => {
		await page.goto("/");
		await page.getByRole("textbox", { name: "City" }).fill("London");
		await page.getByRole("button", { name: "Search" }).click();
	});

	await test.step("Verify results display", async () => {
		await expect(page.getByText("London")).toBeVisible({ timeout: 2000 });
		await expect(page.getByTestId("temperature")).toBeVisible();
		await expect(page.getByTestId("conditions")).toBeVisible();
		await expect(page.getByTestId("humidity")).toBeVisible();
	});
});
```

**Backend Test** (API validation):

```python
class WeatherAPITestCase(TestCase):
    def test_req_001_valid_city_returns_weather_data(self):
        """REQ-001: API should return weather data for valid city"""
        response = self.client.get('/api/weather/', {'city': 'London'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('temperature', response.json())
        self.assertIn('conditions', response.json())
        self.assertIn('humidity', response.json())

    def test_req_001_invalid_city_returns_error(self):
        """REQ-001: API should return 404 for invalid city"""
        response = self.client.get('/api/weather/', {'city': 'InvalidCity123'})
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.json())
```

**Frontend Test** (component behavior):

```typescript
describe("WeatherComponent - REQ-001", () => {
	it("should validate city input before search", () => {
		// Test city validation logic
		component.cityControl.setValue("");
		component.search();
		expect(component.cityControl.errors).toBeTruthy();
	});

	it("should show loading indicator during fetch", () => {
		component.search();
		expect(component.loading).toBe(true);
	});

	it("should display weather data after successful fetch", fakeAsync(() => {
		const mockData = { temperature: 20, conditions: "Sunny", humidity: 65 };
		weatherService.getWeather.and.returnValue(of(mockData));

		component.search();
		tick();

		expect(component.weatherData).toEqual(mockData);
	}));
});
```

### Step 2: Generate Edge Case Tests

For each edge case in requirements:

```typescript
// Edge Case: Empty city name
test("should show validation error for empty city", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Search" }).click();
	await expect(page.getByText("City name is required")).toBeVisible();
});

// Edge Case: Special characters in city name
test("should handle special characters in city name", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("textbox", { name: "City" }).fill("Saint-Étienne");
	await page.getByRole("button", { name: "Search" }).click();
	// Verify it works or shows appropriate error
});

// Edge Case: Very long city name
test("should reject city names exceeding max length", async ({ page }) => {
	const longName = "a".repeat(256);
	await page.goto("/");
	await page.getByRole("textbox", { name: "City" }).fill(longName);
	await page.getByRole("button", { name: "Search" }).click();
	await expect(page.getByText(/too long/i)).toBeVisible();
});
```

### Step 3: Generate Error Scenario Tests

Test error handling:

```typescript
// Error: External API failure
test("should show error message when API is unavailable", async ({ page }) => {
	// Mock API to return 500
	await page.route("**/api/weather/**", (route) =>
		route.fulfill({ status: 500 }),
	);

	await page.goto("/");
	await page.getByRole("textbox", { name: "City" }).fill("London");
	await page.getByRole("button", { name: "Search" }).click();

	await expect(page.getByText(/service unavailable/i)).toBeVisible();
});

// Error: Network timeout
test("should handle API timeout gracefully", async ({ page }) => {
	await page.route("**/api/weather/**", (route) => route.abort("timedout"));

	await page.goto("/");
	await page.getByRole("textbox", { name: "City" }).fill("London");
	await page.getByRole("button", { name: "Search" }).click();

	await expect(page.getByText(/connection timeout/i)).toBeVisible();
});
```

### Step 4: Generate Security Tests

Based on OWASP requirements:

```python
class SecurityTestCase(TestCase):
    def test_sql_injection_prevention(self):
        """Should prevent SQL injection in city parameter"""
        malicious_input = "'; DROP TABLE weather; --"
        response = self.client.get('/api/weather/', {'city': malicious_input})
        # Should not crash, should return 400 or safe error
        self.assertIn(response.status_code, [400, 404])

    def test_xss_prevention(self):
        """Should sanitize user input to prevent XSS"""
        xss_input = '<script>alert("xss")</script>'
        response = self.client.get('/api/weather/', {'city': xss_input})
        self.assertNotIn('<script>', response.content.decode())

    def test_rate_limiting(self):
        """Should enforce rate limiting on API endpoints"""
        for _ in range(100):  # Exceed rate limit
            response = self.client.get('/api/weather/', {'city': 'London'})
        self.assertEqual(response.status_code, 429)  # Too Many Requests
```

### Step 5: Generate Performance Tests

```typescript
test("REQ-001: should return results within 2 seconds", async ({ page }) => {
	const startTime = Date.now();

	await page.goto("/");
	await page.getByRole("textbox", { name: "City" }).fill("London");
	await page.getByRole("button", { name: "Search" }).click();
	await page.getByText("London").waitFor();

	const endTime = Date.now();
	const duration = endTime - startTime;

	expect(duration).toBeLessThan(2000);
});
```

## Test File Structure

### Playwright E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("Weather Search Feature - REQ-001", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("Happy path: successful weather search", async ({ page }) => {
		// Main user flow
	});

	test("Error case: city not found", async ({ page }) => {
		// Error scenario
	});

	test("Edge case: empty city name", async ({ page }) => {
		// Edge case
	});

	test("Performance: results within 2 seconds", async ({ page }) => {
		// Performance requirement
	});
});
```

### Django Backend Tests

```python
from django.test import TestCase, Client
from django.urls import reverse

class WeatherAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('weather-api')

    def test_req_001_valid_city(self):
        """REQ-001: Valid city returns weather data"""
        pass

    def test_req_001_invalid_city(self):
        """REQ-001: Invalid city returns 404"""
        pass

    def test_req_001_empty_city(self):
        """REQ-001: Empty city returns validation error"""
        pass

class SecurityTests(TestCase):
    """OWASP security requirement tests"""
    pass

class PerformanceTests(TestCase):
    """Performance requirement tests"""
    pass
```

## Execution and Validation

After generating tests:

1. **Run tests** to verify they work:

   ```bash
   # Backend
   python backend/manage.py test

   # Frontend
   cd frontend && npm test

   # E2E (ensure backend is running)
   cd qa && npm test
   ```

2. **Check coverage**:

   ```bash
   # Python
   coverage run --source='.' backend/manage.py test
   coverage report

   # Angular
   cd frontend && npm test -- --code-coverage
   ```

3. **Fix failing tests** and iterate

4. **Document traceability**: Create a mapping document:

```markdown
# Test Coverage Matrix

| Requirement | E2E Tests                 | Backend Tests          | Frontend Tests               |
| ----------- | ------------------------- | ---------------------- | ---------------------------- |
| REQ-001     | ✅ weather-search.spec.ts | ✅ test_weather_api.py | ✅ weather.component.spec.ts |
| REQ-002     | ✅ ...                    | ✅ ...                 | ✅ ...                       |
```

## Best Practices

- **One requirement, multiple test levels**: E2E for workflow, unit for logic
- **Test names reference requirements**: Include REQ-XXX in test descriptions
- **Follow existing patterns**: Match project's test style
- **Use descriptive test names**: Explain what and why, not just how
- **Test both positive and negative cases**: Happy path + errors
- **Keep tests independent**: No shared state between tests
- **Use appropriate assertions**: Playwright web-first assertions, Django TestCase methods
- **Mock external dependencies**: Don't rely on real APIs in tests

## Reference

- `.github/instructions/playwright-typescript.instructions.md` - Playwright standards
- `.github/instructions/python.instructions.md` - Django testing patterns
- `.github/instructions/angular.instructions.md` - Angular testing patterns
- `requirements.md` - Source of truth for what to test
