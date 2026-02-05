---
description: "Invoke Architect Agent to create technical design from Jira ticket"
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

This prompt invokes the **Architect Agent** to create a comprehensive technical design from a Jira ticket.

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
[Hand off to Tasks Agent]
```

**Note**: This prompt only creates the technical design. Use the `create-tasks` prompt to generate the implementation plan (`tasks.md`).

## Phase 1: Architect Agent - Technical Design

The **Architect Agent** creates the technical architecture from the Jira ticket.

### Your Mission (Architect Agent)

Create **`technical-design.md`** with architecture, tech stack, data models, and API contracts.

**Note**: You do NOT create tasks.md. After completing technical-design.md, notify that Tasks Agent can create the implementation plan.

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

   **Next Steps**:

   - Review the technical design
   - Use `create-tasks` prompt to generate implementation plan (tasks.md)
   ```

## Output Artifact

After completing this prompt, you will have created:

### technical-design.md

**Location**: `specs/jira-tickets/<TICKET-ID>/technical-design.md`  
**Template**: `specs/templates/technical-design.template.md`

**Key Sections**:

- Overview and system context
- Technology stack with rationale
- Architecture design with Mermaid diagrams
- Data models and database schema
- API contracts (request/response formats)
- Component design (frontend/backend)
- Security considerations (OWASP compliance)
- Performance and scalability design
- Testing strategy
- Deployment and monitoring
- Technical risks and mitigation
- Architecture Decision Records (ADRs)
- Dependencies and open questions

## Next Steps

After completing the technical design:

1. **Review** the technical-design.md document
2. **Use the `create-tasks` prompt** to generate the implementation plan (tasks.md)
3. **Approve** the implementation plan before starting development

## Best Practices

- **Be Explicit**: Include exact architectural decisions with rationale
- **Be Visual**: Use Mermaid diagrams for architecture and data flows
- **Be Thorough**: Address security, performance, scalability from the start
- **Be Critical**: Apply Devils Advocate rigorously to find flaws early
- **Document Decisions**: Use ADRs for all significant architectural choices

## Reference

- See `.github/instructions/spec-driven-workflow.instructions.md` for complete methodology
- See `.github/agents/architect.agent.md` for Architect Agent details
- See `specs/templates/technical-design.template.md` for the full template
