# Simplify Spec-Driven Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the spec-driven development workflow by eliminating Product Agent, creating a dedicated Tasks Agent, consolidating approval gates, and integrating Devils Advocate at strategic points.

**Architecture:** Remove Product Agent entirely. Architect Agent takes Jira tickets directly and creates technical-design.md. New Tasks Agent reads design and generates tasks.md. Single approval gate after tasks.md. Devils Advocate integrated between design→tasks and after all implementation tasks complete.

**Tech Stack:** Markdown agent files, shell scripts for automation

---

## Summary of Changes

| Current State | New State |
|---------------|-----------|
| Product Agent → requirements.md (optional) → Gate 1 | **ELIMINATED** |
| Architect Agent → technical-design.md → Gate 2 → tasks.md → Gate 3 | Architect Agent → technical-design.md → Devils Advocate → Tasks Agent → tasks.md → **SINGLE GATE** |
| requirements.template.md | **DELETE** |
| 3 approval gates | **1 approval gate** |
| Devils Advocate optional/scattered | Devils Advocate **mandatory** at 3 points |
| QA integrated in main workflow (unclear) | QA **separate workflow** (own automation tickets + manual validation) |

---

## Task 1: Delete Product Agent

**Files:**
- Delete: `.github/agents/product.agent.md`

**Step 1: Remove product.agent.md file**

```bash
rm .github/agents/product.agent.md
```

**Step 2: Verify file is deleted**

Run: `ls -la .github/agents/`
Expected: No `product.agent.md` in listing

**Step 3: Commit**

```bash
git add .github/agents/product.agent.md
git commit -m "chore: remove Product Agent from workflow

Product Agent eliminated per workflow simplification.
Architect Agent now takes Jira tickets directly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Delete Requirements Template

**Files:**
- Delete: `specs/templates/requirements.template.md`

**Step 1: Remove requirements.template.md file**

```bash
rm specs/templates/requirements.template.md
```

**Step 2: Verify file is deleted**

Run: `ls -la specs/templates/`
Expected: Only `technical-design.template.md` and `tasks.template.md` remain

**Step 3: Commit**

```bash
git add specs/templates/requirements.template.md
git commit -m "chore: remove requirements template

requirements.md no longer part of workflow.
Jira tickets serve as sole source of requirements.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Tasks Agent

**Files:**
- Create: `.github/agents/tasks.agent.md`

**Step 1: Create the Tasks Agent file**

Write `.github/agents/tasks.agent.md` with the following content:

```markdown
---
description: "Expert implementation planner who transforms technical designs into atomic, actionable task checklists for development teams"
name: "Tasks Planner"
tools:
  [
    "search/codebase",
    "edit/editFiles",
    "atlassian/atlassian-mcp-server/fetch",
    "web/fetch",
    "vscode/getProjectSetupInfo",
    "read/problems",
    "execute/getTerminalOutput",
    "execute/runInTerminal",
    "search/searchResults",
  ]
---

# Tasks Planner Agent

You are an expert implementation planner who transforms technical designs into detailed, atomic task checklists. Your primary role is to read `technical-design.md` and create `tasks.md` with actionable implementation steps.

## Your Expertise

- **Task Decomposition**: Breaking complex features into atomic, single-action tasks
- **Dependency Analysis**: Identifying task dependencies and optimal execution order
- **Effort Estimation**: Realistic time estimates based on complexity
- **Acceptance Criteria**: Writing specific, testable criteria for each task
- **Test Planning**: Defining unit, integration, and E2E tests per task

## Your Primary Role

**Transform technical designs into implementation plans:**

1. **Input**: Read `technical-design.md` from ticket directory + Jira ticket via MCP
2. **Process**: Analyze design, identify components, break into atomic tasks
3. **Self-Critique**: Apply Devils Advocate to validate task completeness
4. **Output**: Create `tasks.md` with atomic checklist format

## Workflow Steps

### 1. Identify Ticket Context

- Extract ticket ID from git branch: `git branch --show-current | sed 's/feature\///'`
- Verify `specs/jira-tickets/<TICKET-ID>/technical-design.md` exists
- If missing, report error (Architect Agent must run first)

### 2. Read Inputs

- Read `technical-design.md` from ticket directory
- Fetch Jira ticket via MCP for context (acceptance criteria, story points)
- Understand the architecture, components, and design decisions

### 3. Copy Tasks Template

```bash
TICKET_ID=$(git branch --show-current | sed 's/feature\///')
cp specs/templates/tasks.template.md specs/jira-tickets/$TICKET_ID/tasks.md
```

### 4. Create Atomic Task Breakdown

For each component/phase in the technical design:

- Create TASK-### blocks with atomic checklist steps
- Each checklist item = single developer action (15-240 minutes)
- Include: description, acceptance criteria, implementation steps, files, tests

**Atomic Checklist Rules:**
- One action per line (create file, add field, run command, write test)
- No compound steps ("Create model and run migrations" → split into 2 steps)
- Include commit steps after logical units of work
- Test steps immediately follow implementation steps

### 5. Self-Critique (Devils Advocate Mode)

Before presenting tasks.md, challenge your work:

- "Are there circular dependencies between tasks?"
- "Are estimates realistic or optimistic?"
- "What tasks are missing?"
- "Which tasks are high-risk and need extra attention?"
- "Can each task be completed independently once dependencies are met?"
- "Are acceptance criteria specific and testable?"
- "Did I include all necessary test tasks?"

### 6. Refine tasks.md

- Address concerns from self-critique
- Add missing tasks identified
- Adjust estimates if needed
- Ensure proper dependency ordering

### 7. REQUEST APPROVAL (Single Gate)

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

Wait for approval before implementation agents begin work.

## Checklist

- [ ] Ticket directory verified
- [ ] technical-design.md read and analyzed
- [ ] Jira ticket fetched via MCP for context
- [ ] tasks.template.md copied to ticket directory
- [ ] Atomic task breakdown created
- [ ] Self-critique (Devils Advocate) applied
- [ ] tasks.md refined based on critique
- [ ] **APPROVAL GATE: tasks.md approved**

## Task Block Template

```markdown
### TASK-###: [Short title]

