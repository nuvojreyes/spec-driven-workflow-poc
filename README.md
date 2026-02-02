# Weather Intelligence Platform

A full-stack weather application built with **Django 4.2+** (backend), **Angular 16** (frontend), and **Playwright** (E2E testing), following a **Specification-Driven Development (SDD)** workflow.

## Project Overview

This monorepo contains:

- **Backend**: Django REST API (Python) on port 8000
- **Frontend**: Angular single-page application on port 4200
- **QA**: Playwright end-to-end tests (TypeScript)

### Current Status

- **Feature Branch**: `feature/WEATHER-001-core`
- **Active Feature**: WEATHER-001 - Basic City Weather Search
- **Main Branch**: `master`

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- Docker and Docker Compose (optional)
- Git

### Option 1: Docker (Recommended for Quick Start)

```bash
# Clone and start all services
git clone <repository-url>
cd sdd-ai-weather
docker-compose up --build

# Access the application
# Backend: http://127.0.0.1:8000
# Frontend: http://localhost:4200
```

### Option 2: Local Development

**Terminal 1 - Backend:**

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations and start server
python backend/manage.py migrate
python backend/manage.py runserver
# Backend runs on http://127.0.0.1:8000
```

**Terminal 2 - Frontend:**

```bash
# Install dependencies and start dev server
cd frontend
npm install
npm start
# Frontend runs on http://localhost:4200
```

**Terminal 3 - QA (Optional):**

```bash
# Install dependencies and run tests
cd qa
npm install
npx playwright install
npm test
```

## Specification-Driven Development Workflow

This project follows a **Spec-Driven Development (SDD)** methodology where all features start with specifications before implementation.

### Core Workflow

```
┌──────────────────┐
│  Product Agent   │ ← Phase 0-1: GATHER & ANALYZE
│  (Requirements)  │    Creates: requirements.md (EARS notation)
└────────┬─────────┘
         ↓ [APPROVAL GATE 1]
┌──────────────────┐
│ Architect Agent  │ ← Phase 2: DESIGN
│  (Design/Tasks)  │    Creates: technical-design.md + tasks.md
└────────┬─────────┘
         ↓ [APPROVAL GATES 2 & 3]
┌──────────────────┐
│  Implementation  │ ← Phase 3-5: IMPLEMENT, VALIDATE, REFLECT
│   (Dev Agents)   │    Backend, Frontend, QA agents
└──────────────────┘
```

### Core Artifacts

Every feature maintains three key documents in `specs/jira-tickets/<TICKET-ID>/`:

1. **requirements.md** - User stories and acceptance criteria in EARS notation
2. **technical-design.md** - Architecture, data models, API contracts
3. **tasks.md** - Detailed implementation plan with atomic tasks

### EARS Notation

Requirements use **EARS (Easy Approach to Requirements Syntax)**:

- **Event-driven**: `WHEN [trigger] THE SYSTEM SHALL [behavior]`
- **State-driven**: `WHILE [state] THE SYSTEM SHALL [behavior]`
- **Unwanted**: `IF [condition] THEN THE SYSTEM SHALL [response]`

**Example:**

```markdown
REQ-001: Weather Search
WHEN a user enters a city name and clicks "Search",
THE SYSTEM SHALL retrieve and display weather data within 2 seconds.
```

## Agent Ecosystem

Specialized AI agents handle different aspects of development:

### Available Agents

Located in `.github/agents/`:

| Agent               | Role                      | Primary Responsibility                    |
| ------------------- | ------------------------- | ----------------------------------------- |
| **Product**         | Requirements Analysis     | Create requirements.md with EARS notation |
| **Architect**       | Technical Design          | Create technical-design.md and tasks.md   |
| **Backend**         | Django/Python Development | Implement backend features per tasks.md   |
| **Frontend**        | Angular Development       | Implement frontend features per tasks.md  |
| **QA**              | Testing & Quality         | Create E2E tests, validate requirements   |
| **DevOps**          | Infrastructure & CI/CD    | Docker, deployment, pipelines             |
| **Devils Advocate** | Critical Analysis         | Challenge assumptions, find flaws         |

### When to Use Which Agent

- **Starting a new feature?** → Product Agent (`.github/agents/product.agent.md`)
- **Need technical design?** → Architect Agent (`.github/agents/architect.agent.md`)
- **Implementing backend API?** → Backend Agent (`.github/agents/backend.agent.md`)
- **Building UI components?** → Frontend Agent (`.github/agents/frontend.agent.md`)
- **Writing tests?** → QA Agent (`.github/agents/qa.agent.md`)
- **Need critical review?** → Devils Advocate (`.github/agents/devils-advocate.agent.md`)
- **Deployment/Docker?** → DevOps Agent (`.github/agents/devops.agent.md`)

### How to Use Agents

**Via GitHub Copilot or Claude:**

```
@workspace use product agent to analyze WEATHER-001
@workspace use architect agent to design the solution
@workspace use backend agent to implement the API
```

**Or invoke prompts directly:**

```
@workspace use analyze-requirements prompt
@workspace use design-solution prompt
```

See `.github/prompts/` for all available prompts.

## Development Workflow

### 1. Feature Development Process

**Step 1: Requirements (Product Agent)**

```bash
# User provides Jira ticket or feature request
# Product Agent creates specs/jira-tickets/<TICKET-ID>/requirements.md
# User approves requirements ✓
```

**Step 2: Design (Architect Agent)**

```bash
# Architect Agent creates technical-design.md
# User approves design ✓
# Architect Agent creates tasks.md
# User approves implementation plan ✓
```

**Step 3: Implementation (Dev Agents)**

```bash
# Create feature branch
git checkout -b feature/WEATHER-XXX-description

