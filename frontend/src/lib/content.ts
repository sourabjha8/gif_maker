/**
 * Content loader for tour data.
 * Loads and validates the static JSON content file.
 *
 * In v1, content is loaded from a static JSON file in the repo.
 * In v1.5/v2, this will be swapped for an API call.
 */

import contentJson from '../data/virtual-xp-content.json';
import { validateContent, validateContentSafe } from './validation';
import type {
  VirtualXpContent,
  ContentFloor,
  ContentCity,
  ContentProject,
  ContentRoom,
  RoomVariant,
  NavigationData,
  NavCity,
  NavFilterGroupData,
  Room,
  Society,
} from '../types';

// ─── Load & Validate ─────────────────────────────────────────────

let _cachedContent: VirtualXpContent | null = null;

/**
 * Load and validate the tour content.
 * Throws on invalid content (fail-fast in development).
 */
export function loadContent(): VirtualXpContent {
  if (_cachedContent) return _cachedContent;
  _cachedContent = validateContent(contentJson);
  return _cachedContent;
}

/**
 * Safe content loader — returns null and an error string on failure.
 */
export function loadContentSafe(): { content: VirtualXpContent | null; error: string | null } {
  if (_cachedContent) return { content: _cachedContent, error: null };
  const result = validateContentSafe(contentJson);
  if (result.content) {
    _cachedContent = result.content;
    return { content: result.content, error: null };
  }
  return { content: null, error: result.error };
}

// ─── Content Lookup Helpers ──────────────────────────────────────

export function findFloor(content: VirtualXpContent, slug: string): ContentFloor | undefined {
  return content.floors.find((f) => f.slug === slug);
}

export function findCity(floor: ContentFloor, slug: string): ContentCity | undefined {
  return floor.cities.find((c) => c.slug === slug);
}

export function findProject(city: ContentCity, slug: string): ContentProject | undefined {
  return city.projects.find((p) => p.slug === slug);
}

export function findRoom(project: ContentProject, slug: string): ContentRoom | undefined {
  return project.rooms.find((r) => r.slug === slug);
}

/**
 * Find the best matching variant using the fallback algorithm.
 * Reference: FEATURE_SPEC.md §5 - Variant fallback algorithm
 *
 * 1. Score every variant by matching dimensions.
 * 2. Sort by score descending.
 * 3. Use isDefault as final fallback.
 */
