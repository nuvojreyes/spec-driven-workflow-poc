# Implementation Tasks Template (Atomic Checklist)

**Feature ID**: [PROJ-XXX]
**Created**: [YYYY-MM-DD]
**Owner**: Architect Agent
**Status**: Draft | In Review | Approved | In Progress | Complete

Short purpose: use small, atomic checklist steps for implementation. Each checklist item should represent a single developer action (15–240 minutes). This template shows the minimal fields required and an example task layout.

---

## Implementation Steps Format (Atomic Checklist)

- Use a markdown checklist for each task's implementation steps. Keep steps short and atomic.
- Agents MUST request explicit human approval before toggling any `- [ ]` to `- [x]`. When they do toggle items they must report which items were changed, why, and include any artifacts (logs, diffs, screenshots) as applicable.
- Example:

- [ ] Create model `WeatherCache` in `backend/api/models.py`
- [ ] Run `python manage.py makemigrations` and commit migration
- [ ] Run `python manage.py migrate` and verify table exists

---

## Minimal Task Block (copy for each TASK-###)

### TASK-###: [Short title]

**Status**: Not Started | In Progress | Blocked | Complete

**Priority**: High | Medium | Low  
**Effort**: [est. hours]
**Assignee**: Backend | Frontend | QA | DevOps

**Description (1–2 lines)**

**Acceptance Criteria (concise)**

- [ ] Criterion 1
- [ ] Criterion 2

**Implementation Steps (atomic checklist)**

- [ ] Step 1: one clear action (file, command, small change)
- [ ] Step 2: next small action (test, migration, commit)
- [ ] Step 3: final small action (PR, run tests, document)

**Files to modify (minimal list)**

- `path/to/file1`
- `path/to/file2`

**Test Coverage (minimal tests to add/run)**

- [ ] Unit test: what to assert
- [ ] Integration test: what to assert (if applicable)

**Notes (short)**

- Any quick important note or constraint

---

## Progress Tracking

- Use the per-task atomic checklists as the single source of truth for progress. Do not duplicate progress elsewhere.
- At top of the file, add a small project progress summary if desired (optional):

- [ ] Phase 1: Foundation (n/m)
- [ ] Phase 2: Implementation (n/m)

---

## Definition of Done

- [ ] All task implementation checklist items completed and reviewed
- [ ] All acceptance criteria checked
- [ ] All tests passing locally
- [ ] PR created, reviewed, and merged

---

## Approval

**Submitted by**: [Agent/Person]
**Submitted on**: [Date]
**Reviewed by**: [User]
**Approval Status**: Pending | Approved | Rejected

When approving, reviewers should confirm: checklist granularity is sufficient, acceptance criteria are testable, and no checklist items were auto-marked without explicit approval.
