# Specifications Directory

This directory contains all specification artifacts for the project, organized by JIRA ticket using a spec-driven development workflow.

## Directory Structure

```
specs/
├── jira-tickets/          # JIRA ticket-specific specifications
│   ├── PROJ-123-feature-name/
│   │   ├── requirements.md
│   │   ├── technical-design.md
│   │   ├── tasks.md
│   │   └── .archive/      # Versioned history of specs
│   │       ├── requirements-v1-2026-01-15.md
│   │       └── technical-design-v1-2026-01-15.md
│   └── PROJ-456-another-feature/
│       └── ...
└── templates/             # Reusable templates
    ├── requirements.template.md
    ├── technical-design.template.md
    └── tasks.template.md
```

## Workflow

### Starting a New Feature (Automated by Agents)

**The Product and Architect agents handle setup automatically.** When you invoke them:

1. **Product Agent** (automatically executes):

   ```bash
   # Use the specified Jira ticket ID (e.g., PROJ-123)
   TICKET_ID="<specified-jira-ticket>"

   # Create directory structure
   mkdir -p specs/jira-tickets/$TICKET_ID/.archive

   # Copy requirements template
   cp specs/templates/requirements.template.md specs/jira-tickets/$TICKET_ID/requirements.md
   ```

2. **Architect Agent** (automatically executes):

   ```bash
   # Use the same Jira ticket ID (created by Product Agent)
   TICKET_ID="<specified-jira-ticket>"

   # Copy additional templates
   cp specs/templates/technical-design.template.md specs/jira-tickets/$TICKET_ID/technical-design.md
   cp specs/templates/tasks.template.md specs/jira-tickets/$TICKET_ID/tasks.md
   ```

**You don't need to run these commands manually.** Simply invoke the agents via prompts:

- `.github/prompts/analyze-requirements.prompt.md` - Invokes Product Agent
- `.github/prompts/design-solution.prompt.md` - Invokes Architect Agent

### The .archive/ Directory

**Purpose**: Maintains historical versions of specification documents for audit trail and decision tracking.

**When to Archive**:

- Before major requirement changes (scope expansion, feature pivots)
- Before significant design revisions (architecture changes)
- When stakeholders request to see evolution of decisions
- Prior to major refactoring that affects original specs

**Benefits**:

- 📜 **Audit Trail**: Track how requirements evolved over time
- 🔍 **Decision History**: Understand why certain decisions were made
- 🔄 **Rollback Reference**: Revert to previous versions if needed
- 📊 **Stakeholder Communication**: Show requirement evolution to stakeholders

**How to Archive**:

```bash
# Archive current version before making major changes
TICKET_ID="<specified-jira-ticket>"  # Use the Jira ticket ID
cp specs/jira-tickets/$TICKET_ID/requirements.md \
   specs/jira-tickets/$TICKET_ID/.archive/requirements-v1-$(date +%Y-%m-%d).md
```

**Example**: If requirements for PROJ-123 change significantly after initial approval, archive the original version so you can compare what changed and why.

## Core Artifacts

### requirements.md

- **Owner**: Product Agent
- **Purpose**: Define user stories and acceptance criteria using EARS notation
- **Approval**: Gate 1 - User must approve before design phase

### technical-design.md

- **Owner**: Architect Agent
- **Purpose**: Define technical architecture, data models, API contracts
- **Approval**: Gate 2 - User must approve before creating tasks

### tasks.md

- **Owner**: Architect Agent
- **Purpose**: Break down implementation into atomic, trackable tasks
- **Approval**: Gate 3 - User must approve before implementation begins

## Agent Guidelines

### Product Agent

- Use the specified Jira ticket ID provided by the user
- Create `specs/jira-tickets/<ticket-id>/` directory
- Use `requirements.template.md` as starting point
- Write requirements in EARS format
- Submit for Gate 1 approval

### Architect Agent

- Read approved `specs/jira-tickets/<ticket-id>/requirements.md`
- Create `technical-design.md` using template
- Submit for Gate 2 approval
- Create `tasks.md` using template
- Submit for Gate 3 approval

### Implementation Agents (Backend, Frontend, QA)

