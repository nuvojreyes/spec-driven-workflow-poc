import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AsyncState } from '../core/async-state';
import { toAsyncState } from '../core/to-async-state';
import { CitiesResponse, CityConditions, CurrentWeather } from './weather.model';

/**
 * The data layer for weather blocks.
 *
 * Every method returns `Observable<AsyncState<T>>` through `toAsyncState`.
 * Components map state to output and own nothing else — no loading flags, no
 * error strings, no second copy of fetched data.
 *
 * Available endpoints:
 *   GET /api/cities/            -> CitiesResponse
 *   GET /api/weather/<slug>/    -> CurrentWeather
 *   GET /api/forecast/<slug>/   -> Forecast        (live, not consumed yet)
 */
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * The featured-cities block: the city list, then current conditions for
   * each, as one block with one state.
   *
   * Pass `previous` when revalidating so the stream opens on `refreshing`
   * and the cards already on screen stay put.
   */
  featuredConditions$(
    previous: CityConditions[] | null = null
  ): Observable<AsyncState<CityConditions[]>> {
    return this.http
      .get<CitiesResponse>(`${this.baseUrl}/cities/`, { params: this.demoLevers() })
      .pipe(
        switchMap(({ cities }) =>
          // forkJoin over an empty array never emits, so short-circuit. An
          // empty city list is a successful response with no results, and
          // toAsyncState turns it into `empty`.
          cities.length === 0
            ? of<CityConditions[]>([])
            : forkJoin(cities.map((city) => this.conditionsFor(city.slug)))
        ),
        toAsyncState({ previous })
      );
  }

  private conditionsFor(slug: string): Observable<CityConditions> {
    return this.http
      .get<CurrentWeather>(`${this.baseUrl}/weather/${slug}/`, { params: this.demoLevers() })
      .pipe(map((current) => ({ slug, current })));
  }

  /**
   * Forward the backend's demo levers from the page URL to the API.
   *
   * Opening the app at `?delay=3` or `?fail=1` reaches every canonical state
   * without touching code — see the levers in `backend/api/views.py`. This
   * exists for the PoC; a production client would not forward arbitrary
   * query params, which is why only these two are read by name.
   */
  private demoLevers(): HttpParams {
    let params = new HttpParams();
    const search = new URLSearchParams(window.location.search);

    for (const lever of ['delay', 'fail'] as const) {
      const value = search.get(lever);
      if (value !== null) {
        params = params.set(lever, value);
      }
    }

    return params;
  }
}
