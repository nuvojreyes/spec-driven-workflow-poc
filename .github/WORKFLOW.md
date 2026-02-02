# Simplified Spec-Driven Development Workflow

**Last Updated**: 2026-01-29

This document describes the simplified specification-driven development workflow for the sdd-ai-weather project.

## Core Principles

1. **Requirements First**: All work starts with clear, testable requirements
2. **Documentation as Code**: Specs are versioned and reviewed like code
3. **Approval Gates**: Each phase requires approval before proceeding
4. **Self-Critique**: Built-in Devils Advocate validation at each step
5. **Simplicity**: Minimal documentation overhead, maximum clarity

## Workflow Overview

```
Jira/Confluence/Stakeholder
         ↓
  ┌──────────────────┐
  │  Product Agent   │ ← Phase 0: GATHER & Phase 1: ANALYZE
  └────────┬─────────┘
           ↓
    requirements.md
    (EARS notation)
           ↓
      [APPROVAL ✓]
           ↓
  ┌──────────────────┐
  │ Architect Agent  │ ← Phase 2: DESIGN
  └────────┬─────────┘
           ↓
    technical-design.md
    (architecture + strategy)
           ↓
      [APPROVAL ✓]
           ↓
       tasks.md
    (implementation plan)
           ↓
      [APPROVAL ✓]
           ↓
  ┌──────────────────────────────┐
  │   Implementation Agents      │ ← Phase 3-5: IMPLEMENT, VALIDATE, REFLECT
  │  Backend, Frontend, QA       │
  └──────────────────────────────┘
           ↓
      Production
```

## Core Artifacts

### 1. requirements.md (Product Agent)

**Owner**: Product Agent
**Audience**: Engineering team, QA
**Format**: EARS notation (structured, testable)
**Purpose**: Define WHAT to build

**Content**:

- User stories in EARS format
- Acceptance criteria
- Edge cases and error scenarios
- Non-functional requirements
- Data requirements
- Integration requirements

**Example**:

```
REQ-001: Weather Search
WHEN a user enters a city name and clicks "Search",
THE SYSTEM SHALL retrieve and display weather data within 2 seconds.

Acceptance Criteria:
- [ ] City name validated before API call
- [ ] Loading indicator shown during fetch
- [ ] Results display temperature, conditions, humidity
- [ ] Error message shown if city not found
```

### 2. technical-design.md (Architect Agent)

**Owner**: Architect Agent
**Audience**: Engineering team (Section 1 also for stakeholders)
**Format**: Structured markdown with Mermaid diagrams
**Purpose**: Define HOW to build

**Content**:

- **Section 1**: Overview & Strategy (human-readable, for stakeholders)
- Architecture diagrams
- Data models and database schemas
- API contracts and interfaces
- Security and performance design
- Integration specifications
- Error handling strategy
- Architecture Decision Records (ADRs)

**Key Feature**: Section 1 is written in plain language for non-technical stakeholders to understand the approach and strategy.

### 3. tasks.md (Architect Agent)

**Owner**: Architect Agent
**Audience**: Development team, project managers
**Format**: Structured task breakdown
**Purpose**: Define implementation plan (WHAT to do, WHEN, and in WHAT order)

**Content**:

- Phase-by-phase breakdown
- Individual tasks with IDs
- Dependencies and execution order
- Effort estimates
- Acceptance criteria per task
- Files to create/modify
- Testing approach

**Example**:

```
#### Task 1.1: Create Django Models
**ID**: TASK-001
**Priority**: High
**Estimated Effort**: 4 hours
**Dependencies**: None

**Acceptance Criteria**:
- [ ] WeatherCache model created with all fields
- [ ] Indexes created on city and cached_at
- [ ] Model passes all validation tests
```

## Agent Roles

### Product Agent

**Phase**: 0 (GATHER) + 1 (ANALYZE)
**Input**: Jira tickets, Confluence docs, GitHub issues, conversations
**Output**: requirements.md
**Built-in Validation**: Devils Advocate self-critique
**Approval Gate**: Yes - must get approval before handing to Architect

