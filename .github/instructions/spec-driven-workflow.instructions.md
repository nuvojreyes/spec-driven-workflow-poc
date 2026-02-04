---
description: "Shared protocol and standards for specification-driven development across all agents."
applyTo: "**"
---

# Specification-Driven Workflow - Shared Protocol

**Purpose**: Define the common language, artifacts, and approval process used by all agents.

## Core Artifacts

All agents must maintain and reference these artifacts:

- **Jira Ticket**: Primary source of truth for feature requirements (accessed via Jira MCP)
- **`requirements.md`**: _(Optional)_ Created only when Product Agent adds value beyond Jira ticket (clarifications, EARS formatting, edge cases, derived test cases)
- **`technical-design.md`**: Technical architecture and implementation strategy (created by Architect Agent)
- **`tasks.md`**: Detailed implementation plan with task breakdown (created by Architect Agent)

## File Organization Strategy

To prevent file conflicts and maintain a clear history of features, all spec artifacts are organized by JIRA ticket:

```
specs/
├── jira-tickets/
│   ├── PROJ-123-feature-name/
│   │   ├── requirements.md
│   │   ├── technical-design.md
│   │   ├── tasks.md
│   │   └── .archive/
│   │       ├── requirements-v1-YYYY-MM-DD.md
│   │       └── technical-design-v1-YYYY-MM-DD.md
│   └── PROJ-456-another-feature/
│       └── ...
└── templates/
    ├── requirements.template.md
    ├── technical-design.template.md
    └── tasks.template.md
```

### Directory Structure Rules

1. **JIRA Ticket Folders** (`specs/jira-tickets/<TICKET-ID>/`)
   - One folder per JIRA ticket (feature or epic)
   - Naming convention: `<JIRA-ID>-<brief-description>` (e.g., `PROJ-123-weather-search`)
   - Contains the three core artifacts for that ticket
   - `.archive/` subfolder for versioned iterations
   - The ticket context is determined by the git branch name (e.g., `feature/PROJ-123-weather-search`)

2. **Templates** (`specs/templates/`)
   - Reusable templates for each artifact type
   - Ensures consistency across tickets
   - Version controlled

### Workflow Integration

**Automated by Agents:**

The creation of the directory structure and copying of templates is **automated by the Product and Architect agents**. Human developers do not need to run these commands manually.

**Product Agent Responsibilities:**

1. Extract ticket ID from current git branch
2. Create ticket directory structure
3. Fetch Jira ticket via MCP
4. **Evaluate** if requirements.md is needed:
   - Are there ambiguities in the Jira ticket?
   - Are edge cases missing?
   - Do acceptance criteria need EARS reformatting?
   - Should specific test cases be derived?
5. **If YES** (value to add): Create requirements.md with enhancements
6. **If NO** (Jira is sufficient): Skip requirements.md creation, proceed to approval with Jira as source

```bash
# Commands executed automatically by Product Agent:
TICKET_ID=$(git branch --show-current | sed 's/feature\///')
mkdir -p specs/jira-tickets/$TICKET_ID/.archive

# Conditional - only if requirements.md adds value:
cp specs/templates/requirements.template.md specs/jira-tickets/$TICKET_ID/requirements.md
```

**Jira MCP Integration:**
- Use Jira MCP server to fetch ticket details: `jira_getIssue` with ticket ID
- Extract: summary, description, acceptance criteria, story points, status
- Reference Jira ticket URL in all documentation

**Architect Agent Responsibilities:**

1. Verify ticket directory exists (create if missing)
2. **Read requirements from**:
   - `requirements.md` if it exists (contains enhancements)
   - Jira ticket via MCP if no `requirements.md` (Jira is source of truth)
3. Copy technical-design and tasks templates
4. Create technical-design.md
5. Create tasks.md

```bash
# Commands executed automatically by Architect Agent:
TICKET_ID=$(git branch --show-current | sed 's/feature\///')

# Check if requirements.md exists, otherwise use Jira MCP
if [ ! -f "specs/jira-tickets/$TICKET_ID/requirements.md" ]; then
  echo "No requirements.md found. Reading from Jira via MCP..."
fi

cp specs/templates/technical-design.template.md specs/jira-tickets/$TICKET_ID/technical-design.md
cp specs/templates/tasks.template.md specs/jira-tickets/$TICKET_ID/tasks.md
```

