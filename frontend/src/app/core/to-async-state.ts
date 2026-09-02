import { Observable, OperatorFunction, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

import { AsyncState } from './async-state';
import { normalizeHttpError } from './http-error';

/**
 * The shared async primitive: turn a one-shot request into the canonical
 * state stream.
 *
 * Use this for every network-backed block. Do not hand-roll loading or error
 * flags beside a subscription — that is the duplication this exists to
 * prevent, and two blocks solving it two ways is a defect in itself.
 *
 * Emptiness is derived here, once, from a successful response, so no template
 * re-derives it and no block can disagree about what "no results" means.
 *
 * Cancellation is the caller's job: drive the source through `switchMap` from
 * the trigger, so a superseded request cannot land after a newer one.
 */

export interface ToAsyncStateOptions<T> {
  /**
   * Data already on screen. Present means this is a revalidation, so the
   * stream opens on `refreshing` and the old data stays visible instead of
   * being replaced by a skeleton.
   */
  previous?: T | null;
  /**
   * Whether a successful response counts as empty. Defaults to "an empty
   * array, or nothing at all". Override for wrapped payloads, for example
   * `data => data.days.length === 0`.
   */
  isEmpty?: (data: T) => boolean;
}

export function toAsyncState<T>(
  options: ToAsyncStateOptions<T> = {}
): OperatorFunction<T, AsyncState<T>> {
  const { previous = null, isEmpty = defaultIsEmpty } = options;

  const opening: AsyncState<T> =
    previous === null ? { status: 'loading' } : { status: 'refreshing', data: previous };

  return (source: Observable<T>) =>
    source.pipe(
      map((data): AsyncState<T> => settle(data, isEmpty)),
      catchError((cause): Observable<AsyncState<T>> =>
        of({ status: 'error', error: normalizeHttpError(cause) })
      ),
      startWith(opening)
    );
}

/** Classify a successful response as `empty` or `success`. */
function settle<T>(data: T, isEmpty: (data: T) => boolean): AsyncState<T> {
  return isEmpty(data) ? { status: 'empty' } : { status: 'success', data };
}

function defaultIsEmpty(data: unknown): boolean {
  if (data === null || data === undefined) {
    return true;
  }
  return Array.isArray(data) && data.length === 0;
}
