# CLAUDE.md

Project rules for Claude Code. Technical and neutral by design — personas
live in the subagents under `.claude/agents/`, not here.

## Repository

Monorepo for a weather application, used as a testbed for AI agent assets.

| Component | Stack | Path |
| :--- | :--- | :--- |
| Backend | Django 4.2, Python 3.8, SQLite | `backend/` |
| Frontend | Angular 16, TypeScript 5.1 | `frontend/` |
| E2E | Playwright | `qa/` |
| Specs | Product vision, backlog, per-ticket design and tasks | `specs/` |

## Commands

```bash
# Backend
python backend/manage.py migrate
python backend/manage.py runserver          # :8000
python backend/manage.py test

# Frontend
cd frontend && npm install && npm start     # :4200
cd frontend && npm test
cd frontend && npm run build

# E2E (needs the backend running)
cd qa && npm install && npx playwright install
cd qa && npm test

# Everything
docker-compose up --build
```

## Conventions

- Commits follow Conventional Commits: `type(scope): description`.
  Always written in English, whatever language the conversation uses.
  No `Co-Authored-By` trailers.
- Branch names carry the backlog ID: `feature/WEATHER-001-short-description`.
- Backlog items live in `specs/BACKLOG.md`; per-ticket artifacts in
  `specs/jira-tickets/<TICKET-ID>/`.
- Do not commit generated output, virtualenvs, or `db.sqlite3` — the root
  `.gitignore` covers them.

## Frontend state handling

Every UI block whose content depends on a remote call must satisfy the
doctrine imported below: all canonical states (`idle`, `loading`,
`refreshing`, `error`, `empty`, `success`) handled explicitly, one state
value driving the UI, and async logic plus state presentation reused from
shared primitives rather than reinvented per feature.

@.claude/rules/network-state-ui.md

## Branch note

This branch (`feat/fe-guild-subagents`) has no `.github/` directory: the
Copilot-oriented SDD framework was removed so the Frontend guild subagent
PoC starts clean. `README.md` and `AGENTS.md` still describe that framework
and are therefore stale here. See `.claude/README.md` for what the PoC
brings in and where it came from.
