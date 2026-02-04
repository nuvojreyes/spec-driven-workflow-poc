---
description: "Invoke Architect Agent and Tasks Agent to create technical design and implementation plan from Jira ticket"
agent: "Expert Software Architect"
tools:
  [
    "search/changes",
    "search/codebase",
    "edit/editFiles",
    "web/fetch",
    "web/githubRepo",
    "read/problems",
    "atlassian/atlassian-mcp-server/fetch",
    "atlassian/atlassian-mcp-server/search",
    "search/usages",
  ]
---

# Design Technical Solution

This prompt invokes the **Architect Agent** followed by the **Tasks Agent** to transform a Jira ticket into a complete technical design and implementation plan.

## Prerequisites

- **Jira ticket ID** provided by user or extracted from branch name
- Jira ticket contains feature description and acceptance criteria
- You're on the correct git branch for the ticket (e.g., `feature/PROJ-123-feature-name`)

## Workflow Overview

```
Jira Ticket (via MCP)
         ↓
[Architect Agent]
├─ Creates technical-design.md
└─ MANDATORY: Devils Advocate
         ↓
[Tasks Agent]  
├─ Creates tasks.md
├─ MANDATORY: Devils Advocate
└─ REQUEST APPROVAL (SINGLE GATE)
```

## Phase 1: Architect Agent - Technical Design

The **Architect Agent** creates the technical architecture from the Jira ticket.

### Your Mission (Architect Agent)

Create **`technical-design.md`** with architecture, tech stack, data models, and API contracts.

**Note**: Architect Agent does NOT create tasks.md. That's handled by Tasks Agent in Phase 2.

### Architect Agent Workflow

1. **FETCH Jira Ticket via MCP**
   ```bash
   # Extract ticket ID from branch name
   TICKET_ID=$(git branch --show-current | sed 's/feature\///')
   ```
   
   - Use Jira MCP to fetch ticket: `jira_getIssue(ticket_id=$TICKET_ID)`
   - Extract: summary, description, acceptance criteria, story points
   - This Jira ticket is the **sole source of requirements** (no requirements.md)

2. **CREATE Ticket Directory**
   ```bash
   mkdir -p specs/jira-tickets/$TICKET_ID/.archive
   cp specs/templates/technical-design.template.md specs/jira-tickets/$TICKET_ID/technical-design.md
   ```

3. **ANALYZE Requirements & Codebase**
   - Understand all requirements from Jira ticket
   - Analyze current codebase for patterns and constraints
   - Identify integration points and dependencies
   - Check AGENTS.md for project context

4. **DESIGN Architecture**
   - Choose appropriate patterns and technologies
   - Design data models and schemas
   - Define API contracts and interfaces
   - Plan component interactions
   - Consider scalability, security, and maintainability

5. **MANDATORY: Devils Advocate Self-Critique**
   Before completing design, challenge your work:
   - "Why this approach over alternatives?"
   - "What could go wrong with this design?"
   - "Will this handle 10x growth?"
   - "Where are the security vulnerabilities?"
   - "Are there performance bottlenecks?"
   - "What edge cases did we miss?"
   
   **Document your critique and refinements made.**

6. **REFINE technical-design.md**
   - Address all concerns from Devils Advocate
   - Update diagrams and documentation
   - Ensure compliance with security standards (OWASP)

7. **HAND OFF to Tasks Agent**
   Notify that technical-design.md is ready:

   ```markdown
   ## Technical Design Complete

   I've completed the technical design for ticket [TICKET-ID].

   **Location**: `specs/jira-tickets/[TICKET-ID]/technical-design.md`

   **Key Decisions**:
   - [Decision 1 with rationale]
   - [Decision 2 with rationale]

   **Technology Stack**:
   - Backend: [Tech choices]
   - Frontend: [Tech choices]

   **Devils Advocate Applied**: Yes
   - Concern 1: [How addressed]
   - Concern 2: [How addressed]

   **Confidence Score**: [0-100%]

   **Next**: Tasks Agent will create implementation plan (tasks.md)
   ```

