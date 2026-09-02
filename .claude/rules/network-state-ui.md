---
name: network-state-ui
description: Framework-agnostic laws for handling network-backed UI state (loading, error, empty, success) and for reusing async logic and state presentation instead of duplicating it.
trigger: model_decision
metadata:
  version: 1.0.0
  author: Javi Reyes
---

# Network State UI Doctrine

These laws apply to any UI unit whose content depends on a remote call: page, view, route, panel, card, table, list, chart, dropdown, form submission, or infinite-scroll block.

## 1. State Completeness

1. **No implicit states.** Every network-backed block must resolve to exactly one of the canonical states below, and each one must have a defined visual output.

   | State | Meaning | Required output |
   | :--- | :--- | :--- |
   | `idle` | Request not started (lazy / gated by input) | Neutral prompt or nothing, never a spinner |
   | `loading` | First load, no data yet | Skeleton or placeholder matching the final layout |
   | `refreshing` | Data present, background revalidation | Keep data visible; subtle non-blocking indicator |
   | `error` | Request failed | Human-readable cause + retry affordance |
   | `empty` | Request succeeded, result set is empty | Explicit empty state, never a blank area |
   | `success` | Request succeeded with data | The content layout |

2. **`empty` is not `loading` and not `error`.** A successful response with zero items is a first-class state with its own copy and call to action.
3. **Exhaustive handling.** State branching must be exhaustive and fail loudly at build time when a state is unhandled (discriminated union + compile-time exhaustiveness check where the language allows it).
4. **No silent failure.** A rejected request must never leave the previous state, an empty state, or a permanent spinner on screen.

## 2. Single Source of Truth

1. Derive the visual state from **one** state value, not from independent flags. Combinations such as "loading `true` and error `true`" must be impossible to represent, not merely unlikely.
2. The data-fetching layer owns state; the presentation layer only maps state to output. Components do not invent extra state that duplicates or contradicts it.
3. Never mirror fetched data into local component state as a second copy. Mirror only when the value is user-editable, and then make the direction of ownership explicit.

## 3. Reuse Before Creation

1. **Logic**: before writing a fetch, cache key, retry policy, or state machine, locate the existing async primitive of the project and use it. Add a new primitive only when the required behavior cannot be expressed by extending the existing one, and record why.
2. **UI**: loading, error, and empty presentation come from shared components (for example one skeleton primitive, one error-state component, one empty-state component). Local, ad-hoc spinners and inline error strings are duplication and are not accepted.
3. **One pattern per repository.** Two blocks with the same state needs must not use two different mechanisms. Converging on the existing pattern outweighs a locally nicer alternative.
4. Extending a shared component (new variant, new prop, new slot) is preferred over forking it. Forking requires a stated reason.

## 4. Layout Stability and Content Integrity

1. Loading output must occupy the same footprint as the loaded content: no layout shift when data arrives.
2. Never render content derived from partial or undefined data. Guard the whole block, not individual fields with fallback values that hide the real state.
3. Error and empty states stay inside the block's own boundaries; a failing widget must not take down or blank out the surrounding page.

## 5. Accessibility of State Changes

1. Loading regions expose a busy/live status that assistive technology announces; they are not silent visual-only changes.
2. Errors are announced assertively and are reachable by keyboard, including the retry control.
3. Disabled controls during a pending mutation must state why they are disabled, not just appear inert.

## 6. Mutations

1. A pending mutation disables its trigger and shows progress on that trigger, not on the whole page.
2. Optimistic updates require a defined rollback path on failure.
3. Mutation errors surface next to the action that caused them, and preserve the user's input.

## 7. Request Lifecycle Correctness

1. Cancel or ignore superseded requests; the last response to arrive is not automatically the current one.
2. Clean up subscriptions and pending work when the unit is destroyed; no state writes after teardown.
3. Retry is explicit and bounded. Infinite automatic retry loops are prohibited.

## 8. Verification

A network-backed block is not complete until each canonical state it can reach is exercised by a test or an equivalent reproducible check, and the shared components used are named in the change description.
