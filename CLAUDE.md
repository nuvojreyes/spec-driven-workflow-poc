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
# Both services, on the host. Ctrl-C stops both.
./dev.sh
BACKEND_PORT=8001 FRONTEND_PORT=4201 ./dev.sh   # when a port is taken

# Both services, in containers
docker compose up --build
BACKEND_PORT=8001 FRONTEND_PORT=4201 docker compose up --build

# Separately
python backend/manage.py runserver 127.0.0.1:8000
cd frontend && npm start                        # :4200, proxies /api

# Verification (there is no frontend test target — see Conventions)
cd frontend && npm run build
python backend/manage.py check

# E2E, against a running backend
cd qa && npm install && npx playwright install && npm test
docker compose run --rm qa                      # same suite, in a container
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
- There is no frontend test or lint target yet: `angular.json` defines
  neither and the dependencies are absent. `npm run build` is the
  verification command. Do not add a `test` script without also adding the
  target and the runner.
- The frontend reaches the API at the same-origin path `/api`, through the
  dev-server proxy in `frontend/proxy.conf.json`. Nothing hardcodes a host,
  and the backend needs no CORS handling.

## Frontend state handling

Every UI block whose content depends on a remote call must satisfy the
doctrine imported below: all canonical states (`idle`, `loading`,
`refreshing`, `error`, `empty`, `success`) handled explicitly, one state
value driving the UI, and async logic plus state presentation reused from
shared primitives rather than reinvented per feature.

The primitives already exist. Reuse them; do not write a second set.

| What | Where |
| :--- | :--- |
| State model and exhaustiveness guard | `frontend/src/app/core/async-state.ts` |
| The async primitive | `frontend/src/app/core/to-async-state.ts` |
| Error normalization | `frontend/src/app/core/http-error.ts` |
| Loading / error / empty presentation | `frontend/src/app/shared/` |
| Data layer | `frontend/src/app/weather/weather.service.ts` |
| Reference block to follow | `frontend/src/app/app.component.ts` |

Two backend levers reach every state from the browser with no code change,
forwarded from the page URL to the API: `?delay=<seconds>` holds the
response and `?fail=1` returns 503. An unknown city returns 404, and the
city `nowhere` returns a successful response with an empty forecast.

@.claude/rules/network-state-ui.md

## Branch note

This branch (`feat/fe-guild-subagents`) has no `.github/` directory: the
Copilot-oriented SDD framework was removed so the Frontend guild subagent
PoC starts clean. `README.md` and `AGENTS.md` still describe that framework
and are therefore stale here. See `.claude/README.md` for what the PoC
brings in and where it came from.
