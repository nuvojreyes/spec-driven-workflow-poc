# AI Agent Instructions

> **📚 This file has been superseded by [AGENTS.md](../AGENTS.md)**

For comprehensive, up-to-date instructions for AI coding agents, please refer to [AGENTS.md](../AGENTS.md) in the repository root.

AGENTS.md follows the [agents.md standard](https://agents.md/) and provides complete documentation for working on this project, including:

- Project overview and architecture
- **Spec-driven development workflow** (requirements → design → implementation)
- **Agent ecosystem** (Product, Architect, Backend, Frontend, QA, DevOps, Devils Advocate)
- **Reusable prompts** for common workflows
- Setup and development commands
- Testing strategies
- Coding standards and security guidelines
- Git workflow and PR requirements

## Quick Links

- **[AGENTS.md](../AGENTS.md)** - Complete agent instructions
- **[Spec-Driven Workflow](instructions/spec-driven-workflow.instructions.md)** - Development methodology
- **[Coding Standards](instructions/)** - Language-specific guidelines
- **[Agents](agents/)** - Specialized agent configurations
- **[Prompts](prompts/)** - Reusable workflow prompts

## Quick Start

```bash
# Full stack with Docker
docker-compose up --build

# Backend (local)
source .venv/bin/activate && python backend/manage.py runserver

# Frontend
cd frontend && npm start

# QA tests (backend must be running)
cd qa && npm test
```

For detailed instructions, workflows, and best practices, see [AGENTS.md](../AGENTS.md).
