---
description: "Git workflow, branch naming, commit messages, and PR standards"
applyTo: "**"
---

# Git Workflow and Standards

## Overview

This document defines the Git workflow, branch naming conventions, commit message format, and pull request standards for the project.

## Branch Strategy

### Branch Types

We use a simplified Git flow with the following branch types:

- **`main`**: Production-ready code. Protected branch.
- **`develop`**: Integration branch for features. Protected branch.
- **`feature/*`**: New features or enhancements
- **`bugfix/*`**: Bug fixes for upcoming releases
- **`hotfix/*`**: Critical fixes for production issues
- **`docs/*`**: Documentation updates
- **`test/*`**: Test improvements or new test suites
- **`refactor/*`**: Code refactoring without functional changes
- **`chore/*`**: Maintenance tasks, dependency updates, build changes

### Branch Naming Conventions

Format: `<type>/<ticket-id>-<short-description>`

**Examples**:

```
feature/PROJ-123-weather-api-integration
bugfix/PROJ-456-fix-temperature-validation
hotfix/PROJ-789-critical-auth-fix
docs/PROJ-101-update-api-docs
test/PROJ-202-add-e2e-tests
refactor/PROJ-303-optimize-db-queries
chore/PROJ-404-update-dependencies
```

**Rules**:

- Use lowercase only
- Use hyphens (`-`) to separate words
- Include ticket ID from Jira/GitHub Issues
- Keep description short and descriptive (max 50 characters)
- Avoid special characters except hyphens

## Commit Message Format

Follow **Conventional Commits** specification:

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI/CD configuration
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope (Optional)

The scope provides additional context about the commit:

- `backend`: Backend/API changes
- `frontend`: Frontend/UI changes
- `qa`: Test changes
- `docker`: Docker/containerization changes
- `ci`: CI/CD pipeline changes
- `docs`: Documentation changes
- `api`: API-specific changes
- `db`: Database changes
- `auth`: Authentication/authorization changes

### Subject

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 50 characters

### Body (Optional)

- Use imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Wrap at 72 characters

### Footer (Optional)

- Reference related issues or tickets
- Note breaking changes

### Examples

#### Simple Commit

```
feat(backend): add weather caching endpoint
```

#### Commit with Body

```
fix(frontend): resolve navigation bug on mobile devices

The navigation menu was not closing properly on mobile devices
after clicking a link. This change adds an event listener to
properly close the menu on route changes.

Fixes PROJ-456
```

#### Breaking Change

```
feat(api)!: change authentication to JWT

BREAKING CHANGE: Token authentication replaced with JWT.
All clients must update to use JWT tokens instead of
simple token authentication.

Refs PROJ-789
```

#### Multi-Scope Commit

```
test(backend, qa): add integration tests for weather API

- Add unit tests for Django views
- Add E2E tests with Playwright
- Update test documentation

Closes PROJ-202
```

## Pull Request (PR) Standards

### PR Title Format

Use the same format as commit messages:

```
<type>(<scope>): <short description>
```

**Examples**:

```
feat(backend): add weather API integration
fix(frontend): resolve login redirect issue
docs(readme): update installation instructions
```

### PR Description Template

```markdown
## Description

Brief description of what this PR accomplishes.

## Related Ticket

- Jira: [PROJ-123](https://jira.example.com/browse/PROJ-123)
- GitHub Issue: #456

## Type of Change

- [ ] New feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test addition/update

## Changes Made

- Bullet point list of key changes
- Focus on what and why, not how

## How to Test

1. Step-by-step instructions to test the changes
2. Include any necessary setup or prerequisites
3. Expected results for each step

## Screenshots (if applicable)

Add screenshots or GIFs showing the changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] All CI checks passing
- [ ] Branch is up to date with target branch

## Breaking Changes

List any breaking changes and migration steps (if applicable).

## Additional Notes

Any additional context or information for reviewers.
```

### PR Labels

Use labels to categorize PRs:

- `feature`: New feature
- `bugfix`: Bug fix
- `hotfix`: Critical production fix
- `documentation`: Documentation changes
- `testing`: Test improvements
- `refactoring`: Code refactoring
- `performance`: Performance improvements
- `security`: Security-related changes
- `dependencies`: Dependency updates
- `breaking-change`: Contains breaking changes
- `needs-review`: Ready for review
- `work-in-progress`: Not ready for review
- `blocked`: Blocked by other work

## Code Review Process

### Before Creating a PR

1. **Self-review**: Review your own code first
2. **Tests**: Ensure all tests pass locally
3. **Linting**: Run linters and fix any issues
4. **Documentation**: Update relevant documentation
5. **Rebase**: Rebase on target branch to avoid merge conflicts

### PR Submission Checklist

- [ ] PR title follows naming convention
- [ ] PR description is complete and clear
- [ ] All CI checks are passing
- [ ] Code is self-reviewed
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] No merge conflicts
- [ ] Branch is up to date with target
- [ ] Appropriate labels applied
- [ ] Reviewers assigned

