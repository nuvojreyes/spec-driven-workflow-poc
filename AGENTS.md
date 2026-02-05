# AGENTS.md

## Project Overview

This is a **monorepo** containing a full-stack web application with three main components:

- **Backend**: Django 4.2+ REST API (Python)
- **Frontend**: Angular 16 single-page application (TypeScript)
- **QA**: Playwright end-to-end tests (TypeScript)

### Architecture

- Backend exposes a REST API at `/api/` on port 8000
- Frontend consumes the backend API and runs on port 4200
- QA tests run against the backend API (requires backend to be running)
- All components can run locally or via Docker Compose

### Tech Stack

- **Backend**: Django 4.2+, Python 3.x, SQLite (development)
- **Frontend**: Angular 16, TypeScript 5.1, RxJS 7.8
- **QA**: Playwright 1.38, TypeScript
- **Containerization**: Docker, Docker Compose
- **Development OS**: macOS/Linux (primary), Windows (via Docker)

## Monorepo Navigation

This is a monorepo with three distinct projects. Navigate between them:

```bash
# Backend
cd backend

# Frontend
cd frontend

# QA
cd qa
```

Each subdirectory has its own README.md with component-specific details.

## Development Methodology

This project follows a **Specification-Driven Development Workflow**. Before implementing any feature:

1. **Understand the workflow** - Read `.github/instructions/spec-driven-workflow.instructions.md`
2. **Follow the process** - Jira Ticket → Design → Implementation → Validation
3. **Use the artifacts** - Jira Ticket (via MCP), `technical-design.md`, `tasks.md`

