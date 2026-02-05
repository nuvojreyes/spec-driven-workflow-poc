---
description: "Invoke Tasks Agent to create implementation plan from technical design"
agent: "Task Planner Agent"
tools:
  [
    "search/changes",
    "search/codebase",
    "edit/editFiles",
    "read/problems",
    "atlassian/atlassian-mcp-server/fetch",
    "search/usages",
  ]
---

# Create Implementation Tasks

This prompt invokes the **Tasks Agent** to create a detailed implementation plan from the technical design.

## Prerequisites

- **Technical design already created** at `specs/jira-tickets/<TICKET-ID>/technical-design.md`
- You're on the correct git branch for the ticket (e.g., `feature/PROJ-123-feature-name`)
- Jira ticket is accessible via MCP for acceptance criteria reference

## Workflow Overview

```
technical-design.md + Jira Ticket
         ↓
[Tasks Agent]
├─ Creates tasks.md
├─ MANDATORY: Devils Advocate
└─ REQUEST APPROVAL (SINGLE GATE)
```

## Your Mission (Tasks Agent)

Create **`tasks.md`** with detailed, atomic task breakdown for implementation.

## Tasks Agent Workflow

1. **READ Inputs**

   ```bash
   # Extract ticket ID from branch name
   TICKET_ID=$(git branch --show-current | sed 's/feature\///')
   ```

   - Read `specs/jira-tickets/$TICKET_ID/technical-design.md`
   - Fetch Jira ticket via MCP for acceptance criteria context: `jira_getIssue(ticket_id=$TICKET_ID)`
   - Understand the architecture, components, and design decisions
   - Check AGENTS.md for project context and conventions

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
   - Each step should be independently verifiable

   **Task Structure:**

   ```markdown
   ### TASK-001: [Descriptive Title]

   **Description**: [What needs to be done and why]

   **Files to modify/create**:

   - `path/to/file.py` - [What to add/change]
   - `path/to/another.ts` - [What to add/change]

   **Atomic Checklist**:

   - [ ] Step 1: [Single action - create, modify, run, test]
   - [ ] Step 2: [Single action]
   - [ ] Step 3: [Commit changes]
   - [ ] Step 4: [Run tests]

   **Acceptance Criteria**:

   - [ ] Specific, testable criterion 1
   - [ ] Specific, testable criterion 2

   **Estimate**: [X hours]
   **Dependencies**: None | TASK-XXX, TASK-YYY
   **Risk**: Low | Medium | High - [Rationale if Medium/High]
   ```

   **Organization by Phase:**
   - Phase 1: Database & Models
   - Phase 2: Backend API
   - Phase 3: Frontend Implementation
   - Phase 4: Testing & QA
   - Phase 5: Deployment & DevOps

4. **MANDATORY: Devils Advocate Self-Critique**

   Before presenting tasks, challenge your work:
   - "Are there circular dependencies between tasks?"
   - "Are estimates realistic or optimistic?"
   - "What tasks are missing?"
   - "Which tasks are high-risk and need extra attention?"
   - "Can each task be completed independently once dependencies are met?"
   - "Are acceptance criteria specific and testable?"
   - "Did I include all necessary test tasks?"
   - "Does each checklist item represent ONE action?"
   - "Are commit and test steps included at appropriate points?"

   **Document your critique and refinements made.**

5. **REFINE tasks.md**
   - Address all concerns from Devils Advocate
   - Add missing tasks identified
   - Split tasks that are too large (> 8 hours)
   - Adjust estimates if needed
   - Ensure proper dependency ordering (create dependency graph)
   - Verify all Jira acceptance criteria are covered