**Responsibilities**:

1. Fetch requirements from multiple sources
2. Ask clarifying questions
3. Create draft requirements.md in EARS notation
4. Self-critique (Devils Advocate): challenge completeness, clarity, testability
5. Refine requirements.md
6. Request approval

### Architect Agent

**Phase**: 2 (DESIGN)
**Input**: requirements.md
**Output**: technical-design.md + tasks.md
**Built-in Validation**: Devils Advocate self-critique
**Approval Gates**: Yes - two gates (after technical-design.md, after tasks.md)

**Responsibilities**:

1. Analyze requirements.md
2. Create draft technical-design.md
3. Self-critique design: challenge architecture, find risks, validate scalability
4. Refine technical-design.md
5. **Request approval** ← WAIT
6. Create draft tasks.md
7. Self-critique tasks: validate dependencies, estimates, completeness
8. Refine tasks.md
9. **Request approval** ← WAIT

### Implementation Agents (Backend, Frontend, QA)

**Phase**: 3 (IMPLEMENT), 4 (VALIDATE), 5 (REFLECT)
**Input**: requirements.md + technical-design.md + tasks.md
**Output**: Working, tested code
**Optional Validation**: Can invoke Devils Advocate agent if needed

**Responsibilities**:

- Implement features according to specs
- Write tests based on acceptance criteria
- Validate against requirements
- Document code and decisions

### DevOps Agent

**Phase**: Deployment & Monitoring
**Input**: Completed, tested features
**Output**: Production deployment, monitoring, infrastructure
**Optional Validation**: Can invoke Devils Advocate agent if needed

**Responsibilities**:

- Deploy to AWS infrastructure
- Set up monitoring and alerts
- Manage infrastructure as code
- Ensure security and compliance

### Devils Advocate Agent (Standalone)

**Phase**: Any (on-demand)
**Input**: Any idea, proposal, or decision
**Output**: Critical questions, risks, edge cases
**Usage**: Invoked by development agents when deep critique is needed

**Responsibilities**:

- Challenge assumptions
- Find flaws and edge cases
- Identify risks
- Provide counterarguments
- Stress-test ideas

**Note**: Product and Architect agents have built-in Devils Advocate validation. This standalone agent is for when development agents (Backend, Frontend, QA, DevOps) need explicit critique.

## Active Agents

✅ **product.agent.md** - Requirements analyst (Jira/Confluence → requirements.md)
✅ **architect.agent.md** - Software architect (requirements.md → technical-design.md + tasks.md)
✅ **backend.agent.md** - Python/Django developer
✅ **frontend.agent.md** - Angular/TypeScript developer
✅ **qa.agent.md** - Playwright E2E testing
✅ **devops.agent.md** - AWS/Docker/GitHub Actions
✅ **devils-advocate.agent.md** - Standalone critique (on-demand)

## Removed Agents

❌ **prd.agent.md** - Merged into product.agent.md (can still create prd.md if needed)
❌ **api-architect.agent.md** - Merged into architect.agent.md
❌ **react.agent.md** - Not needed (Angular only)

## Workflow Steps (Detailed)

### Step 1: Gather Requirements

**Agent**: Product Agent
**Trigger**: New Jira ticket, feature request, or stakeholder conversation
**Actions**:

1. Fetch Jira ticket via Atlassian MCP
2. Read related Confluence documentation
3. Check GitHub issues if relevant
4. Analyze existing codebase for constraints
5. Identify gaps in requirements
6. Ask clarifying questions to user
7. Wait for answers

**Output**: Clear understanding of requirements

### Step 2: Create Requirements Document

**Agent**: Product Agent
**Actions**:

1. Create draft requirements.md in EARS notation
2. Include all functional and non-functional requirements
3. Document edge cases and error scenarios
4. Self-critique (Devils Advocate):
   - "What scenarios are missing?"
   - "Is this requirement ambiguous?"
   - "What edge cases could break this?"
   - "Can we write tests for this?"