### Spec-Driven Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  DESIGN (Architect Agent)                                   │
│  Fetch Jira ticket → Create technical-design.md             │
│  MANDATORY: Devils Advocate self-critique                   │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  PLAN (Tasks Agent)                                         │
│  Read technical-design.md → Create tasks.md                 │
│  MANDATORY: Devils Advocate self-critique                   │
│  Gate: User approves implementation plan                    │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  IMPLEMENT (Backend/Frontend Agents)                        │
│  Execute tasks one at a time from tasks.md                  │
│  Update tasks.md checklist after each completion            │
│  MANDATORY: Devils Advocate review after ALL tasks          │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  VALIDATE & DEPLOY                                          │
│  All tests pass, PR review, deployment                      │
└─────────────────────────────────────────────────────────────┘
```

### Core Artifacts

All feature development maintains these files in the `specs/` directory:

- **Jira Ticket**: Primary source of truth for feature requirements (accessed via Jira MCP)
- **`technical-design.md`**: Technical architecture and implementation strategy (created by Architect Agent)
- **`tasks.md`**: Detailed implementation plan with atomic task breakdown (created by Tasks Agent)

**File Organization**: Each JIRA ticket has its own directory under `specs/jira-tickets/<TICKET-ID>/`. The ticket context is determined by the git branch name (e.g., `feature/PROJ-123-weather-search`). See `specs/README.md` for details.

### EARS Notation

Requirements use EARS (Easy Approach to Requirements Syntax):

- **Ubiquitous**: `THE SYSTEM SHALL [expected behavior]`
- **Event-driven**: `WHEN [trigger] THE SYSTEM SHALL [behavior]`
- **State-driven**: `WHILE [state] THE SYSTEM SHALL [behavior]`
- **Unwanted**: `IF [unwanted condition] THEN THE SYSTEM SHALL [response]`
- **Optional**: `WHERE [feature included] THE SYSTEM SHALL [behavior]`

Example:

```markdown
REQ-001: Weather Search
WHEN a user enters a city name and clicks "Search",
THE SYSTEM SHALL retrieve and display weather data within 2 seconds.
```

## Agent Ecosystem

Specialized agents handle different aspects of development:

### Available Agents

Located in `.github/agents/`:

| Agent               | Role                           | Primary Responsibility                       |
| ------------------- | ------------------------------ | -------------------------------------------- |
| **Architect**       | Technical Design               | Create `technical-design.md`                 |
| **Tasks**           | Implementation Planning        | Create `tasks.md` with atomic task breakdown |
| **Backend**         | Django/Python Development      | Implement backend features per `tasks.md`    |
| **Frontend**        | Angular/TypeScript Development | Implement frontend features per `tasks.md`   |
| **QA**              | Testing & Quality              | Create E2E tests, validate requirements      |
| **DevOps**          | Infrastructure & CI/CD         | Docker, deployment, pipelines                |
| **Devils Advocate** | Critical Analysis              | Challenge assumptions, find flaws            |

### When to Use Which Agent

- **Starting a new feature?** → Architect Agent (`architect.agent.md`) - fetches Jira ticket and creates technical design
- **Need implementation plan?** → Tasks Agent (`tasks.agent.md`) - creates atomic task breakdown
- **Implementing backend API?** → Backend Agent (`backend.agent.md`)
- **Building UI components?** → Frontend Agent (`frontend.agent.md`)
- **Writing tests?** → QA Agent (`qa.agent.md`)
- **Need critical review?** → Devils Advocate (`devils-advocate.agent.md`)
- **Deployment/Docker issues?** → DevOps Agent (`devops.agent.md`)

## Reusable Prompts

Quick-start prompts in `.github/prompts/`:

| Prompt                          | Purpose                            | Invokes                  |
| ------------------------------- | ---------------------------------- | ------------------------ |
| `design-solution.prompt.md`     | Create technical design & tasks    | Architect Agent workflow |
| `devils-advocate.prompt.md`     | Get critical analysis              | Devils Advocate agent    |
| `review-pr.prompt.md`           | Review pull request                | PR review checklist      |
| `generate-tests.prompt.md`      | Create test suite from Jira ticket | Test generation          |
| `refactor-code.prompt.md`       | Improve code quality               | Refactoring patterns     |
| `sync-documentation.prompt.md`  | Update all documentation           | Doc synchronization      |
| `conventional-commit.prompt.md` | Generate commit message            | Git workflow             |

### How to Use Prompts

1. **Invoke via chat**: "@workspace use design-solution prompt"
2. **Follow the workflow**: Prompts guide you through each phase
3. **Submit for approval**: Single approval gate after tasks.md

## Setup Commands

### First-Time Setup

**Full stack with Docker (recommended for quick start):**

```bash
# From repository root
docker-compose up --build
```

**Backend setup (local development):**

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py migrate

# Start development server
python backend/manage.py runserver
```

**Frontend setup:**

```bash
cd frontend
npm install

# If Angular CLI is not installed globally
npx @angular/cli@16 serve

# OR if Angular CLI is installed
npm start
```

**QA setup:**

```bash
cd qa
npm install
npx playwright install
```

## Development Workflow

### Starting Development Servers

**Backend (Django):**

```bash
# From repository root, with venv activated
python backend/manage.py runserver
# Serves on http://127.0.0.1:8000
# API available at http://127.0.0.1:8000/api/
```

**Frontend (Angular):**

```bash
cd frontend
npm start
# Serves on http://localhost:4200
# Auto-reloads on file changes
```

**Full stack with Docker:**

```bash
# From repository root
docker-compose up

# Rebuild containers after dependency changes
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

### Hot Reload / Watch Mode

- **Backend**: Django's runserver automatically reloads on Python file changes
- **Frontend**: Angular CLI dev server (`npm start`) auto-reloads on TypeScript/HTML/CSS changes
- **Docker**: Volumes are mounted, so changes sync automatically

### Environment Variables

Currently using defaults for development. For production or custom configurations:

- **Backend**: Edit `backend/project/settings.py` or use environment variables
- **Frontend**: Edit `frontend/src/environments/environment.ts`
- **Docker**: Set in `docker-compose.yml` under `environment` key

### Database Management

**Migrations:**

```bash
# Create migrations after model changes
python backend/manage.py makemigrations

