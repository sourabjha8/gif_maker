/**
 * City domain types.
 * Represents a city within a floor of the experience center.
 */

export interface City {
  name: string;
  nameHindi: string;
  state: string;
  country: string;
  projectCount: number;
  tags: string[];
  image: string;
}

/** Maps a floor label (e.g. '1F') to its associated city. */
export type FloorCityMap = Record<string, City>;