**Implementation Agent Responsibilities:**

- Read specs from `specs/jira-tickets/<TICKET-ID>/`
- Update task status in `tasks.md`
- Do NOT create new spec files

**When archiving a revision (any agent):**

```bash
# Archive current version before major revision
TICKET_ID=$(git branch --show-current | sed 's/feature\///')
cp specs/jira-tickets/$TICKET_ID/requirements.md \
   specs/jira-tickets/$TICKET_ID/.archive/requirements-v1-$(date +%Y-%m-%d).md
```

**Agent File References:**

- Agents determine the ticket ID from the current git branch name
- Agents read/write to `specs/jira-tickets/<TICKET-ID>/<artifact>.md`
- The git branch provides the context (e.g., `feature/PROJ-123-weather-search`)
- When revising, agents should archive previous version to `.archive/` before updating

## EARS Notation (Requirement Standard)

**EARS (Easy Approach to Requirements Syntax)** - Universal format for all requirements:

- **Ubiquitous**: `THE SYSTEM SHALL [expected behavior]`
- **Event-driven**: `WHEN [trigger event] THE SYSTEM SHALL [expected behavior]`
- **State-driven**: `WHILE [in specific state] THE SYSTEM SHALL [expected behavior]`
- **Unwanted behavior**: `IF [unwanted condition] THEN THE SYSTEM SHALL [required response]`
- **Optional**: `WHERE [feature is included] THE SYSTEM SHALL [expected behavior]`
- **Complex**: Combinations of the above patterns

**Example**:

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

**Requirements Quality Criteria**:

- **Testable**: Can be verified through automated or manual testing
- **Unambiguous**: Single interpretation possible
- **Necessary**: Contributes to the system's purpose
- **Feasible**: Can be implemented within constraints
- **Traceable**: Linked to user needs and design elements

## Approval Gates

Three critical approval gates exist in the workflow:

| **Gate** | **Agent**       | **Artifact**                           | **When**                             |
| -------- | --------------- | -------------------------------------- | ------------------------------------ |
| Gate 1   | Product Agent   | Jira ticket + `requirements.md` (opt.) | After requirements analysis complete |
| Gate 2   | Architect Agent | `technical-design.md`                  | After technical design complete      |
| Gate 3   | Architect Agent | `tasks.md`                             | After implementation plan complete   |

**Gate 1 Scenarios:**
- **Scenario A** (Jira sufficient): Product Agent presents Jira ticket summary and confirms no additional analysis needed
- **Scenario B** (Enhancements created): Product Agent presents `requirements.md` highlighting value added beyond Jira ticket

### Approval Request Template

**Product Agent - Scenario A (Jira sufficient):**

```markdown
## Approval Request: Requirements Analysis (Jira as Source)

I've analyzed Jira ticket [JIRA-TICKET-ID] for this feature.

**Jira Ticket**: [Link to Jira ticket]
**Summary**: [Brief summary of ticket]

**Assessment**: The Jira ticket contains sufficient detail for technical design:
- Clear acceptance criteria
- Defined user stories
- Edge cases documented
- No ambiguities identified

**No requirements.md created** - Jira ticket serves as source of truth.

**Next Steps** (if approved): Architect Agent will read directly from Jira via MCP

Please review the Jira ticket and approve to proceed to technical design.
```

**Product Agent - Scenario B (Enhancements created):**

```markdown
## Approval Request: Requirements Analysis (Enhanced)

I've analyzed Jira ticket [JIRA-TICKET-ID] and created requirements.md with enhancements.

**Jira Ticket**: [Link to Jira ticket]
**Location**: `specs/jira-tickets/[JIRA-TICKET-ID]/requirements.md`

**Value Added**:
- [Clarification 1]: [Explanation]
- [Edge case identified]: [Description]
- [EARS reformatting]: [Why it was needed]
- [Derived test cases]: [Count and rationale]

**Key Decisions**:
- [Decision 1 with rationale]

**Confidence Score**: [0-100%] - [Rationale]

**Next Steps** (if approved): Architect Agent will use both Jira + requirements.md

Please review and approve to proceed.
```

**Architect Agent Template (unchanged):**

