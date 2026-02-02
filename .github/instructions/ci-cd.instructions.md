---
description: "CI/CD pipeline standards for GitHub Actions"
applyTo: "**/.github/workflows/**, **/Dockerfile, **/docker-compose*.yml"
---

# CI/CD Pipeline Standards (GitHub Actions)

## Overview

This document defines CI/CD pipeline standards using GitHub Actions for automated testing, building, and deployment.

## Core Principles

1. **Automate Everything**: Build, test, security scan, deploy
2. **Fail Fast**: Run quick checks first, expensive checks later
3. **Security First**: Scan for vulnerabilities before deployment
4. **Environment Parity**: Dev/Staging/Production should be identical
5. **Rollback Ready**: Always maintain ability to rollback

## Workflow Structure

### Standard Workflow Organization

```
.github/
└── workflows/
    ├── ci.yml                 # Continuous Integration
    ├── cd-staging.yml         # Deploy to staging
    ├── cd-production.yml      # Deploy to production
    ├── dependency-update.yml  # Automated dependency updates
    └── security-scan.yml      # Security vulnerability scanning
```

## CI Workflow (ci.yml)

### Trigger Events

Run CI on:

- Push to `develop`, `main`
- Pull requests to `develop`, `main`
- Manual dispatch

```yaml
name: CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]
  workflow_dispatch:

jobs:
  # Jobs defined below
```

### Job Organization

**Order of execution** (fail fast principle):

1. **Lint**: Code style and formatting checks (~1-2 min)
2. **Unit Tests**: Backend and frontend unit tests (~2-5 min)
3. **Build**: Build artifacts (~3-5 min)
4. **Integration Tests**: API integration tests (~5-10 min)
5. **E2E Tests**: Playwright end-to-end tests (~10-15 min)
6. **Security Scan**: Dependency and container scanning (~3-5 min)

### Example CI Workflow

```yaml
name: CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"

      - name: Install Python dependencies
        run: |
          pip install black flake8
          pip install -r backend/requirements.txt

      - name: Run Black
        run: black --check backend/

      - name: Run Flake8
        run: flake8 backend/ --max-line-length=88 --extend-ignore=E203

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Lint frontend
        run: cd frontend && npm run lint

  test-backend:
    name: Backend Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"

      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt

      - name: Run Django tests
        run: |
          cd backend
          python manage.py test --verbosity=2
        env:
          DJANGO_SETTINGS_MODULE: project.settings
          SECRET_KEY: ${{ secrets.DJANGO_SECRET_KEY_TEST }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml
          flags: backend

  test-frontend:
    name: Frontend Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Run tests
        run: cd frontend && npm test -- --watch=false --code-coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: weather-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: false
          tags: weather-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  e2e-test:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Start services
        run: docker-compose up -d --build

      - name: Wait for backend
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:8000/api/; do sleep 2; done'

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: qa/package-lock.json

      - name: Install Playwright
        run: cd qa && npm ci && npx playwright install --with-deps

      - name: Run E2E tests
        run: cd qa && npm test

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: qa/playwright-report/
          retention-days: 7

      - name: Stop services
        if: always()
        run: docker-compose down

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: "trivy-results.sarif"

      - name: Python dependency check
        run: |
          pip install pip-audit
          pip-audit -r backend/requirements.txt
```

## CD Workflows

### Staging Deployment (cd-staging.yml)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  workflow_dispatch:

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/weather-backend:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/weather-backend:$IMAGE_TAG

          docker build -t $ECR_REGISTRY/weather-frontend:$IMAGE_TAG ./frontend
          docker push $ECR_REGISTRY/weather-frontend:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster weather-staging \
            --service backend \
            --force-new-deployment
```

### Production Deployment (cd-production.yml)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com

    steps:
      - uses: actions/checkout@v4

      # Similar to staging but with production environment
      # Add approval gates via GitHub Environments

      - name: Run smoke tests
        run: |
          curl -f https://app.example.com/api/health || exit 1

      - name: Rollback on failure
        if: failure()
        run: |
          aws ecs update-service \
            --cluster weather-production \
            --service backend \
            --task-definition weather-backend:previous
```

## Environment Management

### GitHub Environments

Create environments with protection rules:

- **staging**: No approvals required, auto-deploy from `develop`
- **production**: Require approvals (2 reviewers), auto-deploy from `main`

### Environment Variables and Secrets

**Organization-level secrets** (shared across repos):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

**Environment-specific secrets**:

- `DJANGO_SECRET_KEY_STAGING`
- `DJANGO_SECRET_KEY_PRODUCTION`
- `DATABASE_URL_STAGING`
- `DATABASE_URL_PRODUCTION`
- `API_KEY_WEATHER_SERVICE`

### Example Secret Usage

```yaml
- name: Run Django migrations
  run: |
    python backend/manage.py migrate
  env:
    SECRET_KEY: ${{ secrets.DJANGO_SECRET_KEY_PRODUCTION }}
    DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
    DEBUG: false
```

## Caching Strategy

### Dependency Caching

```yaml
- name: Cache Python dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- name: Cache Node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Docker Layer Caching

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build with cache
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Notifications

### Slack Notifications

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "CI failed for ${{ github.repository }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "❌ CI Pipeline Failed\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref }}\n*Author:* ${{ github.actor }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Best Practices

### Workflow Design

- ✅ Use matrix builds for testing multiple versions
- ✅ Run fast jobs first (linting, unit tests)
- ✅ Cache dependencies to speed up workflows
- ✅ Use `needs` to define job dependencies
- ✅ Set timeouts to prevent stuck workflows
- ✅ Use environments for deployment protection

### Security

- ✅ Never log secrets or sensitive data
- ✅ Use GitHub's secret management
- ✅ Scan containers for vulnerabilities
- ✅ Pin action versions to specific commits
- ✅ Use least-privilege AWS IAM roles
- ✅ Enable branch protection rules

### Performance

- ✅ Parallelize independent jobs
- ✅ Cache dependencies (pip, npm, docker layers)
- ✅ Use self-hosted runners for faster builds
- ✅ Minimize artifact uploads (only what's needed)
- ✅ Set appropriate job timeouts

### Monitoring

- ✅ Track workflow execution times
- ✅ Monitor failure rates
- ✅ Set up alerts for critical failures
- ✅ Review logs for security issues
- ✅ Use GitHub Insights for metrics

## Common Patterns

### Matrix Builds

Test across multiple versions:

```yaml
strategy:
  matrix:
    python-version: ["3.10", "3.11", "3.12"]
    node-version: ["16", "18", "20"]
steps:
  - uses: actions/setup-python@v5
    with:
      python-version: ${{ matrix.python-version }}
```

### Conditional Execution

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main' && success()
  run: ./deploy.sh
```

### Reusable Workflows

```yaml
# .github/workflows/reusable-test.yml
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing in ${{ inputs.environment }}"
```

## Troubleshooting

### Common Issues

**Workflow not triggering**:

- Check branch protection rules
- Verify workflow file syntax (YAML)
- Ensure workflow file is in `.github/workflows/`

**Secrets not available**:

- Verify secret names match exactly
- Check environment configuration
- Ensure secrets are set at correct level (repo/org/environment)

**Docker build failures**:

- Check Dockerfile syntax
- Verify base image availability
- Ensure sufficient disk space

**Timeout issues**:

- Increase job timeout: `timeout-minutes: 30`
- Optimize slow steps (caching, parallelization)
- Use self-hosted runners for large workloads

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [AWS Actions](https://github.com/aws-actions)
