---
name: implement-network-state-ui
description: Implement or refactor any UI block that depends on a remote call so loading, error, empty, and success states are all explicitly handled through the project's existing async primitive and shared state components. Use when building or changing pages, lists, tables, cards, charts, dropdowns, detail panels, or form submissions that fetch or mutate data, and when a block shows a spinner, a raw error, or a blank area instead of a defined state.
metadata:
  version: 1.0.0
  author: Javi Reyes
---

# Implement Network State UI

Act as a senior frontend engineer responsible for state correctness and pattern convergence. Reasoning depth matters more than speed here: the wrong choice duplicates a pattern that then spreads.

Apply the laws in `.claude/rules/network-state-ui.md` (loaded into every session via the root `CLAUDE.md`). This skill is the procedure.

## Phase 1 — Detect the stack (never assume)

Read, do not guess:

1. `package.json` (or the equivalent manifest) for framework and data layer.
2. Existing async call sites, to learn the real convention rather than the documented one.

| Signal | Data layer in use |
| :--- | :--- |
| `@tanstack/react-query`, `react-query` | Query/mutation hooks with `status` |
| `@reduxjs/toolkit` + `createApi` | RTK Query endpoint hooks |
| `swr` | SWR hooks |
| `apollo/client`, `urql` | GraphQL client state |
| `@angular/core` + `rxjs` / `signals` | Observables, `resource()` / `httpResource` |
| `vue`, `pinia`, `@tanstack/vue-query` | Composables / store state |
| `svelte` | Stores / `await` blocks |
| none of the above | Hand-rolled fetch — expect duplication |

Record the answer. Every later decision follows from it.

## Phase 2 — Inventory what already exists

Search before writing. Look for, and note the exact paths of:

- the async primitive: shared hook, service, composable, store, or client wrapper;
- the state components: skeleton / placeholder, error state, empty state, retry control;
- an existing block that already does this well — the reference implementation to copy;
- the error-normalization helper (raw transport error to user-facing message).

Useful probes, adapted to the repo's layout:

```bash
grep -rIl --include='*.{ts,tsx,js,jsx,vue,svelte}' -E \
  'isLoading|isPending|isFetching|status ===|useQuery|createAsyncThunk|resource\(' src | head -40
grep -rIl --include='*.{ts,tsx,js,jsx,vue,svelte}' -iE \
  'skeleton|shimmer|placeholder|ErrorState|EmptyState|error-state|empty-state|retry' src | head -40
```

If several competing patterns exist, choose the one with the widest current adoption and say so; do not introduce a third.

## Phase 3 — Decide reuse vs extend vs create

Walk it in order and stop at the first that fits:

1. **Reuse as-is** — the existing primitive/component covers the need. Default outcome.
2. **Extend** — add a variant, prop, slot, or generic parameter to the shared artifact so both the old and new call sites use it. Second choice.
3. **Create** — only when no shared artifact exists, or the need is provably incompatible. Then create it in the shared location, not next to the feature, and migrate at least the block being worked on to it.

Never leave a private copy of logic or state UI inside a feature folder when a shared home exists.

## Phase 4 — Implement

1. Model state as one discriminated value covering `idle`, `loading`, `refreshing`, `error`, `empty`, `success`. Represent it so that contradictory combinations cannot be constructed.
2. Branch exhaustively; add the language's exhaustiveness guard on the default branch.
3. Map each state to shared output:
   - `loading` → skeleton whose footprint matches the loaded layout;
   - `refreshing` → data stays, non-blocking indicator;
   - `error` → normalized message + retry, scoped to the block;
   - `empty` → shared empty state with real copy and, where meaningful, a primary action;
   - `success` → content.
4. Keep the fetch/state concern and the presentation concern separate, following whatever separation the repo already uses (hook + view, container + presentational, service + component, store + template).
5. Handle the lifecycle: cancel or ignore superseded requests, clean up on teardown, bound retries.
6. For mutations: pending state on the trigger, rollback path for optimistic writes, errors adjacent to the action, user input preserved.
7. Wire accessibility: busy/live status on loading regions, assertive announcement for errors, keyboard-reachable retry, disabled controls that explain themselves.

Stack-specific mappings for each of these steps are in [REFERENCE.md](REFERENCE.md).

## Phase 5 — Verify and report

Check every item before declaring the work done:

- [ ] Stack and data layer identified from files, not assumed.
- [ ] All six canonical states reachable by this block are handled; unhandled states break the build.
- [ ] No independent boolean flags; one state value drives the UI.
- [ ] Loading footprint matches loaded footprint (no layout shift).
- [ ] `empty` handled separately from `loading` and `error`.
- [ ] Error message normalized, actionable, block-scoped, with retry.
- [ ] Existing async primitive reused or extended — new one justified in writing.
- [ ] Existing skeleton / error / empty components reused or extended — no local duplicates.
- [ ] Superseded requests cancelled or ignored; teardown clean; retries bounded.
- [ ] Mutation pending, rollback, and error placement handled (if applicable).
- [ ] Accessibility: busy status, error announcement, keyboard retry.
- [ ] One test (or reproducible check) per reachable state.

Then report:

```
Block:        <component/route touched>
Stack:        <framework + data layer detected>
States:       idle | loading | refreshing | error | empty | success  → how each is rendered
Reused:       <paths of primitives and components reused>
Extended:     <paths + what was added, and why extension over reuse>
Created:      <paths + why nothing existing could serve>
Tests:        <state → test name>
Gaps:         <anything deliberately left, with reason>
```

`Reused` empty while `Created` is non-empty is a result that must be defended, not a normal outcome.
