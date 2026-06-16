/**
 * Project / Society domain types.
 * A "society" is a real-estate project within a city.
 */

export interface Society {
  name: string;
  bhk: string;
  address: string;
  logo: string;
}

/** City-level project data grouping societies under a city. */
export interface CityProjectData {
  cityName: string;
  cityNameHindi: string;
  state: string;
  country: string;
  societies: Society[];
}

/** Maps city name to its project data. */
export type CityProjectMap = Record<string, CityProjectData>;