- Use the specified Jira ticket ID
- Read specs from `specs/jira-tickets/<ticket-id>/` directory
- Follow tasks defined in `tasks.md`
- Update task status as work progresses
- Ensure all requirements are tested

## Naming Conventions

### Ticket Directory Names

Format: `<JIRA-ID>-<short-description>`

Examples:

- `PROJ-123-weather-search`
- `PROJ-456-user-authentication`
- `WEATHER-789-forecast-display`

Rules:

- Use kebab-case (lowercase with hyphens)
- Must match the specified JIRA ticket ID
- Keep description under 40 characters
- Be descriptive but concise
- Recommended to align with git branch name (without `feature/` prefix), but not required

### Archive File Names

Format: `<artifact>-v<version>-<YYYY-MM-DD>.md`

Examples:

- `requirements-v1-2026-01-29.md`
- `technical-design-v2-2026-02-15.md`
- `tasks-v1-2026-01-29.md`

## Best Practices

1. **One Ticket, One Folder**: Each JIRA ticket gets its own directory
2. **Archive Before Major Changes**: Always archive before significant revisions
3. **Specify Ticket ID Clearly**: Provide the complete ticket directory name to agents (e.g., `PROJ-123-weather-search`)
4. **Version Control Everything**: All specs should be committed to git
5. **Update Atomically**: Complete one artifact before moving to the next
6. **Keep Templates Updated**: Improve templates based on lessons learned

## Git Integration

### Branch Naming (Recommended)

Branch names should follow the pattern:

```
feature/<JIRA-ID>-<brief-description>
```

Example:

```bash
git checkout -b feature/PROJ-123-weather-search
```

While agents use the specified Jira ticket ID directly, aligning branch names with ticket IDs maintains clarity and traceability.

### Commit Messages

When committing spec files:

```bash
git add specs/jira-tickets/PROJ-123-feature-name/
git commit -m "docs(specs): add requirements for PROJ-123 weather search feature"
git commit -m "docs(specs): add technical design for PROJ-123"
git commit -m "docs(specs): add implementation tasks for PROJ-123"
```

## Troubleshooting

### Specifying Ticket ID

Agents use the Jira ticket ID specified by the user:

```bash
# Specify the ticket ID when invoking agents
TICKET_ID="PROJ-123-feature-name"

# Use in paths
echo "specs/jira-tickets/$TICKET_ID/requirements.md"
```

**Best Practice**: Provide the complete ticket directory name (e.g., `PROJ-123-weather-search`) to agents when starting work.

### Archive Growing Large

If `.archive/` directories grow too large:

1. Keep only last 2-3 versions
2. Move old versions to a separate `specs/archive-old/` directory
3. Use git history as the ultimate archive

### Multiple Tickets in Progress

You can have multiple ticket directories. Specify which ticket you're working on when invoking agents:

```bash
# Working on ticket A - specify to agent
"Use Jira ticket PROJ-123-feature-a"
# Specs are in specs/jira-tickets/PROJ-123-feature-a/

# Switch to ticket B - specify to agent
"Use Jira ticket PROJ-456-feature-b"
# Specs are in specs/jira-tickets/PROJ-456-feature-b/
```

**Note**: While git branches are still useful for organizing work, agents rely on the explicitly specified ticket ID rather than deriving it from the branch name.

## Migration from Old Structure

If you have existing spec files at the root or elsewhere:

```bash
# Determine ticket ID (or choose one)
TICKET_ID="PROJ-123-legacy-feature"

# Create ticket directory
mkdir -p specs/jira-tickets/$TICKET_ID/.archive

# Move existing specs
mv requirements.md specs/jira-tickets/$TICKET_ID/
mv technical-design.md specs/jira-tickets/$TICKET_ID/
mv tasks.md specs/jira-tickets/$TICKET_ID/

# Create corresponding git branch
git checkout -b feature/$TICKET_ID
```

## References

- **Workflow Documentation**: `.github/instructions/spec-driven-workflow.instructions.md`
- **EARS Notation**: See requirements template for examples
- **Agent Instructions**: `.github/agents/` directory