6. **REQUEST APPROVAL (Single Gate)**

   Present tasks.md to user:

   ```markdown
   ## Approval Request: Implementation Plan

   I've created the implementation plan for ticket [TICKET-ID].

   **Location**: `specs/jira-tickets/[TICKET-ID]/tasks.md`

   **Summary**:

   - Total tasks: [N]
   - Total atomic checklist items: [M]
   - Estimated effort: [X hours/days]
   - Phases: [List phases with task counts]

   **Task Overview**:

   1. TASK-001: [Title] - [Effort] - [Dependencies]
   2. TASK-002: [Title] - [Effort] - [Dependencies]
   3. TASK-003: [Title] - [Effort] - [Dependencies]
      ...

   **Dependencies Graph**:
   ```

   TASK-001 → TASK-003 → TASK-007
   TASK-002 → TASK-004 → TASK-008
   TASK-005 → TASK-006 → TASK-009

   ```

   **Coverage**:
   - ✅ Jira Acceptance Criterion 1: Covered by TASK-XXX
   - ✅ Jira Acceptance Criterion 2: Covered by TASK-YYY
   - ✅ Jira Acceptance Criterion 3: Covered by TASK-ZZZ

   **Risks Identified**:
   - [Risk 1]: Mitigation: [Strategy] - Covered in TASK-XXX
   - [Risk 2]: Mitigation: [Strategy] - Covered in TASK-YYY

   **Devils Advocate Applied**: Yes
   - Concern 1: [What was found] → [How addressed]
   - Concern 2: [What was found] → [How addressed]

   Please review and approve to proceed to implementation.
   ```

   **Wait for approval before implementation agents begin work.**

## Output Artifact

After completing this prompt, you will have created:

### tasks.md

**Location**: `specs/jira-tickets/<TICKET-ID>/tasks.md`  
**Template**: `specs/templates/tasks.template.md`

**Key Sections**:

- Task summary with total estimates by phase
- Dependencies graph showing task ordering
- Atomic task breakdown organized by phase:
  - **Phase 1**: Database & Models (TASK-001 to TASK-NNN)
  - **Phase 2**: Backend API (TASK-NNN to TASK-NNN)
  - **Phase 3**: Frontend (TASK-NNN to TASK-NNN)
  - **Phase 4**: Testing & QA (TASK-NNN to TASK-NNN)
  - **Phase 5**: Deployment (TASK-NNN to TASK-NNN)

**Each task includes**:

- Unique ID (TASK-###)
- Descriptive title
- Clear description and purpose
- Files to modify/create
- **Atomic checklist** (one action per line)
- Acceptance criteria (testable)
- Effort estimate (hours)
- Dependencies on other tasks
- Risk level with rationale

**Additional sections**:

- Jira acceptance criteria mapping
- Risks and mitigation strategies
- Verification checklist for completion

## Best Practices

- **Be Atomic**: Each checklist item = one developer action (create file, add field, run command, write test)
- **Be Specific**: Include exact file paths, function names, command syntax
- **Be Realistic**: Estimate conservatively, include time for testing and debugging
- **Be Sequential**: Organize tasks in dependency order
- **Be Testable**: Include test tasks immediately after implementation tasks
- **Be Complete**: Cover all Jira acceptance criteria
- **Map to Jira**: Explicitly link tasks to Jira acceptance criteria
- **Commit Often**: Include commit steps after logical units of work

## Quality Checklist

Before requesting approval, verify:

- [ ] All Jira acceptance criteria are covered by tasks
- [ ] Each task has atomic checklist items (one action per line)
- [ ] Dependencies are clearly identified (no circular dependencies)
- [ ] Estimates are realistic (factor in testing, debugging, review time)
- [ ] Test tasks are included for all implementation tasks
- [ ] Risk assessment is provided for medium/high-risk tasks
- [ ] Files to modify are explicitly listed
- [ ] Acceptance criteria are specific and testable
- [ ] Commit and test steps are included at appropriate points
- [ ] Devils Advocate critique was applied and documented

## Next Steps

After approval of tasks.md:

1. **Implementation begins**: Backend/Frontend agents execute tasks one at a time
2. **Each task requires approval** before starting
3. **Progress tracked** in tasks.md checklist
4. **Tests run** after each implementation task
5. **After all tasks complete**: Mandatory Devils Advocate review before PR

## Reference

- See `.github/instructions/spec-driven-workflow.instructions.md` for complete methodology
- See `.github/agents/tasks.agent.md` for Tasks Agent details
- See `specs/templates/tasks.template.md` for the full template
