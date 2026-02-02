# Technical Design: EXAMPLE-001-demo-feature

**Feature ID**: [PROJ-XXX]  
**Created**: 2026-01-29  
**Owner**: Architect Agent  
**Status**: Draft | In Review | Approved | Archived  
**Confidence Score**: [0-100%]

---

## Design Overview

### Objective

[What this design aims to accomplish]

### Approach

[High-level technical approach chosen]

### Key Design Decisions

1. **[Decision 1]**
   - Rationale: [Why this choice]
   - Alternatives considered: [Other options]
   - Trade-offs: [Pros and cons]

2. **[Decision 2]**
   - Rationale: [Why this choice]
   - Alternatives considered: [Other options]
   - Trade-offs: [Pros and cons]

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────┐
│                                             │
│  [Component Diagram - ASCII or link to     │
│   visual diagram]                           │
│                                             │
└─────────────────────────────────────────────┘
```

### Component Descriptions

#### Component 1: [Name]

- **Purpose**: [What it does]
- **Technology**: [Tech stack]
- **Responsibilities**: [Key functions]
- **Interfaces**: [APIs, events, etc.]

#### Component 2: [Name]

- **Purpose**: [What it does]
- **Technology**: [Tech stack]
- **Responsibilities**: [Key functions]
- **Interfaces**: [APIs, events, etc.]

---

## Data Model

### Database Schema

#### Table/Collection 1: [Name]

```sql
[Schema definition or description]
```

**Fields**:

- `field1`: [Type] - [Description]
- `field2`: [Type] - [Description]

**Indexes**:

- [Index description]

**Relationships**:

- [Relationship description]

---

## API Design

### Endpoint 1: [Method] /api/path

**Purpose**: [What this endpoint does]

**Request**:

```json
{
	"field1": "value",
	"field2": 123
}
```

**Response** (Success):

```json
{
	"status": "success",
	"data": {}
}
```

**Response** (Error):

```json
{
	"status": "error",
	"message": "Error description"
}
```

**Status Codes**:

- 200: Success
- 400: Bad request
- 401: Unauthorized
- 500: Server error

---

## Security Considerations

### Authentication & Authorization

[How auth is handled]

### Data Protection

[How sensitive data is protected]

### OWASP Top 10 Mitigations

- **A01 Broken Access Control**: [Mitigation]
- **A02 Cryptographic Failures**: [Mitigation]
- **A03 Injection**: [Mitigation]

[Additional mitigations as relevant]

---

## Performance & Scalability

### Performance Targets

- Response time: [target]
- Throughput: [target]
- Resource usage: [limits]

### Scalability Strategy

[How the design scales with load]

### Caching Strategy

[What gets cached and how]

### Optimization Techniques

- [Technique 1]
- [Technique 2]

---

## Testing Strategy

### Unit Tests

[What to unit test and coverage targets]

### Integration Tests

[What to integration test]

### End-to-End Tests

[What to E2E test]

### Test Data

[Test data requirements]

---

## Deployment Strategy

### Environment Setup

[Required environment configuration]

### Migration Plan

[How to migrate from current state]

### Rollback Plan

[How to rollback if issues occur]

---

## Risks & Mitigations

### Risk 1: [Description]

- **Impact**: High | Medium | Low
- **Probability**: High | Medium | Low
- **Mitigation**: [Strategy to address]

### Risk 2: [Description]

- **Impact**: High | Medium | Low
- **Probability**: High | Medium | Low
- **Mitigation**: [Strategy to address]

---

## Open Questions

- [ ] Question 1: [What needs to be resolved]
- [ ] Question 2: [What needs to be resolved]

---

## Dependencies

### Technology Dependencies

- [Library/Framework 1]: Version [X.Y.Z]
- [Library/Framework 2]: Version [X.Y.Z]

### Service Dependencies

- [External Service 1]: [Purpose]
- [External Service 2]: [Purpose]

---

## Approval

**Submitted by**: [Agent/Person]  
**Submitted on**: [Date]  
**Reviewed by**: [User]  
**Approval Status**: Pending | Approved | Rejected  
**Approval Date**: [Date]

**Review Notes**:

[Feedback from reviewer]

**Next Steps** (if approved):

Create detailed implementation plan in tasks.md
