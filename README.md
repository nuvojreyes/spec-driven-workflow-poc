# Specification-Driven Development Workflow

This project uses a **Spec-Driven Development (SDD)** methodology where all features are planned through technical design and atomic task breakdown before implementation begins.

## How the Workflow Works

The workflow transforms Jira tickets into implemented features through three phases with a single approval gate:

## How the Workflow Works

The workflow transforms Jira tickets into implemented features through three phases with a single approval gate:

### Phase 1: Design (Architect Agent)

- **Input**: Jira ticket (fetched via MCP)
- **Output**: `technical-design.md` with architecture, data models, API contracts
- **Quality Control**: Mandatory Devils Advocate self-critique
- **Location**: `specs/jira-tickets/<TICKET-ID>/technical-design.md`

### Phase 2: Plan (Tasks Agent)

- **Input**: `technical-design.md` + Jira ticket context
- **Output**: `tasks.md` with atomic task checklist
- **Quality Control**: Mandatory Devils Advocate self-critique
- **Approval Gate**: User reviews and approves implementation plan ✓

### Phase 3: Implementation (Backend/Frontend Agents)

- **Input**: Jira ticket + `technical-design.md` + `tasks.md`
- **Process**: Execute tasks one at a time, update checklist after each
- **Quality Control**: Mandatory Devils Advocate review after ALL tasks
- **Output**: Working code, tests, PR

```
Jira Ticket
     ↓
[Architect Agent] → technical-design.md → Devils Advocate
     ↓
[Tasks Agent] → tasks.md → Devils Advocate
     ↓
[APPROVAL GATE] ← User approves plan
     ↓
[Implementation Agents] → Code + Tests → Devils Advocate
     ↓
Pull Request
```

## Working with a Jira Ticket: Step-by-Step Guide

### Prerequisites

- Access to Jira (MCP connection configured)
- Git repository cloned
- Development environment ready (see [AGENTS.md](AGENTS.md) for setup)

### Step 1: Create Feature Branch

```bash
# Use Jira ticket ID in branch name
git checkout -b feature/PROJ-123-brief-description
```

**Example**: `feature/WEATHER-001-city-search`

### Step 2: Invoke Architect Agent

**Option A: Via GitHub Copilot/Claude**

```
@workspace use architect agent for PROJ-123
```

**Option B: Via Prompt**

```
@workspace use design-solution prompt
```

**What the Architect Agent does**:

1. Extracts ticket ID from branch name
2. Fetches Jira ticket via MCP (`jira_getIssue`)
3. Analyzes requirements and acceptance criteria
4. Researches codebase for patterns
5. Creates `specs/jira-tickets/PROJ-123/technical-design.md`
6. Applies Devils Advocate self-critique
7. Notifies you that design is ready

**You review**: Check `technical-design.md` for architecture decisions, tech choices, and approach.

### Step 3: Invoke Tasks Agent

**Trigger**: After reviewing technical design

**Option A: Via GitHub Copilot/Claude**

```
@workspace use tasks agent
```

**Option B: Continue with design-solution prompt**
(It automatically invokes Tasks Agent after Architect completes)

**What the Tasks Agent does**:

1. Reads `technical-design.md`
2. Fetches Jira ticket for acceptance criteria context
3. Breaks down work into atomic tasks with checklists
4. Creates `specs/jira-tickets/PROJ-123/tasks.md`
5. Applies Devils Advocate self-critique
6. Requests your approval

### Step 4: Review and Approve Implementation Plan

**Review checklist in `tasks.md`**:

- [ ] All Jira acceptance criteria covered?
- [ ] Tasks are atomic (one action per checklist item)?
- [ ] Dependencies are clear?
- [ ] Estimates seem realistic?
- [ ] Test tasks included?

**Approve or Request Changes**:

- ✅ **"Approved"** → Proceed to implementation
- 🔄 **"Revise [specific concerns]"** → Tasks Agent updates and resubmits
- ❌ **"Reject"** → Return to Architect for redesign

### Step 5: Implement Tasks (One at a Time)

**Invoke Implementation Agent**:

```
@workspace use backend agent to implement TASK-001
```

or

```
@workspace use frontend agent to implement TASK-005
```

**Implementation workflow per task**:

1. Agent requests approval before starting task
2. You approve
3. Agent executes atomic checklist items from `tasks.md`
4. Agent runs tests
5. Agent updates tasks.md checklist (marks items complete)
6. Agent commits changes
7. Repeat for next task

**Key principles**:

- One task at a time (no skipping ahead)
- Each task approval ensures control
- Checklist in `tasks.md` tracks progress
- Tests run continuously

### Step 6: Post-Implementation Review

**After ALL tasks complete**, implementation agent performs mandatory Devils Advocate review:

**Questions asked**:

- Did we deviate from technical design? Why?
- What technical debt was introduced?
- Are all Jira acceptance criteria met?
- Any security concerns?
- Any edge cases missed?

**Agent reports findings and addresses issues before PR creation.**

### Step 7: Create Pull Request

**After Devils Advocate review passes**:

```bash
git push origin feature/PROJ-123-brief-description
```

**Create PR with**:

- Title: `feat(scope): brief description` (conventional commits)
- Description: Links to Jira ticket, lists key changes
- References: `specs/jira-tickets/PROJ-123/` artifacts

**PR Review**:

- Use `review-pr` prompt: `@workspace use review-pr prompt`
- Verifies against Jira acceptance criteria
- Checks technical design compliance
- Validates code quality standards

### Step 8: Merge and Close

Once PR is approved:

1. Merge to main/master
2. Update Jira ticket status
3. Delete feature branch
4. Deploy (if applicable)

## Spec Artifacts Reference

Each Jira ticket produces these artifacts in `specs/jira-tickets/<TICKET-ID>/`:

| File                  | Created By      | Purpose                                                        |
| --------------------- | --------------- | -------------------------------------------------------------- |
| `technical-design.md` | Architect Agent | Architecture, data models, API contracts, tech decisions       |
| `tasks.md`            | Tasks Agent     | Atomic task breakdown with checklists, estimates, dependencies |
| `.archive/`           | System          | Previous versions of specs (if redesigned)                     |

**Note**: Jira ticket itself serves as the source of requirements. No separate `requirements.md` file is created.

## Available Agents

| Agent               | Use When                           | Invoke With                             |
| ------------------- | ---------------------------------- | --------------------------------------- |
| **Architect**       | Starting a new feature             | `@workspace use architect agent`        |
| **Tasks**           | Need implementation plan           | `@workspace use tasks agent`            |
| **Backend**         | Implementing Django/Python code    | `@workspace use backend agent`          |
| **Frontend**        | Implementing Angular/TypeScript UI | `@workspace use frontend agent`         |
| **QA**              | Writing E2E tests                  | `@workspace use qa agent`               |
| **Devils Advocate** | Need critical analysis             | `@workspace use devils-advocate prompt` |

## Reusable Prompts

Located in `.github/prompts/`:

- `design-solution.prompt.md` - Architect + Tasks workflow
- `devils-advocate.prompt.md` - Critical analysis
- `review-pr.prompt.md` - PR review checklist
- `generate-tests.prompt.md` - Create test suite
- `refactor-code.prompt.md` - Code improvements
- `sync-documentation.prompt.md` - Update docs
- `conventional-commit.prompt.md` - Generate commit message

## Quick Reference

**Start a new feature**:

```bash
git checkout -b feature/PROJ-123-name
@workspace use design-solution prompt
```

**Check progress**:

```bash
# View task checklist
cat specs/jira-tickets/PROJ-123/tasks.md
```

**Run tests**:

```bash
# Backend
python backend/manage.py test

# Frontend
cd frontend && npm test

# E2E (requires backend running)
cd qa && npm test
```

**Need help?**:

- Full agent guide: [AGENTS.md](AGENTS.md)
- Workflow details: [.github/instructions/spec-driven-workflow.instructions.md](.github/instructions/spec-driven-workflow.instructions.md)
- Coding standards: [.github/instructions/](.github/instructions/)

---

**Workflow Philosophy**: Plan thoroughly, implement incrementally, validate continuously.

---

**Workflow Philosophy**: Plan thoroughly, implement incrementally, validate continuously.

**For Technical Details**: See [AGENTS.md](AGENTS.md) for project setup, architecture, tech stack, and development environment.