**Status**: Not Started | In Progress | Blocked | Complete

**Priority**: High | Medium | Low
**Effort**: [est. hours]
**Dependencies**: [TASK-### or None]
**Assignee**: Backend | Frontend | QA | DevOps

**Description (1-2 lines)**

**Acceptance Criteria**
- [ ] Criterion 1
- [ ] Criterion 2

**Implementation Steps (atomic checklist)**
- [ ] Step 1: one clear action
- [ ] Step 2: next small action
- [ ] Step 3: run tests
- [ ] Step 4: commit

**Files to modify**
- `path/to/file1`
- `path/to/file2`

**Test Coverage**
- [ ] Unit test: what to assert
- [ ] Integration test: what to assert (if applicable)
```

## Integration with Other Agents

### ← Architect Agent
- **Input from**: `technical-design.md` with architecture and design decisions
- **Handoff**: Architect completes design, applies Devils Advocate, then notifies Tasks Agent

### → Implementation Agents (Backend/Frontend)
- **Output to**: `tasks.md` with atomic checklist
- **Handoff**: After user approval, implementation agents read tasks.md and execute one task at a time

## Quality Criteria

- Every task has atomic checklist steps (single actions)
- Dependencies are explicit and non-circular
- Acceptance criteria are testable
- Effort estimates are realistic
- Test coverage defined for each task
- Devils Advocate critique documented
```

**Step 2: Verify file was created**

Run: `ls -la .github/agents/tasks.agent.md`
Expected: File exists with appropriate size

**Step 3: Commit**

```bash
git add .github/agents/tasks.agent.md
git commit -m "feat: add Tasks Agent for implementation planning

New agent dedicated to transforming technical designs into
atomic task checklists. Separates concerns from Architect Agent.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update Architect Agent

**Files:**
- Modify: `.github/agents/architect.agent.md`

**Step 1: Update Architect Agent to remove tasks.md creation and add Devils Advocate integration**

Key changes:
1. Remove all references to Product Agent and requirements.md
2. Remove tasks.md creation (now handled by Tasks Agent)
3. Add mandatory Devils Advocate after technical-design.md
4. Update workflow to hand off to Tasks Agent
5. Remove Gate 2 and Gate 3 references (single gate is after tasks.md)

The new workflow section should be:

```markdown
## Workflow Steps

1. **Identify Ticket Context**
   - Extract from user, git branch, or ask
   - Verify/create `specs/jira-tickets/<TICKET-ID>/` directory

2. **Fetch Jira Ticket via MCP**
   - Use `jira_getIssue` with ticket ID
   - Extract: summary, description, acceptance criteria, story points
   - This is the sole source of requirements (no requirements.md)

3. **Copy Technical Design Template**
   ```bash
   TICKET_ID=$(git branch --show-current | sed 's/feature\///')
   mkdir -p specs/jira-tickets/$TICKET_ID/.archive
   cp specs/templates/technical-design.template.md specs/jira-tickets/$TICKET_ID/technical-design.md
   ```

4. **Analyze Requirements & Codebase**
   - Understand all requirements from Jira
   - Analyze current codebase for patterns and constraints
   - Identify integration points and dependencies

5. **Create technical-design.md**
   - Architecture and component design
   - Data models and API contracts
   - Security, performance, testing strategy
   - Write to: `specs/jira-tickets/<TICKET-ID>/technical-design.md`

6. **MANDATORY: Devils Advocate Self-Critique**
   - "Why this approach over alternatives?"
   - "What could go wrong with this design?"
   - "Will this handle 10x growth?"
   - "Where are the security vulnerabilities?"
   - "Are there performance bottlenecks?"
   - "What edge cases did we miss?"

   Document critique results and refinements made.

7. **Refine technical-design.md**
   - Address all concerns from Devils Advocate
   - Update diagrams and documentation

8. **Hand Off to Tasks Agent**
   Notify that technical-design.md is ready:

   ```markdown
   ## Technical Design Complete

   I've completed the technical design for ticket [TICKET-ID].

   **Location**: `specs/jira-tickets/[TICKET-ID]/technical-design.md`

   **Key Decisions**:
   - [Decision 1]
   - [Decision 2]

   **Devils Advocate Applied**: Yes
   - Concern 1: [How addressed]
   - Concern 2: [How addressed]

   **Next**: Tasks Agent will create implementation plan (tasks.md)
   ```

## Checklist

- [ ] Ticket directory created/verified
- [ ] Jira ticket fetched via MCP
- [ ] technical-design.template.md copied
- [ ] Codebase analyzed for patterns and constraints
- [ ] technical-design.md created
- [ ] **MANDATORY: Devils Advocate self-critique applied**
- [ ] Design refined based on critique
- [ ] Hand off to Tasks Agent
```

**Step 2: Verify changes compile (no syntax errors in markdown)**

Run: `head -100 .github/agents/architect.agent.md`
Expected: Updated content visible

**Step 3: Commit**

```bash
git add .github/agents/architect.agent.md
git commit -m "refactor: update Architect Agent for simplified workflow

- Remove Product Agent dependencies and requirements.md references
- Remove tasks.md creation (now handled by Tasks Agent)
- Add mandatory Devils Advocate after technical design
- Update handoff to Tasks Agent

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update Workflow Instructions

**Files:**
- Modify: `.github/instructions/spec-driven-workflow.instructions.md`

**Step 1: Rewrite workflow instructions for new flow**

Key changes:
1. Remove Phase 0 (GATHER) and Phase 1 (ANALYZE) - Product Agent phases
2. Update core artifacts (remove requirements.md)
3. Update approval gates (single gate after tasks.md)
4. Update file organization (no requirements.md)
5. Update agent handoff protocol
6. Make Devils Advocate mandatory at specific points
7. Add post-implementation Devils Advocate

New structure:

```markdown
# Specification-Driven Workflow - Shared Protocol

**Purpose**: Define the common language, artifacts, and approval process used by all agents.

## Core Artifacts

- **Jira Ticket**: Primary source of truth for feature requirements (accessed via Jira MCP)
- **`technical-design.md`**: Technical architecture and implementation strategy (created by Architect Agent)
- **`tasks.md`**: Detailed implementation plan with atomic task breakdown (created by Tasks Agent)

## Workflow Phases

### Phase 1: DESIGN (Architect Agent)
1. Fetch Jira ticket via MCP
2. Analyze codebase and constraints
3. Create technical-design.md
4. **MANDATORY: Devils Advocate self-critique**
5. Refine design based on critique
6. Hand off to Tasks Agent

### Phase 2: PLAN (Tasks Agent)
1. Read technical-design.md + Jira ticket
2. Create atomic task breakdown in tasks.md
3. **MANDATORY: Devils Advocate self-critique**
4. Refine tasks based on critique
5. **REQUEST APPROVAL (SINGLE GATE)**

### Phase 3: IMPLEMENT (Backend/Frontend Agents)
1. Read: Jira + technical-design.md + tasks.md
2. Execute ONE atomic task at a time
3. Request approval before each task
4. Update tasks.md checklist after completion
5. After ALL tasks complete: **MANDATORY: Devils Advocate review**

### Phase 4: COMPLETE
1. All tasks verified complete
2. Tests passing
3. PR created

## Single Approval Gate

| **Gate** | **Agent** | **Artifact** | **When** |
|----------|-----------|--------------|----------|
| Gate 1 | Tasks Agent | `tasks.md` | After implementation plan complete |

## Devils Advocate Protocol (Mandatory)

Devils Advocate is **mandatory** at these points:

1. **After technical-design.md** (Architect Agent)
   - Challenge architecture decisions
   - Identify security/performance risks
   - Document how concerns were addressed

2. **After tasks.md** (Tasks Agent)
   - Validate task completeness
   - Check for circular dependencies
   - Verify estimates are realistic

3. **After all implementation tasks complete** (Implementation Agents)
   - Review implementation against design
   - Identify technical debt introduced
   - Validate all acceptance criteria met

## File Organization

```
specs/
├── jira-tickets/
│   ├── PROJ-123-feature-name/
│   │   ├── technical-design.md
│   │   ├── tasks.md
│   │   └── .archive/
│   └── ...
└── templates/
    ├── technical-design.template.md
    └── tasks.template.md
```

## Agent Handoff Protocol

1. **Architect Agent → Tasks Agent**
   - Trigger: technical-design.md complete + Devils Advocate applied
   - Handoff: Tasks Agent reads technical-design.md

2. **Tasks Agent → Implementation Agents**
   - Trigger: tasks.md approved by user (single gate)
   - Handoff: Implementation agents read all artifacts

3. **Implementation Agents → User**
   - Trigger: All tasks complete + Devils Advocate review + tests pass
   - Handoff: PR submitted
```

**Step 2: Verify changes**

Run: `head -50 .github/instructions/spec-driven-workflow.instructions.md`
Expected: Updated header and structure visible

**Step 3: Commit**

```bash
git add .github/instructions/spec-driven-workflow.instructions.md
git commit -m "refactor: simplify spec-driven workflow

- Remove Product Agent phases (requirements.md eliminated)
- Consolidate to single approval gate after tasks.md
- Make Devils Advocate mandatory at 3 points:
  1. After technical-design.md
  2. After tasks.md
  3. After all implementation tasks
- Update file organization and agent handoff

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Templates with Required/Optional Markers

**Files:**
- Modify: `specs/templates/technical-design.template.md`
- Modify: `specs/templates/tasks.template.md`

**Step 1: Add [REQUIRED] and [IF-APPLICABLE] markers to technical-design.template.md**

Add markers to each section header:

```markdown
## Design Overview [REQUIRED]
## Architecture [REQUIRED]
## Data Model [IF-APPLICABLE]
## API Design [IF-APPLICABLE]
## Security Considerations [REQUIRED]
## Performance & Scalability [IF-APPLICABLE]
## Testing Strategy [REQUIRED]
## Deployment Strategy [IF-APPLICABLE]
## Risks & Mitigations [REQUIRED]
## Open Questions [IF-APPLICABLE]
## Dependencies [IF-APPLICABLE]
## Approval [REQUIRED]
```

**Step 2: Add markers to tasks.template.md**

```markdown
## Implementation Steps Format [REQUIRED]
## Progress Tracking [IF-APPLICABLE]
## Definition of Done [REQUIRED]
## Approval [REQUIRED]
```

**Step 3: Commit**

```bash
git add specs/templates/technical-design.template.md specs/templates/tasks.template.md
git commit -m "docs: add REQUIRED/IF-APPLICABLE markers to templates

Clarifies which sections are mandatory vs optional,
reducing friction for simpler features.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update Implementation Agents (Backend/Frontend)

**Files:**
- Modify: `.github/agents/backend.agent.md`
- Modify: `.github/agents/frontend.agent.md`

**Step 1: Update backend.agent.md**

Key changes:
1. Remove references to requirements.md
2. Update input sources (Jira + technical-design.md + tasks.md)
3. Add mandatory Devils Advocate after completing ALL tasks

Add to workflow section:

```markdown
## Post-Implementation Devils Advocate (Mandatory)

After completing ALL tasks in tasks.md:

1. Review implementation against technical-design.md
2. Ask yourself:
   - "Did we deviate from the design? Why?"
   - "What technical debt did we introduce?"
   - "Are all acceptance criteria from Jira met?"
   - "Are there any security concerns in the implementation?"
   - "Did we miss any edge cases?"

3. Document findings and address any issues before PR

4. Report to user:
   ```markdown
   ## Implementation Complete - Devils Advocate Review

   All tasks completed. Devils Advocate review performed:

   **Design Adherence**: [Assessment]
   **Technical Debt**: [Any debt introduced and why]
   **Acceptance Criteria**: [All met / Issues found]
   **Security Review**: [Findings]
   **Edge Cases**: [Coverage assessment]

   Ready for PR creation.
   ```
```

**Step 2: Apply same changes to frontend.agent.md**

**Step 3: Commit**

```bash
git add .github/agents/backend.agent.md .github/agents/frontend.agent.md
git commit -m "feat: add post-implementation Devils Advocate to impl agents

Implementation agents now perform mandatory Devils Advocate
review after completing all tasks, before PR creation.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Update QA Agent (Separate Workflow)

**Files:**
- Modify: `.github/agents/qa.agent.md`

**Step 1: Update QA Agent to clarify its separate workflow**

Key changes:
1. Remove all references to Product Agent
2. Clarify that QA works on its own automation tickets (not part of main dev workflow)
3. Clarify that manual QA validation of dev tickets happens outside this workflow
4. Update input sources (Jira ticket for automation + existing codebase)

Add new section at the top of the agent file after expertise:

```markdown
## QA Workflow Model

**IMPORTANT**: QA operates in a **separate workflow** from the main development process:

### 1. Test Automation Tickets (QA Agent Workflow)
- QA has its own Jira tickets for test automation work
- QA Agent follows the same spec-driven pattern:
  - Jira ticket → technical-design.md → tasks.md → implementation
- These tickets are for building/improving the test automation framework

### 2. Manual Validation (Outside Automated Workflow)
- QA manually validates tickets developed by Backend/Frontend teams
- This validation happens outside the spec-driven workflow
- Results are communicated through Jira comments/status updates

### Inputs for Automation Tickets
- **Jira Ticket**: The QA automation ticket (e.g., "Add E2E tests for weather search")
- **Codebase**: Existing application code to understand what to test
- **Existing Tests**: Current test suite to extend

### NOT Part of Main Dev Workflow
QA Agent does NOT:
- Receive handoff from Backend/Frontend agents
- Block PR creation for dev tickets
- Define tasks for dev ticket implementation
```

Remove or update these sections that reference Product Agent:
- Remove any "Integration with Product Agent" references
- Update "Integration with Other Components" to remove Product Agent

**Step 2: Verify changes**

Run: `head -80 .github/agents/qa.agent.md`
Expected: New QA Workflow Model section visible

**Step 3: Commit**

```bash
git add .github/agents/qa.agent.md
git commit -m "refactor: clarify QA Agent operates in separate workflow

QA Agent now clearly documented as:
- Working on its own automation tickets
- Manual validation happens outside automated workflow
- Not part of main dev ticket flow

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Update Workflow Instructions for QA

**Files:**
- Modify: `.github/instructions/spec-driven-workflow.instructions.md` (additional changes)

**Step 1: Add QA section to workflow instructions**

Add after the Agent Handoff Protocol section:

```markdown
## QA Testing (Separate Workflow)

QA operates **independently** from the main development workflow:

### Test Automation Work
- QA has dedicated Jira tickets for automation (e.g., "Add E2E tests for feature X")
- These tickets follow the same spec-driven pattern with their own:
  - technical-design.md (test architecture)
  - tasks.md (test implementation tasks)
- QA Agent works on these tickets using the same atomic task approach

### Manual Validation
- QA manually validates completed development work
- This happens outside the automated workflow
- Results communicated via Jira comments/status

### Relationship to Dev Workflow
```
┌────────────────────────────────┐     ┌────────────────────────────────┐
│    MAIN DEV WORKFLOW           │     │    QA AUTOMATION WORKFLOW      │
│                                │     │                                │
│ Jira (feature) → Architect →   │     │ Jira (test) → Architect →      │
│ Tasks Agent → Backend/Frontend │     │ Tasks Agent → QA Agent         │
│           ↓                    │     │           ↓                    │
│    PR Ready                    │ ──► │  Manual QA Validation          │
│                                │     │           ↓                    │
│                                │     │  Approved / Feedback           │
└────────────────────────────────┘     └────────────────────────────────┘
```

QA Agent does NOT:
- Block the main development workflow
- Define tasks for development tickets
- Receive automatic handoff from implementation agents
```

**Step 2: Commit**

```bash
git add .github/instructions/spec-driven-workflow.instructions.md
git commit -m "docs: add QA separate workflow section to instructions

Clarifies that QA operates independently:
- Own automation tickets with spec-driven pattern
- Manual validation outside automated workflow
- Does not block main dev workflow

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Clean Up Example Specs

**Files:**
- Delete: `specs/jira-tickets/EXAMPLE-001-demo-feature/requirements.md` (if exists)

**Step 1: Remove example requirements.md if present**

```bash
rm -f specs/jira-tickets/EXAMPLE-001-demo-feature/requirements.md 2>/dev/null || true
```

**Step 2: Commit if file was removed**

```bash
git add -A specs/jira-tickets/
git commit -m "chore: remove example requirements.md

Aligns example with new workflow (no requirements.md).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" || echo "No changes to commit"
```

---

## Task 11: Final Verification

**Step 1: Verify all files are in correct state**

```bash
echo "=== Checking deleted files ==="
ls .github/agents/product.agent.md 2>&1 || echo "✓ product.agent.md deleted"
ls specs/templates/requirements.template.md 2>&1 || echo "✓ requirements.template.md deleted"

echo ""
echo "=== Checking new files ==="
ls -la .github/agents/tasks.agent.md && echo "✓ tasks.agent.md created"

echo ""
echo "=== Checking remaining agents ==="
ls .github/agents/*.agent.md

echo ""
echo "=== Checking remaining templates ==="
ls specs/templates/*.md
```

Expected:
- product.agent.md: deleted
- requirements.template.md: deleted
- tasks.agent.md: created
- Remaining agents: architect, backend, frontend, qa (updated), devops, devils-advocate, tasks
- Remaining templates: technical-design.template.md, tasks.template.md
- QA Agent has "QA Workflow Model" section clarifying separate workflow

**Step 2: Run git status to verify all changes committed**

```bash
git status
```

Expected: Working tree clean (all changes committed)

**Step 3: Create summary commit (optional - if there are any uncommitted changes)**

```bash
git add -A
git commit -m "chore: workflow simplification complete

Summary of changes:
- Eliminated Product Agent (Jira is sole requirements source)
- Created Tasks Agent for implementation planning
- Consolidated to single approval gate (after tasks.md)
- Made Devils Advocate mandatory at 3 points
- Added REQUIRED/IF-APPLICABLE markers to templates

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" || echo "All changes already committed"
```

---

## New Workflow Diagram

### Main Development Workflow
```
Jira Ticket (Feature)
        ↓
[Architect Agent]
├─ Fetch Jira ticket via MCP
├─ Analyze codebase
├─ Create technical-design.md
├─ MANDATORY: Devils Advocate
└─ Hand off to Tasks Agent
        ↓
[Tasks Agent]
├─ Read technical-design.md + Jira
├─ Create tasks.md (atomic checklist)
├─ MANDATORY: Devils Advocate
└─ REQUEST APPROVAL ← SINGLE GATE
        ↓
[Backend/Frontend Agents]
├─ Request approval before each task
├─ Execute one task at a time
├─ Update tasks.md checklist
└─ After ALL tasks: MANDATORY Devils Advocate
        ↓
[PR Ready] ──► [Manual QA Validation]
```

### QA Automation Workflow (Separate)
```
Jira Ticket (Test Automation)
        ↓
[Architect Agent] → [Tasks Agent] → [QA Agent]
        ↓
[Test Suite Updated]
```

---

## Validation Checklist

- [ ] Product Agent deleted
- [ ] Requirements template deleted
- [ ] Tasks Agent created and functional
- [ ] Architect Agent updated (no tasks.md creation, mandatory DA)
- [ ] Workflow instructions updated (single gate, mandatory DA, QA separate workflow)
- [ ] Templates have REQUIRED/IF-APPLICABLE markers
- [ ] Implementation agents have post-completion DA
- [ ] QA Agent updated (clarified separate workflow)
- [ ] Example specs cleaned up
- [ ] All changes committed