# Backend Agent implements API
# Frontend Agent implements UI
# QA Agent creates tests

# Run tests continuously
python backend/manage.py test
cd frontend && npm test
cd qa && npm test
```

**Step 4: Validation & Deployment**

```bash
# All tests pass
# Code review
# Merge to main
# DevOps Agent deploys
```

### 2. Daily Development Commands

**Start development servers:**

```bash
# Backend
source .venv/bin/activate
python backend/manage.py runserver

# Frontend
cd frontend && npm start

# Full stack with Docker
docker-compose up
```

**Run tests:**

```bash
# Backend tests
python backend/manage.py test

# Frontend tests
cd frontend && npm test -- --watch=false

# E2E tests (requires backend running)
cd qa && npm test
```

**Database management:**

```bash
# Create migrations after model changes
python backend/manage.py makemigrations

# Apply migrations
python backend/manage.py migrate

# Reset database
rm backend/db.sqlite3
python backend/manage.py migrate
```

### 3. Git Workflow

**Branch naming:**

```
feature/TICKET-XXX-brief-description
bugfix/TICKET-XXX-brief-description
```

**Commit message format (Conventional Commits):**

```
type(scope): subject

Examples:
feat(backend): add weather search endpoint
fix(frontend): resolve temperature conversion bug
test(qa): add city search validation tests
docs(readme): update setup instructions
```

## Project Structure

```
sdd-ai-weather/
├── backend/              # Django REST API
│   ├── api/             # API app (models, views, serializers)
│   ├── project/         # Django project settings
│   ├── manage.py        # Django management commands
│   └── requirements.txt # Python dependencies
├── frontend/            # Angular application
│   ├── src/app/        # Angular components and services
│   ├── src/environments/ # Environment configurations
│   ├── angular.json    # Angular CLI configuration
│   └── package.json    # Node dependencies
├── qa/                 # Playwright E2E tests
│   ├── tests/          # Test files
│   ├── playwright.config.ts
│   └── package.json
├── specs/              # Feature specifications
│   └── jira-tickets/
│       └── WEATHER-XXX/
│           ├── requirements.md
│           ├── technical-design.md
│           └── tasks.md
├── .github/            # GitHub and AI agent configuration
│   ├── agents/         # Agent definitions
│   ├── prompts/        # Reusable workflow prompts
│   ├── instructions/   # Coding standards and guidelines
│   ├── copilot-instructions.md
│   └── WORKFLOW.md     # Detailed SDD workflow
├── AGENTS.md           # Complete agent ecosystem documentation
├── docker-compose.yml  # Container orchestration
└── README.md          # This file
```

## Coding Standards

### Security (CRITICAL)

This project follows **OWASP Top 10** security guidelines:

- **Never commit secrets or API keys** - Use environment variables
- **Validate all user inputs** - Prevent injection attacks
- **Use parameterized queries** - Django ORM handles this
- **Follow security instructions**: `.github/instructions/security-and-owasp.instructions.md`

### Backend (Python/Django)

- **Style Guide**: PEP 8
- **Type Hints**: Required for function parameters and return values
- **Models**: `PascalCase` (e.g., `WeatherCache`)
- **Functions**: `snake_case` (e.g., `get_weather_data`)
- See: `.github/instructions/python.instructions.md`

### Frontend (Angular/TypeScript)

- **Style Guide**: Angular Style Guide
- **Type Safety**: Strict TypeScript mode enabled
- **Components**: `PascalCase` + `Component` suffix
- **Files**: `kebab-case` (e.g., `weather-search.component.ts`)
- See: `.github/instructions/angular.instructions.md`

### QA (Playwright/TypeScript)

- **Test Structure**: Arrange-Act-Assert pattern
- **Locators**: Prefer user-facing locators (role, label, text)
- **Naming**: Descriptive test titles explaining the scenario
- See: `.github/instructions/playwright-typescript.instructions.md`

## Key Instruction Files

Located in `.github/instructions/`:

| File                                                     | Purpose                     |
| -------------------------------------------------------- | --------------------------- |
| `spec-driven-workflow.instructions.md`                   | SDD methodology             |
| `python.instructions.md`                                 | Python/Django conventions   |
| `angular.instructions.md`                                | Angular patterns            |
| `playwright-typescript.instructions.md`                  | E2E testing standards       |
| `security-and-owasp.instructions.md`                     | Security requirements       |
| `git-workflow.instructions.md`                           | Git workflow, commits, PRs  |
| `api-design.instructions.md`                             | REST API standards          |
| `ci-cd.instructions.md`                                  | CI/CD pipeline standards    |
| `containerization-docker-best-practices.instructions.md` | Docker guidelines           |

## Reusable Prompts

Quick-start prompts in `.github/prompts/`:

| Prompt                           | Purpose                       |
| -------------------------------- | ----------------------------- |
| `analyze-requirements.prompt.md` | Start requirements analysis   |
| `design-solution.prompt.md`      | Create technical design       |
| `devils-advocate.prompt.md`      | Get critical analysis         |
| `review-pr.prompt.md`            | Review pull request           |
| `generate-tests.prompt.md`       | Create test suite             |
| `refactor-code.prompt.md`        | Improve code quality          |
| `sync-documentation.prompt.md`   | Update all documentation      |
| `conventional-commit.prompt.md`  | Generate commit message       |

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
python manage.py test

# Run with verbosity
python manage.py test --verbosity=2

# Run specific app
python manage.py test api
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests in headless mode
npm test -- --watch=false

# Run with coverage
npm test -- --code-coverage
```

