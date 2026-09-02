/**
 * The canonical async state model for this application.
 *
 * Every UI block whose content depends on a remote call resolves to exactly
 * one of these. One discriminated value drives the UI, so contradictory
 * combinations such as "loading and error at the same time" are not
 * representable rather than merely unlikely.
 *
 * See `.claude/rules/network-state-ui.md` for the doctrine this implements.
 *
 * Deviation from the reference model in
 * `.claude/skills/implement-network-state-ui/REFERENCE.md`: the `error` state
 * carries no `retry` callback. Retry is an action owned by the component that
 * holds the request trigger, not data owned by the state, which keeps this
 * type serializable and comparable. Components expose retry through the
 * `(retry)` output of `<app-error-state>`.
 */

/** A failure normalized into something a person can act on. */
export interface AppError {
  /** Stable machine-readable code, from the API envelope where available. */
  code: string;
  /** Message written for the person reading the screen. */
  message: string;
  /** HTTP status, when the failure came from a response. */
  status?: number;
}

export type AsyncState<T, E = AppError> =
  /** Not started — lazy, or gated by input. Never renders a spinner. */
  | { status: 'idle' }
  /** First load, no data yet. Renders a skeleton in the loaded footprint. */
  | { status: 'loading' }
  /** Data on screen, revalidating. Data stays visible. */
  | { status: 'refreshing'; data: T }
  /** Failed. Renders a normalized message and a retry, scoped to the block. */
  | { status: 'error'; error: E }
  /** Succeeded with zero results. Neither loading nor error. */
  | { status: 'empty' }
  /** Succeeded with data. */
  | { status: 'success'; data: T };

/** Every status this application's blocks can be in. */
export type AsyncStatus = AsyncState<unknown>['status'];

export const IDLE: AsyncState<never> = { status: 'idle' };
export const LOADING: AsyncState<never> = { status: 'loading' };
export const EMPTY: AsyncState<never> = { status: 'empty' };

/**
 * Compile-time exhaustiveness guard.
 *
 * Put it on the default branch of every switch over `AsyncState`. Adding a
 * state to the union then fails the build at every site that does not handle
 * it, which is the point: an unhandled state must not be reachable at
 * runtime.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled async state: ${JSON.stringify(value)}`);
}

/** True while a block is waiting on the network, first load or revalidation. */
export function isPending<T>(state: AsyncState<T>): boolean {
  return state.status === 'loading' || state.status === 'refreshing';
}

/** The data a state carries, or null when it carries none. */
export function dataOf<T>(state: AsyncState<T>): T | null {
  return state.status === 'success' || state.status === 'refreshing' ? state.data : null;
}