5. Refine requirements.md based on critique
6. Assess confidence score (0-100%)
7. Present requirements.md to user

**Approval Gate**: Wait for user approval
**Output**: requirements.md (approved)

### Step 3: Create Technical Design

**Agent**: Architect Agent
**Actions**:

1. Read and analyze requirements.md
2. Analyze current codebase architecture
3. Create draft technical-design.md:
   - Section 1: Overview & Strategy (human-readable)
   - Technical architecture with diagrams
   - Data models and schemas
   - API contracts
   - Security and performance design
4. Self-critique (Devils Advocate):
   - "Why this approach over alternatives?"
   - "What could go wrong?"
   - "Will this scale?"
   - "Where are security gaps?"
5. Refine technical-design.md
6. Present technical-design.md to user

**Approval Gate**: Wait for user approval
**Output**: technical-design.md (approved)

### Step 4: Create Implementation Plan

**Agent**: Architect Agent
**Actions**:

1. Break down technical-design.md into tasks
2. Create draft tasks.md with:
   - Task IDs and descriptions
   - Dependencies and order
   - Effort estimates
   - Acceptance criteria per task
3. Self-critique (Devils Advocate):
   - "Are there circular dependencies?"
   - "Are estimates realistic?"
   - "What tasks are missing?"
   - "Which tasks are high-risk?"
4. Refine tasks.md
5. Present tasks.md to user

**Approval Gate**: Wait for user approval
**Output**: tasks.md (approved)

### Step 5: Implementation

**Agents**: Backend, Frontend, QA
**Actions**:

1. Read requirements.md, technical-design.md, tasks.md
2. Implement features according to specs
3. Write tests based on acceptance criteria
4. Validate against requirements
5. Document code and decisions
6. **Optional**: Invoke Devils Advocate agent for critique

**Output**: Working, tested code

### Step 6: Deployment

**Agent**: DevOps
**Actions**:

1. Review deployment requirements from technical-design.md
2. Deploy to AWS infrastructure
3. Set up monitoring and alerts
4. Run smoke tests
5. Validate production deployment

**Output**: Feature in production

## Built-in Devils Advocate Validation

### Product Agent Self-Critique Questions

- "What scenarios are missing from requirements?"
- "Is this requirement ambiguous or unclear?"
- "What unusual inputs or edge cases could break this?"
- "Can we write automated tests to validate this?"
- "What are we assuming that might not be true?"
- "What happens if external dependencies fail?"

### Architect Agent Self-Critique Questions

- "Why did we choose this approach over alternatives?"
- "What could go wrong with this design?"
- "Will this architecture handle 10x growth?"
- "Where are the security vulnerabilities?"
- "Are there performance bottlenecks?"
- "What edge cases did we miss in the design?"
- "Are task dependencies correct and realistic?"
- "Are effort estimates based on evidence or guesses?"

## File Naming Conventions

### Spec Files (Versioned in Git)

- `requirements.md` - EARS-formatted requirements
- `technical-design.md` - Architecture and strategy
- `tasks.md` - Implementation breakdown

### Optional Files

- `prd.md` - Business-focused product requirements (for stakeholders)
- `CHANGELOG.md` - Track changes to requirements or design

### Location

Typically stored in project root or in a `docs/` directory:

```
project-root/
├── requirements.md
├── technical-design.md
├── tasks.md
└── docs/
    └── prd.md (optional)
```

## Best Practices

### For Product Agent

✅ Always ask clarifying questions before creating requirements
✅ Use EARS notation consistently
✅ Include edge cases and error scenarios
✅ Make every requirement testable
✅ Link back to source (Jira, Confluence)
✅ Self-critique before presenting

### For Architect Agent

