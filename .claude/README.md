# Claude Code assets — FE Guild subagent PoC

Proof of concept: pull Frontend guild AI assets out of the shared asset
library and run them inside a real application repository.

## Provenance

All files here are copied **verbatim** (byte-for-byte) from:

| | |
| :--- | :--- |
| Repository | `bitbucket.org/pucksolutions/nuvolar-ai-assets` |
| Branch | `feat/FE-guild-subagents` |
| Commit | `d0335f144043c679ea682f435e5c58d660b9ec70` |
| Commit subject | `feat(network-state-ui): add Frontend guild and network state UI agent (v1.0.0)` |

## Layout

| Path here | Source path | Loaded by Claude Code |
| :--- | :--- | :--- |
| `agents/network-state-ui.md` | `agents/frontend/network-state-ui/claude-agents/network-state-ui.md` | Yes — subagent, delegated to automatically or on request |
| `skills/implement-network-state-ui/SKILL.md` | `agents/frontend/network-state-ui/skills/implement-network-state-ui/SKILL.md` | Yes — skill |
| `skills/implement-network-state-ui/REFERENCE.md` | same directory upstream | On demand, by the skill |
| `skills/skill-changelog-updater/SKILL.md` | `.claude/skills/skill-changelog-updater/SKILL.md` | Yes — skill |
| `skills/skill-changelog-updater/CHANGELOG.md` | same directory upstream | No — its own version history |
| `rules/network-state-ui.md` | `agents/frontend/network-state-ui/rules/network-state-ui.md` | Yes — imported by the root `CLAUDE.md` |

The upstream layout is a *library* layout (`agents/<guild>/<agent>/`, with
`claude-agents/` meaning "install these into `.claude/agents/`"). Here the
files sit where Claude Code actually reads them, so the assets run rather
than just being stored.

## Deviations from upstream

Two upstream gaps were patched to make the assets work in this layout.
Everything else is byte-identical to the source commit.

1. **`rules/network-state-ui.md` is now binding.** Claude Code has no
   `.claude/rules/` convention of its own — it reads project rules from
   `CLAUDE.md`. The root `CLAUDE.md` therefore imports the file with
   `@.claude/rules/network-state-ui.md`, so its laws load into every
   session. The file itself is untouched.
2. **`skills/implement-network-state-ui/SKILL.md` line 13 was repointed.**
   Upstream it reads ``Apply the laws in `rules/network-state-ui.md``` —
   a path relative to the agent directory in the library repo, which
   resolves to nothing here. It now points at
   `.claude/rules/network-state-ui.md`. This is the only edited line in
   any copied file.
3. **`skills/skill-changelog-updater/SKILL.md` was completed.** Upstream it
   ends mid-procedure at step 5 ("Write the changelog entry") with no
   output format, template, or examples, which makes the skill unusable as
   shipped. The missing sections were written and the skill bumped to
   1.1.0 per its own versioning rules; see its `CHANGELOG.md`. Worth
   pushing back upstream.

## Assets not brought over

The upstream commit also adds `agents/README.md`,
`agents/frontend/README.md` and
`agents/frontend/network-state-ui/{README.md,CHANGELOG.md}`. Those document
the library itself and use paths relative to it, so they were left behind;
this file replaces them for PoC purposes.

## Trying it

Restart Claude Code (assets are discovered at session start), then run the
backend and the frontend:

```bash
python backend/manage.py runserver            # :8000
cd frontend && npm start                      # :4200, proxies /api
```

The featured-cities block in `frontend/src/app/app.component.ts` is the
reference implementation of the doctrine: one `AsyncState` value, every
canonical state rendered through the shared components in
`frontend/src/app/shared/`, and no local loading or error flags. It is the
pattern a new block is expected to converge on.

The five-day forecast is deliberately unbuilt. `GET /api/forecast/<slug>/`
is live and typed in `weather.model.ts`, WEATHER-007 sits in
`specs/BACKLOG.md`, and no UI consumes it — so the subagent has to
inventory what exists and reuse it:

```
Use the network-state-ui agent to add a five-day forecast block to the
dashboard for the selected city.
```

Its `empty` state is reachable: the city `nowhere` returns a successful
response with zero days. `?delay=<seconds>` and `?fail=1` on the page URL
reach `loading`, `refreshing` and `error`.

To see it audit rather than write, ask for a report first:

```
Use the network-state-ui agent to audit the featured-cities block and
report which canonical states it handles. Report only, do not edit.
```

For the changelog skill:

```
/skill-changelog-updater
```
