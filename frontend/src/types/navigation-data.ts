/**
 * Navigation catalog types.
 *
 * Validated data for the selection-flow screens (location / project /
 * room / room-type / room-filter). Previously hardcoded in
 * data/cities.ts, projects.ts and rooms.ts; now part of the single
 * validated content source (virtual-xp-content.json -> `navigation`).
 *
 * These reuse the existing City / Society / Room domain types so the
 * card components keep accepting them unchanged.
 */

import type { City } from './city';
import type { Society } from './project';
import type { Room } from './room';

/** A city plus its societies (merges the old FLOOR_CITY_MAP + PROJECTS_DATA entries). */
export interface NavCity extends City {
  societies: Society[];
}

/** One floor of the experience center, mapped to a single city. */
export interface NavFloor {
  label: string;
  city: NavCity;
}

/**
 * Design-flow filter group data. The icon component is resolved by `id`
 * in the screen (components cannot live in JSON).
 */
export interface NavFilterGroupData {
  id: string;
  label: string;
  options: string[];
}

/** The full navigation catalog + design-flow config. */
export interface NavigationData {
  defaultCity: string;
  floors: NavFloor[];
  rooms: Room[];
  roomTypes: Room[];
  filterGroups: NavFilterGroupData[];
  defaultFilters: Record<string, string>;
  defaultSociety: Society;
}
