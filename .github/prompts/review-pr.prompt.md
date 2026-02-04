---
description: "Review pull request against requirements, technical design, and code standards"
tools:
  [
    "search/changes",
    "search/codebase",
    "edit/editFiles",
    "web/githubRepo",
    "read/problems",
    "atlassian/atlassian-mcp-server/search",
    "search/usages",
    "read/terminalLastCommand",
  ]
---

# Pull Request Review

You are conducting a comprehensive code review. Your goal is to ensure the PR meets requirements, follows technical design, adheres to coding standards, and maintains quality.

## Review Checklist

### 1. Requirements Verification

**Fetch Jira ticket via MCP** and verify:

- [ ] All Jira acceptance criteria are addressed
- [ ] Acceptance criteria are met and testable
- [ ] Edge cases are handled
- [ ] Error scenarios are covered
- [ ] No unintended scope creep or missing features

**Method**: For each Jira acceptance criterion, trace it to specific code changes in the PR.

### 2. Design Compliance

Read `technical-design.md` and verify:

- [ ] Implementation matches approved architecture
- [ ] Data models match design specs
- [ ] API contracts are correctly implemented
- [ ] Component interactions follow design
- [ ] No architectural deviations without justification

**Method**: Compare code structure against design diagrams and specifications.

### 3. Code Quality Standards

Check against project instructions:

- [ ] Follows language-specific guidelines (`.github/instructions/*.instructions.md`)
- [ ] Adheres to OWASP security practices
- [ ] Proper error handling and logging
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Efficient algorithms and queries

**Focus Areas**:

- **Python/Django**: PEP 8, ORM usage, middleware, settings
- **TypeScript/Angular**: Style guide, change detection, RxJS patterns
- **Playwright**: User-facing locators, web-first assertions

### 4. Testing Coverage

Verify tests exist and are comprehensive:

- [ ] Unit tests for new functions/methods
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user workflows
- [ ] Test all edge cases from requirements
- [ ] Tests follow Playwright best practices (if applicable)
- [ ] All tests pass (`npm test`, `python manage.py test`)

### 5. Security Review (OWASP)

Check for common vulnerabilities:

- [ ] **A01 Broken Access Control**: Proper authorization checks
- [ ] **A02 Cryptographic Failures**: Secrets not hardcoded
- [ ] **A03 Injection**: Parameterized queries, input sanitization
- [ ] **A05 Security Misconfiguration**: No debug mode in prod
- [ ] **A07 Auth Failures**: Secure session management
- [ ] **A10 SSRF**: URL validation on server-side requests

### 6. Performance Review

- [ ] No N+1 query problems
- [ ] Proper use of `select_related()` / `prefetch_related()` (Django)
- [ ] Efficient frontend rendering (OnPush change detection)
- [ ] No unnecessary API calls
- [ ] Proper caching where applicable

### 7. Documentation

- [ ] Code comments for complex logic
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] AGENTS.md updated if workflow changed

### 8. Git Workflow Compliance

Check against `.github/instructions/git-workflow.instructions.md`:

- [ ] Branch name follows convention: `<type>/<ticket>-<description>`
- [ ] Commit messages follow Conventional Commits
- [ ] PR title format: `<type>(<scope>): <description>`
- [ ] PR description is complete
- [ ] No merge conflicts
- [ ] Branch is up to date with target

## Review Output Format

Structure your review as:

````markdown
# Pull Request Review: [PR Title]

## ✅ Requirements Coverage

| Requirement | Status     | Comment                              |
| ----------- | ---------- | ------------------------------------ |
| REQ-001     | ✅ Met     | Implemented in `file.py:45-67`       |
| REQ-002     | ⚠️ Partial | Missing error handling for edge case |
| REQ-003     | ❌ Not Met | Feature not implemented              |

## ✅ Design Compliance

- ✅ Architecture matches `technical-design.md`
- ✅ Data models implemented as specified
- ⚠️ API endpoint response differs from design (intentional?)