export function findBestVariant(
  room: ContentRoom,
  filters?: {
    designStyle?: string;
    moduleType?: string;
    luxuryLevel?: string;
    roomSize?: string;
  }
): RoomVariant | undefined {
  if (!room.variants.length) return undefined;
  if (!filters) return room.variants.find((v) => v.isDefault) ?? room.variants[0];

  const scored = room.variants.map((variant) => {
    let score = 0;
    if (filters.designStyle && variant.designStyle === filters.designStyle) score++;
    if (filters.moduleType && variant.moduleType === filters.moduleType) score++;
    if (filters.luxuryLevel && variant.luxuryLevel === filters.luxuryLevel) score++;
    if (filters.roomSize && variant.roomSize === filters.roomSize) score++;
    return { variant, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // If top score is 0, fall back to isDefault
  if (scored[0].score === 0) {
    return room.variants.find((v) => v.isDefault) ?? room.variants[0];
  }

  return scored[0].variant;
}

// ─── Navigation Catalog Helpers ──────────────────────────────────
// Lookups for the selection-flow screens. These replace the former
// data/cities.ts, projects.ts and rooms.ts constants and read from the
// same validated content source.

export function loadNavigation(): NavigationData {
  return loadContent().navigation;
}

/** Ordered floor labels (e.g. ['1F','2F','3F','4F']). Replaces FLOORS. */
export function getNavFloorLabels(): string[] {
  return loadNavigation().floors.map((f) => f.label);
}

/** City for a floor label. Replaces FLOOR_CITY_MAP[label]. */
export function getNavCityByFloor(label: string): NavCity | undefined {
  return loadNavigation().floors.find((f) => f.label === label)?.city;
}

/** City (with societies) by display name. Replaces PROJECTS_DATA[cityName]. */
export function getNavCityByName(name: string): NavCity | undefined {
  return loadNavigation().floors.find((f) => f.city.name === name)?.city;
}

/** Default city name. Replaces DEFAULT_CITY. */
export function getDefaultCityName(): string {
  return loadNavigation().defaultCity;
}

/** Rooms for the city-flow room grid. Replaces ROOMS. */
export function getNavRooms(): Room[] {
  return loadNavigation().rooms;
}

/** Room types for the design flow. Replaces ROOM_TYPES. */
export function getNavRoomTypes(): Room[] {
  return loadNavigation().roomTypes;
}

/** Design-flow filter groups (data only; icons mapped in the screen). Replaces FILTER_GROUPS. */
export function getFilterGroups(): NavFilterGroupData[] {
  return loadNavigation().filterGroups;
}

/** Default filter selections. Replaces DEFAULT_FILTERS. */
export function getDefaultFilters(): Record<string, string> {
  return loadNavigation().defaultFilters;
}

/** Default society fallback. Replaces DEFAULT_SOCIETY. */
export function getDefaultSociety(): Society {
  return loadNavigation().defaultSociety;
}

// ─── Design-flow Filter Matching ─────────────────────────────────
// The pre-tour filter step uses a decorative taxonomy (design/module/luxury/
// size ids, Title-Case values) so it reads well before any project data is
// loaded. Real room variants tag themselves with a different, lowercase
// vocabulary (see RoomVariant in src/types/tour.ts). These tables map one to
// the other so filters chosen in the UI can be matched against real variants.
const FILTER_VALUE_MAP: Record<string, Record<string, string>> = {
  design: { Modern: 'modern', Classic: 'classic', Industrial: 'industrial', Minimalist: 'minimalist' },
  module: { Standard: 'standard', Premium: 'modular', Custom: 'custom' },
  luxury: { Gold: 'essential', Platinum: 'premium', Diamond: 'signature' },
  size: { '10x12 ft': 'small', '12x14 ft': 'medium', '15x18 ft': 'large' },
};

const FILTER_GROUP_TO_VARIANT_FIELD: Record<string, keyof RoomVariant> = {
  design: 'designStyle',
  module: 'moduleType',
  luxury: 'luxuryLevel',
  size: 'roomSize',
};

/** Translates Title-Case filter-bar selections into the lowercase RoomVariant field values used for tour matching. */
export function mapFilterSelectionsToRoomFilters(selections: Record<string, string>): Record<string, string> {
  const filters: Record<string, string> = {};
  for (const [groupId, value] of Object.entries(selections)) {
    const field = FILTER_GROUP_TO_VARIANT_FIELD[groupId];
    const mapped = field && FILTER_VALUE_MAP[groupId]?.[value];
    if (field && mapped) filters[field] = mapped;
  }
  return filters;
}

// The design flow always targets this single pilot project — same hardcoded
// slugs the flow already navigates to on "Explore Design" (see app/room-type
// & app/room-filter). Centralized here so filter-matching and navigation
// stay in sync.
const DESIGN_FLOW_FLOOR_SLUG = '1f';
const DESIGN_FLOW_CITY_SLUG = 'mumbai';
const DESIGN_FLOW_PROJECT_SLUG = 'seabreeze-residences';

function getDesignFlowProject(): ContentProject | undefined {
  const content = loadContent();
  const floor = findFloor(content, DESIGN_FLOW_FLOOR_SLUG);
  const city = floor && findCity(floor, DESIGN_FLOW_CITY_SLUG);
  return city && findProject(city, DESIGN_FLOW_PROJECT_SLUG);
}

/** The real ContentRoom (with variants) backing a design-flow room-type id, if any. */
export function getDesignFlowRoom(roomTypeId: string): ContentRoom | undefined {
  const project = getDesignFlowProject();
  return project && findRoom(project, roomTypeId);
}

/**
 * Every real room slug/name in the design-flow's pilot project — the fixed,
 * known set an estimate item's room can be reassigned to (e.g. from the
 * cart's room-edit picker), rather than an open-ended free-text field.
 */
export function getDesignFlowRoomList(): { slug: string; name: string }[] {
  const project = getDesignFlowProject();
  return project?.rooms.map((r) => ({ slug: r.slug, name: r.name })) ?? [];
}

// ─── Variant Facets (multi-select filtering) ─────────────────────
// The refine screen filters the real room-design variants directly by their
// own attributes, so the filter options are derived from the actual data
// rather than the decorative navigation.filterGroups taxonomy.

export type VariantFacetKey = 'designStyle' | 'moduleType' | 'luxuryLevel' | 'roomSize';

export interface VariantFacet {
  key: VariantFacetKey;
  label: string;
  /** Raw lowercase option values present in the data, in display order. */
  options: string[];
}

/** Facet display labels, in the order they should appear in the UI. */
const VARIANT_FACET_LABELS: { key: VariantFacetKey; label: string }[] = [
  { key: 'designStyle', label: 'Style' },
  { key: 'moduleType', label: 'Package' },
  { key: 'luxuryLevel', label: 'Grade' },
  { key: 'roomSize', label: 'Room Size' },
];

/** Preferred value ordering for facets that read as a scale rather than a list. */
const FACET_VALUE_ORDER: Partial<Record<VariantFacetKey, string[]>> = {
  moduleType: ['standard', 'modular', 'custom'],
  luxuryLevel: ['essential', 'premium', 'signature'],
  roomSize: ['small', 'medium', 'large'],
};

function sortFacetValues(key: VariantFacetKey, values: string[]): string[] {
  const order = FACET_VALUE_ORDER[key];
  return [...values].sort((a, b) => {
    if (order) {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }
    return a.localeCompare(b);
  });
}

/** All variants of a design-flow room type (empty if it has no content data). */
export function getRoomVariants(roomTypeId: string): RoomVariant[] {
  return getDesignFlowRoom(roomTypeId)?.variants ?? [];
}

/** Facets (with the real option values) available for a design-flow room type. */
export function getRoomVariantFacets(roomTypeId: string): VariantFacet[] {
  const variants = getRoomVariants(roomTypeId);
  if (!variants.length) return [];
  return VARIANT_FACET_LABELS.map(({ key, label }) => {
    const values = new Set<string>();
    variants.forEach((v) => {
      const val = v[key];
      if (val) values.add(val);
    });
    return { key, label, options: sortFacetValues(key, Array.from(values)) };
  }).filter((f) => f.options.length > 0);
}

/**
 * Variants matching a multi-select facet query. Within a facet, any selected
 * value matches (OR); across facets, all must match (AND). Facets with no
 * selection are wildcards, so an empty query returns every variant.
 */
export function filterRoomVariants(
  roomTypeId: string,
  selections: Partial<Record<VariantFacetKey, string[]>>,
): RoomVariant[] {
  const variants = getRoomVariants(roomTypeId);
  const active = (Object.entries(selections) as [VariantFacetKey, string[] | undefined][])
    .filter((entry): entry is [VariantFacetKey, string[]] => Boolean(entry[1]?.length));
  if (active.length === 0) return variants;
  return variants.filter((v) =>
    active.every(([key, vals]) => {
      const val = v[key];
      return val != null && vals.includes(val);
    }),
  );
}

// ─── URL Slug Helpers ────────────────────────────────────────────
// Nav cities/societies are stored by display name; URLs need slugs.
// We derive slugs from names so no extra data is required. The derived
// city/society slugs intentionally line up with the tour content slugs
// (e.g. "Bangalore" -> "bangalore", "Prestige Kingfisher Towers" ->
// "prestige-kingfisher-towers"), which is what lets the dolly flow hand
// off into the real tour route.

/** Convert a display name to a URL-safe kebab-case slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Resolve a nav city by its slugified name. */
export function getNavCityBySlug(slug: string): NavCity | undefined {
  return loadNavigation().floors.find((f) => slugify(f.city.name) === slug)?.city;
}

/** Resolve a society within a city by their slugified names. */
export function getNavSocietyBySlug(citySlug: string, societySlug: string): Society | undefined {
  return getNavCityBySlug(citySlug)?.societies.find((s) => slugify(s.name) === societySlug);
}