```markdown
## Approval Request: [technical-design.md / tasks.md]

I've completed [technical-design.md / tasks.md] for ticket [JIRA-TICKET-ID].

**Location**: `specs/jira-tickets/[JIRA-TICKET-ID]/[artifact-name].md`
**Key Decisions**:

- [Decision 1 with rationale]
- [Decision 2 with rationale]

**Risks Identified**:

- [Risk 1]: [Description] - Mitigation: [Strategy]

**Confidence Score**: [0-100%] - [Rationale]

**Next Steps** (if approved): [What happens next]

**Questions for Review**: [Specific areas needing feedback]

Please review and approve to proceed.
```

### User Response Options

- ✅ **Approved** → Agent proceeds to next phase
- 🔄 **Revise** → Agent updates artifact based on feedback and resubmits
- ❌ **Reject** → Agent returns to previous phase

## Devils Advocate Protocol

### Built-in Self-Critique (Product & Architect Agents)

**Product Agent** - Before presenting requirements analysis:

**First, evaluate necessity:**
- "Does the Jira ticket already contain clear, unambiguous requirements?"
- "Are there edge cases or scenarios missing from the Jira ticket?"
- "Would EARS reformatting add clarity for technical implementation?"
- "Can specific test cases be derived that aren't obvious from acceptance criteria?"
- "Am I creating requirements.md just to copy Jira content?" (If yes, don't create it)

**If creating requirements.md, then ask:**
- "What scenarios are missing from the Jira ticket?"
- "Is this requirement ambiguous or unclear?"
- "What unusual inputs or edge cases could break this?"
- "Can we write automated tests to validate this?"
- "What are we assuming that might not be true?"
- "What happens if external dependencies fail?"

**Architect Agent** - Before presenting `technical-design.md`:

- "Why did we choose this approach over alternatives?"
- "What could go wrong with this design?"
- "Will this architecture handle 10x growth?"
- "Where are the security vulnerabilities?"
- "Are there performance bottlenecks?"
- "What edge cases did we miss in the design?"

**Architect Agent** - Before presenting `tasks.md`:

- "Are there circular dependencies?"
- "Are estimates realistic or optimistic?"
- "What tasks are missing?"
- "Which tasks are high-risk?"
- "Can these tasks be completed independently?"

### Optional Devils Advocate Invocation (Implementation Agents)

Implementation agents can invoke the **standalone Devils Advocate agent** when:

- Uncertain about technical approach
- Facing complex architectural decision
- Need validation of implementation strategy
- Want critical analysis of design choice

**How to invoke**: Present decision and request: "Act as Devils Advocate and challenge this approach"

## Agent Handoff Protocol

### Phase Transitions

1. **Product Agent → Architect Agent**
   - **Trigger**: Requirements analysis approved by user (Jira only OR Jira + requirements.md)
   - **Handoff**:
     - Product Agent notifies completion
     - Architect Agent reads `requirements.md` if exists, otherwise fetches Jira ticket via MCP

2. **Architect Agent → Implementation Agents**
   - **Trigger**: Both `technical-design.md` and `tasks.md` approved by user
   - **Handoff**:
     - Architect Agent notifies completion
     - Implementation Agents read: Jira ticket (via MCP) + `requirements.md` (if exists) + `technical-design.md` + `tasks.md`

3. **Implementation Agents → User**
   - **Trigger**: All tasks complete, tests pass, PR created
   - **Handoff**: PR submitted following `git-workflow.instructions.md`

### Confidence Score Strategy

When creating `technical-design.md`, Architect Agent assesses confidence (0-100%):

- **High (>85%)**: Proceed with full implementation plan
- **Medium (66-85%)**: Create PoC/MVP first, validate, then expand
- **Low (<66%)**: Conduct research, re-run analysis, or escalate

## Troubleshooting Protocol

When encountering errors or blockers:

1. **Re-analyze**: Revisit requirements, ask clarifying questions
2. **Re-design**: Update `technical-design.md` or `tasks.md`, request re-approval if significant
3. **Invoke Devils Advocate**: Get critique on approach (implementation agents)
4. **Escalate**: Provide context, what was tried, what's blocking

**Critical Rule**: Never proceed with unresolved errors or ambiguities.