✅ Make Section 1 of technical-design.md accessible to non-developers
✅ Use Mermaid diagrams for visual clarity
✅ Document all architectural decisions with rationale (ADRs)
✅ Consider security and performance from the start
✅ Break tasks into 4-8 hour chunks
✅ Self-critique both design and tasks

### For Implementation Agents

✅ Read all three spec files before starting
✅ Follow the technical design precisely
✅ Write tests that validate acceptance criteria
✅ Invoke Devils Advocate agent when uncertain
✅ Document deviations from design with rationale

## Approval Gate Protocol

### When to Request Approval

- After requirements.md is complete (Product Agent)
- After technical-design.md is complete (Architect Agent)
- After tasks.md is complete (Architect Agent)

### How to Request Approval

```markdown
## Approval Request

I've completed [requirements.md / technical-design.md / tasks.md].

**Summary**: [Brief description of what was created]

**Key Decisions**:

- Decision 1
- Decision 2

**Risks Identified**:

- Risk 1: [mitigation]
- Risk 2: [mitigation]

**Next Steps** (if approved):
[What happens after approval]

Please review and approve to proceed.
```

### User Response Options

- ✅ **Approved** - Proceed to next phase
- 🔄 **Revise** - Make changes and resubmit
- ❌ **Reject** - Go back to previous phase

## Common Workflow Scenarios

### Scenario 1: New Feature from Jira

```
1. User: "Create spec for PROJ-456 (Weather Forecast)"
2. Product Agent fetches PROJ-456 from Jira
3. Product Agent asks 3 clarifying questions
4. User answers questions
5. Product Agent creates requirements.md with self-critique
6. User approves requirements.md ✓
7. Architect Agent creates technical-design.md with self-critique
8. User approves technical-design.md ✓
9. Architect Agent creates tasks.md with self-critique
10. User approves tasks.md ✓
11. Backend/Frontend agents implement
```

### Scenario 2: Unclear Requirements

```
1. Product Agent reads vague Jira ticket
2. Product Agent identifies 8 missing details
3. Product Agent asks clarifying questions
4. User provides partial answers
5. Product Agent asks follow-up questions
6. User provides complete answers
7. Product Agent creates requirements.md
8. Workflow continues normally
```

### Scenario 3: Design Concerns

```
1. Architect Agent creates draft technical-design.md
2. Self-critique identifies scalability risk
3. Architect Agent refines design with mitigation
4. User reviews and has additional concerns
5. User requests revision
6. Architect Agent updates design
7. User approves ✓
8. Workflow continues
```

## Success Metrics

- **Requirements Quality**: All requirements testable and unambiguous
- **Design Quality**: All architectural decisions documented with rationale
- **Implementation Success**: Code matches specs, all tests pass
- **Approval Efficiency**: Minimal revisions needed at approval gates
- **Team Alignment**: All team members understand requirements and design

## Integration with Tools

### Jira/Confluence (Atlassian MCP)

- Product Agent reads tickets and docs
- Can update Confluence with requirements.md
- Can link back to Jira tickets

### GitHub

- All spec files versioned in Git
- PRs reference requirements and tasks
- Issues link to spec documents

### AWS

- DevOps Agent deploys based on technical-design.md
- Infrastructure matches architectural decisions

## Troubleshooting

### Problem: Requirements keep getting rejected

**Solution**: Spend more time on clarifying questions before creating requirements.md

### Problem: Design is too complex

**Solution**: Break feature into smaller pieces, create separate requirements.md files

### Problem: Tasks take longer than estimated

**Solution**: Review estimates in retrospective, adjust future estimates

### Problem: Specs and code diverge

**Solution**: Update specs when making necessary changes, document reasons

## References

- Spec-Driven Workflow: `.github/instructions/spec-driven-workflow.instructions.md`
- EARS Notation: See spec-driven-workflow.instructions.md
- OWASP Security: `.github/instructions/security-and-owasp.instructions.md`
- Project Structure: `AGENTS.md`

---

**Remember**: Clear requirements → Good design → Successful implementation
