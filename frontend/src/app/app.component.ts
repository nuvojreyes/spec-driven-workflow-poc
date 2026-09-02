import { Component, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AsyncState, assertNever, dataOf, isPending } from './core/async-state';
import { CityConditions, CurrentWeather } from './weather/weather.model';
import { WeatherService } from './weather/weather.service';

/** What caused the current request. `refresh` keeps the old data on screen. */
type Trigger = 'initial' | 'retry' | 'refresh';

/**
 * The featured-cities block.
 *
 * This is the reference implementation of the network-state doctrine in
 * `.claude/rules/network-state-ui.md`, and the template any new
 * network-backed block in this project should follow:
 *
 * - one `AsyncState` value drives the UI; there are no loading or error flags
 * - the state comes from the shared primitive `toAsyncState`, via
 *   `WeatherService`; this component fetches nothing itself
 * - `loading`, `error` and `empty` render through the shared components in
 *   `app/shared/`, never through local spinners or inline error strings
 * - `switchMap` drops superseded requests, so a slow first response cannot
 *   land on top of a newer one
 * - `announce()` switches exhaustively over the union, so adding a state to
 *   `AsyncState` breaks the build here until it is handled
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  private readonly weather = inject(WeatherService);

  private readonly trigger$ = new BehaviorSubject<Trigger>('initial');
  private readonly destroyed$ = new Subject<void>();

  /** Last successfully loaded data, so a refresh can revalidate in place. */
  private loaded: CityConditions[] | null = null;

  /** Slug of the city shown in the hero panel. */
  activeSlug: string | null = null;

  readonly state$: Observable<AsyncState<CityConditions[]>> = this.trigger$.pipe(
    switchMap((trigger) =>
      this.weather.featuredConditions$(trigger === 'refresh' ? this.loaded : null)
    ),
    tap((state) => this.remember(state)),
    takeUntil(this.destroyed$),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Keep the last successful payload, so a refresh can revalidate in place,
   * and keep the hero selection pointing at a city that still exists.
   *
   * This is the one permitted copy of fetched data: it feeds the `previous`
   * argument of the next request, not the template. The template always
   * reads from the state.
   */
  private remember(state: AsyncState<CityConditions[]>): void {
    if (state.status !== 'success') {
      return;
    }

    this.loaded = state.data;

    const stillPresent = state.data.some((entry) => entry.slug === this.activeSlug);
    if (!stillPresent) {
      this.activeSlug = state.data[0]?.slug ?? null;
    }
  }

  /** Ask for the data again after a failure. Explicit and one attempt only. */
  retry(): void {
    this.trigger$.next('retry');
  }

  /** Revalidate with data on screen — drives the `refreshing` state. */
  refresh(): void {
    this.trigger$.next('refresh');
  }

  select(slug: string): void {
    this.activeSlug = slug;
  }

  /** The city the hero panel shows, from data already loaded. */
  activeOf(conditions: CityConditions[]): CityConditions {
    return conditions.find((entry) => entry.slug === this.activeSlug) ?? conditions[0];
  }

  /**
   * The live-region message for the block.
   *
   * The `default` branch is the compile-time exhaustiveness guard: add a
   * state to `AsyncState` and this stops compiling until it is handled. Try
   * it — delete a case and run `npm run build`.
   */
  announce(state: AsyncState<CityConditions[]>): string {
    switch (state.status) {
      case 'idle':
        return 'Weather has not been requested yet.';
      case 'loading':
        return 'Loading weather for the featured cities.';
      case 'refreshing':
        return 'Updating weather in the background. Current readings are still shown.';
      case 'error':
        return `Weather could not be loaded. ${state.error.message}`;
      case 'empty':
        return 'No cities are available right now.';
      case 'success':
        return `Weather loaded for ${state.data.length} cities.`;
      default:
        return assertNever(state);
    }
  }

  /**
   * Hero backdrop for whichever city is active, or a plain wash while there
   * is no data. The gradient carries the look on its own, so a hero image
   * that fails to load degrades instead of breaking the section.
   */
  heroBackdrop(state: AsyncState<CityConditions[]>): Record<string, string> {
    const wash = 'linear-gradient(180deg, rgba(7, 17, 31, 0.2), rgba(7, 17, 31, 0.76))';
    const conditions = dataOf(state);
    const image = conditions ? this.activeOf(conditions).current.heroImage : '';

    return { '--hero-backdrop': image ? `${wash}, url('${image}')` : wash };
  }

  /** Exposed for `aria-busy`; the shared helper decides what pending means. */
  pending(state: AsyncState<CityConditions[]>): boolean {
    return isPending(state);
  }

  degrees(value: number): string {
    return `${Math.round(value)}°F`;
  }

  wind(value: number): string {
    return `${Math.round(value)} mph`;
  }

  percent(value: number): string {
    return `${Math.round(value)}%`;
  }

  /** Stable identity for the card list, so switching city keeps DOM nodes. */
  trackBySlug(_index: number, entry: CityConditions): string {
    return entry.slug;
  }

  /** Placeholder cards drawn while loading, matching the loaded card count. */
  readonly skeletonCards = [0, 1, 2, 3, 4];

  /** Narrowing helper for templates, which cannot narrow a union themselves. */
  conditionsOf(state: AsyncState<CityConditions[]>): CurrentWeather | null {
    const conditions = dataOf(state);
    return conditions ? this.activeOf(conditions).current : null;
  }
}