## 🔍 Code Quality Issues

### Critical (Must Fix Before Merge)

#### 1. SQL Injection Vulnerability

**File**: `backend/api/views.py:45`
**Issue**: Using string formatting for database query
**Fix**:

```python
# Before
query = f"SELECT * FROM weather WHERE city = '{city}'"

# After
Weather.objects.filter(city=city)
```
````

### High Priority (Should Fix)

#### 2. Missing Input Validation

**File**: `backend/api/views.py:32`
**Issue**: No validation on `city` parameter
**Fix**: Add validation with max length and allowed characters

### Low Priority (Nice to Have)

#### 3. Code Duplication

**File**: `frontend/src/app/weather/weather.component.ts:45-60`
**Suggestion**: Extract repeated logic into service method

## 🧪 Testing Review

- ✅ Unit tests added for new functions
- ✅ E2E tests cover main workflow
- ⚠️ Missing test for error scenario in REQ-002
- **Coverage**: Backend 87%, Frontend 92%

### Recommended Additional Tests:

```typescript
test("should handle API timeout gracefully", async ({ page }) => {
	// Test implementation
});
```

## 🔒 Security Review

- ✅ No hardcoded secrets
- ✅ Proper input sanitization
- ⚠️ Missing rate limiting on API endpoint (see OWASP A07)
- ✅ HTTPS enforced
- ✅ CSRF protection enabled

## ⚡ Performance Review

- ✅ Efficient database queries
- ⚠️ Potential N+1 query in `get_weather_history()` - suggest using `select_related()`
- ✅ Frontend uses OnPush change detection

## 📚 Documentation

- ✅ Code comments added for complex logic
- ❌ README needs update with new API endpoint
- ✅ API docs updated

## 📋 Git Workflow

- ✅ Branch name: `feature/PROJ-123-weather-api`
- ✅ Commit messages follow convention
- ✅ PR description complete
- ❌ Needs rebase on latest `develop`

## 🎯 Summary

**Overall Assessment**: ⚠️ Needs Changes

**Blocking Issues**: 2 critical security issues must be fixed
**Non-Blocking Issues**: 3 high priority, 5 low priority improvements

**Recommendation**: Request changes for critical issues, then approve after fixes.

## Next Steps

1. Fix SQL injection vulnerability (critical)
2. Add rate limiting (critical)
3. Rebase on latest develop
4. Add missing error scenario test
5. Update README

```

## Review Process

1. **Initial Scan**
   - Read PR description
   - Check linked requirements/design docs
   - Review changed files list

2. **Requirements Trace**
   - For each REQ-XXX in `requirements.md`
   - Find corresponding implementation
   - Verify acceptance criteria met

3. **Code Review**
   - Review each file systematically
   - Check against coding standards
   - Look for security vulnerabilities
   - Assess performance implications

4. **Testing Review**
   - Run test suite
   - Check coverage reports
   - Verify E2E tests exist for user flows
   - Look for missing test scenarios

5. **Documentation Check**
   - Ensure docs updated
   - Comments adequate for complex logic
   - API changes documented

6. **Final Assessment**
   - Categorize issues by severity
   - Provide clear, actionable feedback
   - Make approval recommendation

## Best Practices

- **Be Constructive**: Suggest fixes, not just point out problems
- **Be Specific**: Reference exact files and line numbers
- **Provide Examples**: Show code snippets for suggested changes
- **Prioritize**: Distinguish between blocking and non-blocking issues
- **Educate**: Explain why something is a problem, not just that it is
- **Acknowledge Good Work**: Call out well-written code

## Reference Files

- `.github/instructions/git-workflow.instructions.md` - Git standards
- `.github/instructions/security-and-owasp.instructions.md` - Security guidelines
- `.github/instructions/python.instructions.md` - Python standards
- `.github/instructions/angular.instructions.md` - Angular standards
- `.github/instructions/playwright-typescript.instructions.md` - Test standards
```
