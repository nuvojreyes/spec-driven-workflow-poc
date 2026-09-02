/** Wire contracts for the weather API. Field names carry their units. */

export interface City {
  slug: string;
  name: string;
  country: string;
}

/** `GET /api/weather/<slug>/` */
export interface CurrentWeather {
  city: string;
  country: string;
  heroImage: string;
  temperatureF: number;
  status: string;
  feelsLikeF: number;
  windMph: number;
  humidityPct: number;
  highF: number;
  lowF: number;
  cloudCoveragePct: number;
}

/** One city's conditions, keyed back to the slug that produced them. */
export interface CityConditions {
  slug: string;
  current: CurrentWeather;
}

/**
 * `GET /api/forecast/<slug>/`
 *
 * The contract exists and the endpoint is live, but no UI block consumes it
 * yet. Note that `days` can come back empty for a known city — the API
 * answers successfully with no results, which is its own state.
 */
export interface ForecastDay {
  day: string;
  highF: number;
  lowF: number;
  status: string;
  precipitationPct: number;
}

export interface Forecast {
  city: string;
  days: ForecastDay[];
}

/** `GET /api/cities/` */
export interface CitiesResponse {
  cities: City[];
}