# Apply migrations
python backend/manage.py migrate

# View migration status
python backend/manage.py showmigrations
```

**Database location:**

- SQLite database: `backend/db.sqlite3`
- Created automatically on first migration

**Reset database:**

```bash
rm backend/db.sqlite3
python backend/manage.py migrate
```

## Testing Instructions

### Backend Tests

```bash
# From repository root with venv activated
cd backend

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test api

# Run with verbosity
python manage.py test --verbosity=2

# Run with coverage (if installed)
coverage run --source='.' manage.py test
coverage report
```

**Test file locations:**

- Tests should be in `backend/api/tests.py` or `backend/api/tests/` directory
- Follow Django testing conventions (TestCase classes)

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests in headless mode
npm test -- --watch=false

# Run with coverage
npm test -- --code-coverage

# Lint code
npm run lint
```

**Test file locations:**

- Unit tests: `frontend/src/app/**/*.spec.ts`
- Follow Angular testing patterns with TestBed

### End-to-End Tests (Playwright)

**Prerequisites:** Backend must be running at `http://127.0.0.1:8000`

```bash
cd qa

# Run all tests
npm test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/example.spec.ts

# Run tests matching pattern
npx playwright test -g "API endpoint"

# Debug mode with Playwright Inspector
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

**Test file locations:**

- E2E tests: `qa/tests/*.spec.ts`
- Configuration: `qa/playwright.config.ts`
- Base URL: `http://127.0.0.1:8000`

**Common test workflow:**

```bash
# Terminal 1: Start backend
python backend/manage.py runserver

# Terminal 2: Run tests
cd qa && npm test
```

### Docker-based Testing

```bash
# Run QA tests in Docker
docker-compose run --rm qa

# Run specific test
docker-compose run --rm qa npx playwright test tests/example.spec.ts
```

## Code Style Guidelines

### Backend (Python/Django)

- **Style Guide**: PEP 8
- **Formatter**: black (recommended, not enforced)
- **Type Hints**: Use type hints for function parameters and return values
- **Imports**: Use absolute imports from project root
- **Models**: Define in `backend/api/models.py`
- **Views**: Define in `backend/api/views.py`
- **URLs**: Define in `backend/api/urls.py`, include in `backend/project/urls.py`

**Naming conventions:**

- Models: `PascalCase` (e.g., `Book`, `Author`)
- Functions/methods: `snake_case` (e.g., `get_user_data`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_VERSION`)

**Security (CRITICAL):**

This project follows **OWASP Top 10** security guidelines:

- **A01 Broken Access Control**: Enforce least privilege, deny by default
- **A02 Cryptographic Failures**: Never hardcode secrets, use environment variables
- **A03 Injection**: Use parameterized queries (ORM), validate all inputs
- **A05 Security Misconfiguration**: No debug mode in production
- **A07 Auth Failures**: Secure session management
- **A10 SSRF**: Validate all URLs from user input

**Required practices:**

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Use parameterized queries (ORM handles this)
- Follow `.github/instructions/security-and-owasp.instructions.md`

**Security-first mindset required for all code.**

### Frontend (Angular/TypeScript)

- **Style Guide**: Angular Style Guide
- **Formatter**: Prettier (if configured)
- **Linter**: ESLint
- **Type Safety**: Enable strict TypeScript mode
- **Components**: Use standalone components (Angular 14+)
- **File Organization**: Feature-based module structure

**Naming conventions:**

- Components: `PascalCase` + `Component` suffix (e.g., `UserListComponent`)
- Services: `PascalCase` + `Service` suffix (e.g., `ApiService`)
- Files: `kebab-case` (e.g., `user-list.component.ts`)
- Variables/functions: `camelCase`

**Angular patterns:**

- Use signals for reactive state (Angular 16+)
- Prefer OnPush change detection strategy
- Use reactive forms over template-driven forms
- Follow the instructions in `.github/instructions/angular.instructions.md`

### QA (Playwright/TypeScript)

- **Test Structure**: Arrange-Act-Assert pattern
- **Locators**: Prefer user-facing locators (role, label, text)
- **Assertions**: Use auto-retrying web-first assertions
- **Naming**: Descriptive test titles that explain the scenario

**Test patterns:**

```typescript
test("should do something specific", async ({ page }) => {
	// Arrange
	await page.goto("/");

	// Act
	await page.getByRole("button", { name: "Submit" }).click();

	// Assert
	await expect(page.getByText("Success")).toBeVisible();
});
```

Follow instructions in:

- `.github/instructions/playwright-typescript.instructions.md`
- `.github/instructions/playwright-python.instructions.md` (for Python Playwright)

## Build and Deployment

### Backend Build

Django doesn't require a build step for development. For production:

```bash
# Collect static files
python backend/manage.py collectstatic --noinput

# Check deployment settings
python backend/manage.py check --deploy
```

### Frontend Build

```bash
cd frontend

# Build for production
npm run build

# Output directory
# dist/ (check angular.json for exact path)

# Build with specific configuration
npx ng build --configuration=production
```

### Docker Build

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
docker-compose build qa

# Build with no cache
docker-compose build --no-cache
```

**Docker best practices:**

- Follow `.github/instructions/containerization-docker-best-practices.instructions.md`
- Use multi-stage builds for production images
- Minimize layer count and image size
- Don't include development dependencies in production images

### Deployment Checklist

- [ ] Update `backend/project/settings.py` for production (DEBUG=False, ALLOWED_HOSTS, etc.)
- [ ] Set strong SECRET_KEY via environment variable
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up static file serving (WhiteNoise, CDN, or web server)
- [ ] Build frontend with `--configuration=production`
- [ ] Run database migrations
- [ ] Configure CORS if frontend is on different domain
- [ ] Set up HTTPS/SSL
- [ ] Configure environment variables
- [ ] Set up error monitoring (Sentry, etc.)

## Pull Request Guidelines

### Title Format

```
[component] Brief description

Examples:
[backend] Add user authentication endpoint
[frontend] Implement user profile component
[qa] Add tests for login flow
[docker] Update nginx configuration
[docs] Update setup instructions
```

### Before Submitting

**Backend:**

```bash
# Run tests
python backend/manage.py test

# Check for migrations
python backend/manage.py makemigrations --dry-run --check

# Check code style (if black is installed)
black --check backend/
```

**Frontend:**

```bash
cd frontend

# Lint code
npm run lint

# Run tests
npm test -- --watch=false

# Build to verify no errors
npm run build
```

**QA:**

```bash
cd qa

# Run all tests
npm test
```

**Required checks:**

- All tests pass
- No linting errors
- No TypeScript compilation errors
- Code follows style guidelines
- New features have tests
- Documentation updated if needed

### Commit Message Format

Follow conventional commits:

```
type(scope): subject

Examples:
feat(backend): add user registration endpoint
fix(frontend): resolve navigation bug
test(qa): add login flow tests
docs(readme): update installation steps
chore(deps): update Angular to 16.1
```

## Debugging and Troubleshooting

### Common Issues

**Backend issues:**

- **"No module named django"**: Activate virtual environment with `source .venv/bin/activate`
- **Database errors**: Run `python backend/manage.py migrate`
- **Port 8000 already in use**: Kill existing process or use different port with `python backend/manage.py runserver 8001`

**Frontend issues:**

- **"ng: command not found"**: Use `npx @angular/cli@16` prefix or install globally with `npm install -g @angular/cli@16`
- **Module not found errors**: Run `npm install` in frontend directory
- **Port 4200 in use**: Kill process or specify different port with `ng serve --port 4201`

**QA issues:**

- **"Target page closed" or connection errors**: Ensure backend is running at `http://127.0.0.1:8000`
- **Browser not installed**: Run `npx playwright install`
- **Tests timeout**: Increase timeout in `playwright.config.ts` or check if backend is responding

**Docker issues:**

- **Containers won't start**: Run `docker-compose down` then `docker-compose up --build`
- **Changes not reflected**: Rebuild with `docker-compose up --build`
- **Port conflicts**: Check if ports 8000, 4200 are already in use on host

### Logging

**Backend:**

- Django logs to console by default
- Add `print()` or `logger.debug()` for debugging
- Check `backend/project/settings.py` for logging configuration

**Frontend:**

- Use `console.log()` for debugging
- Check browser DevTools console
- Angular errors appear in browser console

**QA:**

- Playwright screenshots on failure (if configured)
- Use `--debug` flag for step-through debugging
- Check `test-results/` directory for artifacts

### Performance Considerations

**Backend:**

- Use `select_related()` and `prefetch_related()` for database queries
- Implement caching for expensive operations
- Profile with Django Debug Toolbar (development only)

\*\*FCoding Standards & Instructions

**CRITICAL**: Always consult instruction files before making changes.

### Instruction Files

Located in `.github/instructions/`:

| File                                                     | Purpose                     | When to Use                 |
| -------------------------------------------------------- | --------------------------- | --------------------------- |
| `spec-driven-workflow.instructions.md`                   | Development methodology     | Before starting any feature |
| `python.instructions.md`                                 | Python/Django conventions   | All backend code            |
| `angular.instructions.md`                                | Angular/TypeScript patterns | All frontend code           |
| `playwright-typescript.instructions.md`                  | E2E testing standards       | All Playwright tests        |
| `security-and-owasp.instructions.md`                     | Security requirements       | All code (mandatory)        |
| `git-workflow.instructions.md`                           | Git workflow, commits, PRs  | All commits and PRs         |
| `api-design.instructions.md`                             | REST API standards          | API endpoint design         |
| `ci-cd.instructions.md`                                  | CI/CD pipeline standards    | GitHub Actions              |
| `containerization-docker-best-practices.instructions.md` | Docker guidelines           | Dockerfile changes          |

### Git Workflow Standards

Workflow Best Practices

### Feature Development Checklist

When implementing a new feature, follow the spec-driven workflow:

#### Phase 1: DESIGN (Architect Agent)

- [ ] Fetch Jira ticket via MCP
- [ ] Analyze codebase and constraints
- [ ] Create `technical-design.md`
- [ ] Apply **Devils Advocate self-critique**
- [ ] Refine design based on critique
- [ ] Hand off to Tasks Agent

#### Phase 2: PLAN (Tasks Agent)

- [ ] Read `technical-design.md` + Jira ticket
- [ ] Create atomic task breakdown in `tasks.md`
- [ ] Apply **Devils Advocate self-critique**
- [ ] Refine tasks based on critique
- [ ] **Request user approval (SINGLE GATE)**

#### Phase 3: IMPLEMENT (Backend/Frontend Agents)

- [ ] Read: Jira + `technical-design.md` + `tasks.md`
- [ ] Execute ONE atomic task at a time
- [ ] Request approval before each task
- [ ] Update `tasks.md` checklist after completion
- [ ] After ALL tasks complete: **Apply Devils Advocate review**
- [ ] Ensure all tests pass
- [ ] Follow coding standards
- [ ] Commit following git workflow

#### Phase 4: COMPLETE

- [ ] All tasks verified complete
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Create PR following standards
- [ ] Pass CI/CD checks
- [ ] Get approvals and merge

### Common Workflows

**Quick test a feature:**

```bash
# Terminal 1: Backend
source .venv/bin/activate && python backend/manage.py runserver

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Open browser
open http://localhost:4200
```

**Run full test suite:**

```bash
# Backend tests
python backend/manage.py test

# Frontend tests
cd frontend && npm test -- --watch=false

# E2E tests (backend must be running)
cd qa && npm test
```

**Create a new feature branch:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/PROJ-123-new-feature
```

**Update dependencies:**

```bash
# Backend
pip install -r backend/requirements.txt
python backend/manage.py migrate

# Frontend
cd frontend && npm install

# QA
cd qa && npm install
```

## Additional Resources

### Documentation

- `README.md` - User-facing project documentation
- `.github/instructions/` - Detailed coding standards
- `.github/agents/` - Specialized agent configurations
- `.github/prompts/` - Reusable workflow prompts
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation
- `qa/README.md` - QA-specific documentation

````

### Requirements Before PR

- [ ] All tests pass (backend, frontend, E2E)
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Branch up to date with target
- [ ] Commit messages follow convention

### Workflow Phases

Follow the **Specification-Driven Development Workflow**:

1. **DESIGN**: Architect Agent creates `technical-design.md` from Jira ticket
2. **PLAN**: Tasks Agent creates `tasks.md` with atomic task breakdown (SINGLE APPROVAL GATE)
3. **IMPLEMENT**: Backend/Frontend Agents execute tasks one at a time
4. **COMPLETE**: All tasks done, tests pass, PR created and reviewed

## Additional Resources

### Instruction Files

The `.github/instructions/` directory contains detailed coding standards:

- `angular.instructions.md` - Angular-specific patterns
- `python.instructions.md` - Python coding conventions
- `playwright-typescript.instructions.md` - TypeScript Playwright tests
- `playwright-python.instructions.md` - Python Playwright tests
- `security-and-owasp.instructions.md` - Security best practices
- `containerization-docker-best-practices.instructions.md` - Docker guidelines
- `spec-driven-workflow.instructions.md` - Development methodology

### Agent Configuration

- `.github/copilot-instructions.md` - Quick reference for AI agents
- `.github/agents/backend.agent.md` - Backend development agent
- `.github/agents/frontend.agent.md` - Frontend development agent
- `.github/agents/react.agent.md` - React patterns (reference)

### Key Files Reference

**Backend:**

- `backend/manage.py` - Django management commands
- `backend/project/settings.py` - Django configuration
- `backend/project/urls.py` - Root URL configuration
- `backend/api/views.py` - API views
- `backend/api/urls.py` - API URL routing
- `backend/api/models.py` - Database models
- `backend/db.sqlite3` - SQLite database (gitignored)

**Frontend:**

- `frontend/src/app/` - Angular application code
- `frontend/src/environments/` - Environment configurations
- `frontend/angular.json` - Angular CLI configuration
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/package.json` - Dependencies and scripts

**QA:**

- `qa/tests/` - Test files
- `qa/playwright.config.ts` - Playwright configuration
- `qa/package.json` - Dependencies

**Docker:**

- `docker-compose.yml` - Service orchestration
- `backend/Dockerfile` - Backend container
- `frontend/Dockerfile` - Frontend container
- `qa/Dockerfile` - QA container

## Quick Reference

### Most Common Commands

```bash
# Start all services
docker-compose up

# Start backend only (local)
source .venv/bin/activate && python backend/manage.py runserver

# Start frontend only
cd frontend && npm start

# Run all QA tests
cd qa && npm test

# Run backend tests
python backend/manage.py test

# Run frontend tests
cd frontend && npm test

# Database migrations
python backend/manage.py makemigrations
python backend/manage.py migrate

# Reset everything
docker-compose down
rm backend/db.sqlite3
python backend/manage.py migrate
````

### Port Reference

- Backend API: `http://127.0.0.1:8000`
- Backend Admin: `http://127.0.0.1:8000/admin`
- Frontend: `http://localhost:4200`
- API endpoint: `http://127.0.0.1:8000/api/`

---

**Last Updated**: January 2026
**Project**: sdd-ai-weather
**Type**: Full-stack monorepo (Django + Angular + Playwright)