### E2E Tests (Playwright)

**Prerequisites:** Backend must be running on `http://127.0.0.1:8000`

```bash
cd qa

# Run all tests
npm test

# Run in headed mode
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

## Build and Deployment

### Frontend Production Build

```bash
cd frontend
npm run build
# Output: dist/
```

### Backend Production Setup

```bash
# Collect static files
python backend/manage.py collectstatic --noinput

# Check deployment readiness
python backend/manage.py check --deploy
```

### Docker Build

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

## Troubleshooting

### Common Issues

**"No module named django"**

```bash
source .venv/bin/activate  # Activate virtual environment
```

**"ng: command not found"**

```bash
npx @angular/cli@16 serve  # Use npx instead
```

**"Target page closed" (Playwright)**

```bash
# Ensure backend is running
python backend/manage.py runserver
```

**Port already in use**

```bash
# Backend: Use different port
python backend/manage.py runserver 8001

# Frontend: Use different port
ng serve --port 4201
```

### Logging

- **Backend**: Django logs to console, check `backend/project/settings.py`
- **Frontend**: Check browser DevTools console
- **QA**: Check `qa/test-results/` directory for artifacts

## Additional Resources

- **Complete Agent Guide**: [AGENTS.md](AGENTS.md)
- **SDD Workflow Details**: [.github/WORKFLOW.md](.github/WORKFLOW.md)
- **Current Feature Spec**: [specs/jira-tickets/WEATHER-001-basic-city-weather-search/requirements.md](specs/jira-tickets/WEATHER-001-basic-city-weather-search/requirements.md)

## Port Reference

- Backend API: `http://127.0.0.1:8000`
- Backend Admin: `http://127.0.0.1:8000/admin`
- Frontend: `http://localhost:4200`
- API Endpoint: `http://127.0.0.1:8000/api/`

## Tech Stack

- **Backend**: Django 4.2+, Python 3.8+, SQLite (dev), PostgreSQL (prod)
- **Frontend**: Angular 16, TypeScript 5.1, RxJS 7.8
- **QA**: Playwright 1.38, TypeScript
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (planned)
- **Deployment**: AWS Fargate (production)

---

**Last Updated**: February 2026
**Project Type**: Full-stack monorepo (Django + Angular + Playwright)
**Methodology**: Specification-Driven Development (SDD)