## Phase 2: Tasks Agent - Implementation Plan

The **Tasks Agent** reads the technical design and creates an atomic task breakdown.

### Your Mission (Tasks Agent)

Create **`tasks.md`** with detailed, atomic task checklist for implementation.

### Tasks Agent Workflow

1. **READ Inputs**
   ```bash
   TICKET_ID=$(git branch --show-current | sed 's/feature\///')
   ```
   
   - Read `specs/jira-tickets/$TICKET_ID/technical-design.md`
   - Fetch Jira ticket via MCP for acceptance criteria context
   - Understand the architecture, components, and design decisions

2. **COPY Tasks Template**
   ```bash
   cp specs/templates/tasks.template.md specs/jira-tickets/$TICKET_ID/tasks.md
   ```

3. **CREATE Atomic Task Breakdown**
   For each component/phase in the technical design:
   
   - Create TASK-### blocks with atomic checklist steps
   - Each checklist item = single developer action (15-240 minutes)
   - Include: description, acceptance criteria, implementation steps, files, tests

   **Atomic Checklist Rules:**
   - One action per line (create file, add field, run command, write test)
   - No compound steps ("Create model and run migrations" → split into 2 steps)
   - Include commit steps after logical units of work
   - Test steps immediately follow implementation steps

4. **MANDATORY: Devils Advocate Self-Critique**
   Before presenting tasks, challenge your work:
   - "Are there circular dependencies between tasks?"
   - "Are estimates realistic or optimistic?"
   - "What tasks are missing?"
   - "Which tasks are high-risk and need extra attention?"
   - "Can each task be completed independently once dependencies are met?"
   - "Are acceptance criteria specific and testable?"
   - "Did I include all necessary test tasks?"
   
   **Document your critique and refinements made.**

5. **REFINE tasks.md**
   - Address concerns from Devils Advocate
   - Add missing tasks identified
   - Adjust estimates if needed
   - Ensure proper dependency ordering

6. **REQUEST APPROVAL (Single Gate)**
   Present tasks.md to user:

   ```markdown
   ## Approval Request: Implementation Plan

   I've created the implementation plan for ticket [TICKET-ID].

   **Location**: `specs/jira-tickets/[TICKET-ID]/tasks.md`

   **Summary**:
   - Total tasks: [N]
   - Estimated effort: [X hours/days]
   - Phases: [List phases]

   **Task Overview**:
   1. TASK-001: [Title] - [Effort]
   2. TASK-002: [Title] - [Effort]
   ...

   **Dependencies**: [Key dependencies]

   **Risks Identified**:
   - [Risk 1]: Mitigation: [Strategy]

   **Devils Advocate Applied**: Yes - [Key concerns addressed]

   Please review and approve to proceed to implementation.
   ```

   **Wait for approval before implementation agents begin work.**

## Output Artifacts

### 1. technical-design.md

```markdown
---
title: [Feature Name] - Technical Design
date_created: [YYYY-MM-DD]
status: draft | approved | implemented
version: 1.0
confidence: [0-100%]
---

# [Feature Name] - Technical Design

## Overview

[High-level architecture description]

## Technology Stack

**Backend**:

- Language/Framework: [Choice with rationale]
- Database: [Choice with rationale]
- Key Libraries: [List with purposes]

**Frontend**:

- Framework: [Choice with rationale]
- State Management: [Choice with rationale]
- Key Libraries: [List with purposes]

**Testing**:

- E2E: [Framework and approach]
- Unit: [Framework and approach]

## Architecture

[Describe component interactions, data flow, and system architecture]
```

[Diagram or ASCII art if helpful]

````

## Data Models

### Model 1: [Name]