### Review Guidelines

**For Reviewers**:

- Review within 24 hours when possible
- Provide constructive feedback
- Approve only if all concerns are addressed
- Use PR review features (comment, request changes, approve)
- Check for:
  - Code quality and style
  - Test coverage
  - Security vulnerabilities
  - Performance implications
  - Breaking changes

**For Authors**:

- Respond to all comments
- Make requested changes or explain why not
- Request re-review after changes
- Keep PRs small and focused (< 400 lines preferred)
- Split large changes into multiple PRs

### Approval Requirements

- **main**: Requires 2 approvals + passing CI
- **develop**: Requires 1 approval + passing CI
- **feature branches**: Requires 1 approval + passing CI

## Merge Strategy

### Merge Methods

- **Squash and Merge** (default): Combine all commits into one
  - Use for feature branches
  - Creates clean history
  - Preserves PR title and description

- **Rebase and Merge**: Replay commits on target branch
  - Use for small, well-crafted commits
  - Maintains individual commit history
  - Linear history

- **Merge Commit**: Create a merge commit
  - Use for long-running feature branches
  - Preserves complete branch history
  - Non-linear history

**Default Strategy**: Squash and Merge

### After Merge

1. **Delete source branch** (automatic in GitHub)
2. **Close related issues** (if not auto-closed)
3. **Update Jira ticket** status
4. **Deploy** (if applicable)

## Protected Branch Rules

### `main` Branch

- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require branches to be up to date
- Require conversation resolution
- Restrict push access (admins only)
- No force pushes allowed
- No deletions allowed

### `develop` Branch

- Require pull request reviews (1 approval)
- Require status checks to pass
- Require branches to be up to date
- No force pushes allowed
- No deletions allowed

## Hotfix Process

For critical production issues:

1. **Create hotfix branch** from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/PROJ-789-critical-fix
   ```

2. **Make minimal fix** and test thoroughly

3. **Create PR** to `main` with high priority label

4. **Fast-track review** and merge

5. **Merge back to develop**:

   ```bash
   git checkout develop
   git pull origin develop
   git merge main
   git push origin develop
   ```

6. **Deploy immediately** to production

## Common Git Commands

### Starting a New Feature

```bash
# Update local develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/PROJ-123-new-feature

# Work on feature...
git add .
git commit -m "feat(backend): add new feature"

# Push to remote
git push origin feature/PROJ-123-new-feature
```

### Updating Your Branch

```bash
# Rebase on latest develop
git checkout develop
git pull origin develop
git checkout feature/PROJ-123-new-feature
git rebase develop

# Resolve conflicts if any
git add .
git rebase --continue

# Force push (careful!)
git push origin feature/PROJ-123-new-feature --force-with-lease
```

### Amending Last Commit

```bash
# Make changes
git add .
git commit --amend --no-edit

# Or change message
git commit --amend -m "feat(backend): updated commit message"

# Force push
git push origin feature/PROJ-123-new-feature --force-with-lease
```

### Cherry-Picking Commits

```bash
# Copy commit from another branch
git cherry-pick <commit-hash>

# Resolve conflicts if any
git add .
git cherry-pick --continue
```

## Best Practices

### Commits

- ✅ Commit often, push less frequently
- ✅ Each commit should represent a logical unit of work
- ✅ Write clear, descriptive commit messages
- ✅ Use present tense in commit messages
- ✅ Keep commits focused on a single change

### Branches

- ✅ Create feature branches from latest `develop`
- ✅ Keep branches short-lived (< 1 week preferred)
- ✅ Regularly sync with `develop` to avoid conflicts
- ✅ Delete merged branches
- ✅ Use descriptive branch names

### Pull Requests

- ✅ Keep PRs small and focused (< 400 lines preferred)
- ✅ Provide clear context in PR description
- ✅ Link related issues and tickets
- ✅ Respond promptly to review comments
- ✅ Keep PR up to date with target branch

### Code Reviews

- ✅ Review within 24 hours
- ✅ Provide constructive feedback
- ✅ Ask questions, don't make assumptions
- ✅ Suggest alternatives when requesting changes
- ✅ Approve when all concerns are addressed

## Troubleshooting

### Resolving Merge Conflicts

```bash
# Update your branch
git checkout develop
git pull origin develop
git checkout feature/PROJ-123-new-feature
git merge develop

# Resolve conflicts in editor
# Then:
git add .
git commit -m "merge: resolve conflicts with develop"
git push origin feature/PROJ-123-new-feature
```

### Undoing Last Commit (Not Pushed)

```bash
# Keep changes in working directory
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Fixing Pushed Commits

```bash
# Create new commit that reverts changes
git revert <commit-hash>
git push origin feature/PROJ-123-new-feature
```

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)
