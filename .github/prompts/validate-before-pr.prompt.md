---
description: "Validate implementation completeness and compliance before creating PR"
tools:
  [
    "search/changes",
    "search/codebase",
    "read/problems",
    "atlassian/atlassian-mcp-server/fetch",
    "search/usages",
    "read/terminalLastCommand",
  ]
---

# Pre-PR Validation

You are validating that all implementation is complete and compliant **before creating a Pull Request**. This runs locally after all tasks are complete and after Devils Advocate post-implementation review.

## Purpose

This validation ensures:

1. **Traceability**: All Jira acceptance criteria are mapped to code
2. **Completeness**: All tasks in tasks.md are completed
3. **Compliance**: Git workflow and coding standards are followed
4. **Readiness**: PR can be created with complete description

**Note**: Technical code quality was already validated by:

- Devils Advocate (post-implementation review)
- Tests run during each task
- Implementation agent approval gates

## Validation Checklist

### 1. Jira Acceptance Criteria Mapping

**Fetch Jira ticket via MCP** and create mapping:

```bash
TICKET_ID=$(git branch --show-current | sed 's/feature\///')
```

For each acceptance criterion:

- [ ] Identify which file(s) implement it
- [ ] Verify implementation is complete
- [ ] Note line numbers for traceability

### 2. Tasks Completion Verification

Read `specs/jira-tickets/<TICKET-ID>/tasks.md`:

- [ ] All tasks marked as complete (✅)
- [ ] All atomic checklist items completed
- [ ] No skipped or partially implemented tasks

### 3. Git Workflow Compliance

Verify against `.github/instructions/git-workflow.instructions.md`:

- [ ] Branch name follows convention: `<type>/<TICKET-ID>-<description>`
- [ ] All commits follow Conventional Commits format
- [ ] No merge conflicts with target branch
- [ ] Branch is up to date with target branch

### 4. Testing Verification

- [ ] All backend tests pass: `python backend/manage.py test`
- [ ] All frontend tests pass: `cd frontend && npm test`
- [ ] All E2E tests pass: `cd qa && npm test`
- [ ] Test coverage meets project standards (80% backend, 70% frontend)

### 5. Documentation Completeness

- [ ] Code comments added for complex logic
- [ ] README.md updated (if API or setup changed)
- [ ] AGENTS.md updated (if workflow changed)
- [ ] technical-design.md reflects actual implementation

## Validation Output

Generate a structured report for the PR description:

````markdown
## Pre-PR Validation Report

**Ticket**: [TICKET-ID] - [Title]
**Branch**: `<branch-name>`
**Date**: [YYYY-MM-DD]

### ✅ Acceptance Criteria Coverage

| ID   | Criterion     | Implementation                                        | Status      |
| ---- | ------------- | ----------------------------------------------------- | ----------- |
| AC-1 | [Description] | `backend/api/views.py:45-67`                          | ✅ Complete |
| AC-2 | [Description] | `frontend/src/app/weather/weather.component.ts:23-45` | ✅ Complete |
| AC-3 | [Description] | `qa/tests/weather-search.spec.ts:12-34`               | ✅ Complete |

### ✅ Task Completion

**Total Tasks**: [N]
**Completed**: [N] ✅
**In Progress**: 0
**Not Started**: 0

All tasks from `specs/jira-tickets/<TICKET-ID>/tasks.md` completed.

### ✅ Testing Status

- ✅ Backend tests: All passing (87% coverage)
- ✅ Frontend tests: All passing (92% coverage)
- ✅ E2E tests: All passing

### ✅ Git Workflow Compliance

- ✅ Branch name: `feature/PROJ-123-weather-search`
- ✅ Commits follow Conventional Commits
- ✅ No merge conflicts
- ✅ Up to date with `develop`

### ✅ Documentation

- ✅ Code comments added
- ✅ README.md updated (new API endpoint documented)
- ✅ technical-design.md accurate

### 📋 Devils Advocate Review

Already completed. See Devils Advocate report for:

- Technical implementation quality
- Security considerations
- Performance analysis
- Edge cases coverage

### 🎯 Summary

**Status**: ✅ Ready for PR Creation

All acceptance criteria met, all tasks complete, all tests passing. Ready to create pull request.

### 📝 Suggested PR Title

```
feat(weather): implement city weather search

- Add weather API endpoint
- Implement search component
- Add E2E tests for search flow

Closes PROJ-123
```

### 📝 Suggested PR Description

Use this template:

```markdown
## Description

[Brief description of what this PR accomplishes]

## Related Ticket

- Jira: [PROJ-123](https://jira.example.com/browse/PROJ-123)

## Type of Change

- [x] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Acceptance Criteria Coverage

[Copy table from above]

## Testing

- All unit tests passing
- All E2E tests passing
- Coverage: Backend 87%, Frontend 92%

## Screenshots (if applicable)

[Add screenshots]

## Checklist

- [x] All tasks completed
- [x] All tests passing
- [x] Devils Advocate review completed
- [x] Documentation updated
- [x] Branch up to date with target
- [x] No merge conflicts
```
````

## Validation Process

1. **Extract ticket ID from branch name**
2. **Fetch Jira ticket** via MCP
3. **Read tasks.md** to verify completion
4. **Check git history** for commit compliance
5. **Run test suites** (all three: backend, frontend, E2E)
6. **Generate validation report** with traceability mapping
7. **Output PR title and description template**

## When Validation Fails

If any item fails:

1. **STOP** - Do not create PR yet
2. **Document** what's missing or non-compliant
3. **Fix issues** before proceeding
4. **Re-run validation**

## Success Criteria

Validation passes when:

- ✅ All Jira acceptance criteria mapped to code
- ✅ All tasks in tasks.md completed
- ✅ All tests passing
- ✅ Git workflow compliant
- ✅ Documentation complete

## Next Step After Validation

Once validation passes:

1. Create PR with generated title and description
2. Include validation report in PR body
3. Request human review
4. Human reviewer uses validation report as starting point

## Reference

- `.github/instructions/git-workflow.instructions.md` - Git standards
- `.github/instructions/spec-driven-workflow.instructions.md` - Workflow details
- `specs/jira-tickets/<TICKET-ID>/technical-design.md` - Design reference
- `specs/jira-tickets/<TICKET-ID>/tasks.md` - Task checklist