```typescript
interface ModelName {
  id: string;
  field1: Type;
  field2: Type;
}
````

**Rationale**: [Why this structure]

## API Contracts

### Endpoint: POST /api/resource

**Request**:

```json
{
	"field": "value"
}
```

**Response** (200 OK):

```json
{
	"id": "123",
	"field": "value"
}
```

**Error Cases**:

- 400: [Validation errors]
- 404: [Not found]
- 500: [Server error]

## Component Design

### Frontend Components

- **ComponentName**: [Purpose and responsibilities]
  - Props: [List]
  - State: [List]
  - Interactions: [How it communicates]

### Backend Services

- **ServiceName**: [Purpose and responsibilities]
  - Methods: [List]
  - Dependencies: [List]

## Security Considerations

- [Authentication approach]
- [Authorization patterns]
- [Data validation strategy]
- [OWASP compliance]

## Performance Considerations

- [Caching strategy]
- [Database optimization]
- [Frontend optimization]
- [Expected load and scaling plan]

## Testing Strategy

- **Unit Tests**: [What to test, coverage goals]
- **Integration Tests**: [Key integration points]
- **E2E Tests**: [Critical user flows]

## Risks & Mitigations

| Risk     | Impact       | Probability  | Mitigation |
| -------- | ------------ | ------------ | ---------- |
| [Risk 1] | High/Med/Low | High/Med/Low | [Strategy] |

## Alternative Approaches Considered

- **Approach 1**: [Why not chosen]
- **Approach 2**: [Why not chosen]

## Dependencies

- External APIs: [List]
- Third-party libraries: [List]
- Infrastructure requirements: [List]

## Open Questions

- [ ] Question 1
- [ ] Question 2

````

### 2. tasks.md

```markdown
---
title: [Feature Name] - Implementation Tasks
date_created: [YYYY-MM-DD]
status: not-started | in-progress | completed
version: 1.0
total_tasks: [X]
total_estimate: [Y hours]
---

# [Feature Name] - Implementation Tasks

## Task Summary

- **Total Tasks**: [X]
- **Backend Tasks**: [X] ([Y] hours)
- **Frontend Tasks**: [X] ([Y] hours)
- **Testing Tasks**: [X] ([Y] hours)
- **DevOps Tasks**: [X] ([Y] hours)

## Dependencies Graph

````

TASK-001 → TASK-003 → TASK-007
TASK-002 → TASK-004 → TASK-008
TASK-005 → TASK-006 → TASK-009

```

## Backend Tasks

### TASK-001: [Task Title]

**Description**: [What needs to be done]

**Files to modify**:
- `backend/api/models.py` - [What to add/change]
- `backend/api/views.py` - [What to add/change]

**Implementation details**:
1. Step 1
2. Step 2
3. Step 3

**Acceptance criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

**Estimate**: [X hours]

**Dependencies**: None | TASK-XXX

**Risk**: Low | Medium | High - [Rationale]

---

## Frontend Tasks

### TASK-005: [Task Title]

[Same structure as backend]

---

## Testing Tasks

### TASK-010: [Task Title]

**Description**: Create E2E tests for [feature]

**Test scenarios**:
1. Happy path: [Description]
2. Error case: [Description]
3. Edge case: [Description]

**Files to create/modify**:
- `qa/tests/feature-name.spec.ts`

**Estimate**: [X hours]

---

## DevOps Tasks

### TASK-015: [Task Title]

[Configuration, deployment, CI/CD tasks]

---

## Verification Checklist

After all tasks complete:
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance tested
- [ ] All Jira ticket acceptance criteria verified
```

## Best Practices

- **Be Explicit**: Include exact file paths, function names, code structure
- **Be Atomic**: Each task should be independently completable (one action per checklist item)
- **Be Realistic**: Estimate conservatively, factor in testing time
- **Be Clear**: Anyone should be able to pick up a task and execute it
- **Reference Jira**: Link tasks to specific Jira ticket acceptance criteria

## Reference

- See `.github/instructions/spec-driven-workflow.instructions.md` for complete methodology
- See `.github/agents/architect.agent.md` for Architect Agent details
- See `.github/agents/tasks.agent.md` for Tasks Agent details

