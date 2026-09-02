---
name: implement-network-state-ui-reference
description: Stack-specific mappings for canonical network states, request lifecycle, and accessibility, supporting the implement-network-state-ui skill.
metadata:
  version: 1.0.0
  author: Javi Reyes
---

# Reference — Stack Mappings

Use the section matching the stack detected in Phase 1. The canonical states are always the same; only the mechanism changes.

## 1. Canonical state model (language-neutral)

```ts
type AsyncState<T, E = AppError> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'refreshing'; data: T }
  | { status: 'error'; error: E; retry: () => void }
  | { status: 'empty' }
  | { status: 'success'; data: T };
```

`empty` is derived once, in the mapping layer, from a success response — not re-derived in each template.

Exhaustiveness guard:

```ts
default: {
  const _exhaustive: never = state;
  throw new Error(`Unhandled async state: ${JSON.stringify(_exhaustive)}`);
}
```

## 2. React + TanStack Query

| State | Source |
| :--- | :--- |
| `idle` | `enabled: false` / query disabled by missing input |
| `loading` | `status === 'pending'` (v5) / `isLoading` (v4) |
| `refreshing` | `isFetching && !isPending` (or `isPlaceholderData`) |
| `error` | `status === 'error'`, retry with `refetch()` |
| `empty` | success + `isEmpty(data)` |
| `success` | `status === 'success'` with data |

- Cancellation: pass `signal` from the query function context to `fetch`.
- Bounded retry: `retry: 2` (or a predicate excluding 4xx) — never `retry: true` indefinitely.
- Mutations: `useMutation` → `isPending` on the trigger; `onMutate`/`onError` for optimistic write and rollback; `onSettled` invalidate.
- Suspense / error boundaries are acceptable only if the project already uses them consistently; a boundary at page level does not satisfy block-scoped errors.

## 3. React + RTK Query

| State | Source |
| :--- | :--- |
| `idle` | `skip: true` |
| `loading` | `isLoading` (first load) |
| `refreshing` | `isFetching && !isLoading` |
| `error` | `isError` + `error`, retry via `refetch()` |
| `empty` | `isSuccess` + `isEmpty(data)` |
| `success` | `isSuccess` with data |

- Normalize `FetchBaseQueryError | SerializedError` in one shared helper; never render `error` raw.
- Mutations: `[trigger, { isLoading, error }]`; optimistic writes via `updateQueryData` + `patchResult.undo()`.

## 4. React + SWR

- `data === undefined && !error` → `loading`; `isValidating && data` → `refreshing`; `error` → `error` with `mutate()` as retry.
- Disable a request with a `null` key (that is `idle`).
- `shouldRetryOnError` must be bounded via `onErrorRetry`.

## 5. Angular

- Signals-first (v19+): `resource()` / `httpResource()` expose `status`, `value`, `error`, `isLoading` — map directly to the canonical states; branch with `@switch` on a computed status signal.
- RxJS: build one shared operator that wraps a stream into the canonical state object:

```ts
export function toAsyncState<T>(isEmpty: (v: T) => boolean = () => false) {
  return (src$: Observable<T>): Observable<AsyncState<T>> =>
    src$.pipe(
      map(data => ({ status: isEmpty(data) ? 'empty' : 'success', data }) as AsyncState<T>),
      startWith({ status: 'loading' } as AsyncState<T>),
      catchError(error => of({ status: 'error', error } as AsyncState<T>)),
    );
}
```

- Cancellation: `switchMap` for supersede semantics; `takeUntilDestroyed()` for teardown.
- Template: single `@switch` over `state().status`, never nested `*ngIf` chains on separate booleans.
- Errors from `HttpClient` are normalized in one interceptor, not per component.

## 6. Vue

- `@tanstack/vue-query` mirrors the React mapping with refs.
- Hand-rolled composables return one `state` ref shaped as the canonical union, plus a `retry()`.
- Template: `<template v-if>` chain driven by `state.status`, or a shared `<AsyncBlock>` wrapper with named slots per state — prefer the wrapper, it is the reuse point.
- Teardown: `onScopeDispose` / `onUnmounted` aborts the controller.

## 7. Svelte

- Stores holding the canonical union; `{#if}` on `$state.status`.
- `{#await}` covers pending/error only — it does not express `empty` or `refreshing`, so wrap it or avoid it for blocks that need those.

## 8. No framework data layer (hand-rolled fetch)

This is the case that most often produces duplication. Create one shared primitive (hook/composable/service) implementing the canonical union, `AbortController` cancellation, bounded retry, and error normalization; migrate the block being touched to it; note the remaining call sites as follow-up rather than converting the whole codebase silently.

## 9. Shared presentation contract

Aim for three shared components, whatever they are called in the repo:

| Component | Responsibility | Must accept |
| :--- | :--- | :--- |
| Skeleton / placeholder | Occupy the loaded footprint | variant/shape, count, and explicit size |
| ErrorState | Explain and offer recovery | normalized message, `onRetry`, severity, compact/inline variant |
| EmptyState | Explain absence and next step | title, description, optional primary action, icon/illustration |

A wrapper component that takes the state union and the three components as slots (`AsyncBoundary`, `AsyncBlock`, `StatefulSection` — repo naming wins) is the single strongest reuse lever: one place to fix accessibility and layout for every block.

## 10. Accessibility mapping

| Concern | Implementation |
| :--- | :--- |
| Loading region | container `aria-busy="true"`; status node `role="status"` `aria-live="polite"` with text such as "Loading orders" |
| Skeleton decoration | `aria-hidden="true"` on the shapes, so only the status text is announced |
| Error | `role="alert"` (assertive), focus moved to the error container or its retry control |
| Retry | real `<button>`, keyboard reachable, label naming the action ("Retry loading orders") |
| Pending mutation | `aria-disabled` + `aria-describedby` pointing at the reason; keep the control focusable |
| Empty | ordinary heading + text, announced by normal reading order; no live region needed |

## 11. Anti-patterns to reject on sight

- `if (loading) …` / `if (error) …` / `if (!data) …` as three independent checks with no `empty` branch.
- Full-page spinner replacing a page that already has a stable layout.
- `data?.items ?? []` used to paper over a failed request, so failure renders as "no results".
- `catch {}` or `console.error` as the only error handling.
- A spinner defined inline in a feature file while a shared skeleton exists.
- Optimistic update with no rollback.
- `setState` after unmount, or the older response overwriting the newer one.
- Error strings taken straight from the transport layer and shown to the user.
