---
description: "Shared protocol and standards for specification-driven development across all agents."
applyTo: "**"
---

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

### Directory Structure Rules

1. **JIRA Ticket Folders** (`specs/jira-tickets/<TICKET-ID>/`)
   - One folder per JIRA ticket (feature or epic)
   - Naming convention: `<JIRA-ID>-<brief-description>` (e.g., `PROJ-123-weather-search`)
   - Contains technical-design.md and tasks.md
   - `.archive/` subfolder for versioned iterations
   - The ticket context is determined by the git branch name (e.g., `feature/PROJ-123-weather-search`)

2. **Templates** (`specs/templates/`)
   - Reusable templates for each artifact type
   - Ensures consistency across tickets
   - Version controlled

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

## EARS Notation (Requirement Standard)

**EARS (Easy Approach to Requirements Syntax)** - Universal format for all requirements:

- **Ubiquitous**: `THE SYSTEM SHALL [expected behavior]`
- **Event-driven**: `WHEN [trigger event] THE SYSTEM SHALL [expected behavior]`
- **State-driven**: `WHILE [in specific state] THE SYSTEM SHALL [expected behavior]`
- **Unwanted behavior**: `IF [unwanted condition] THEN THE SYSTEM SHALL [required response]`
- **Optional**: `WHERE [feature is included] THE SYSTEM SHALL [expected behavior]`
- **Complex**: Combinations of the above patterns

## Approval Request Template

**Tasks Agent (Single Gate):**

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

### User Response Options

- ✅ **Approved** → Implementation agents proceed
- 🔄 **Revise** → Tasks Agent updates and resubmits
- ❌ **Reject** → Return to Architect Agent

## Confidence Score Strategy

When creating `technical-design.md`, Architect Agent assesses confidence (0-100%):

- **High (>85%)**: Proceed with full implementation plan
- **Medium (66-85%)**: Create PoC/MVP first, validate, then expand
- **Low (<66%)**: Conduct research, re-run analysis, or escalate

## Troubleshooting Protocol

When encountering errors or blockers:

1. **Re-analyze**: Revisit requirements, ask clarifying questions
2. **Re-design**: Update `technical-design.md` or `tasks.md`, request re-approval if significant
3. **Invoke Devils Advocate**: Get critique on approach
4. **Escalate**: Provide context, what was tried, what's blocking

**Critical Rule**: Never proceed with unresolved errors or ambiguities.
