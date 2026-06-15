/**
 * Content loader for tour data.
 * Loads and validates the static JSON content file.
 *
 * In v1, content is loaded from a static JSON file in the repo.
 * In v1.5/v2, this will be swapped for an API call.
 */

import contentJson from '../data/virtual-xp-content.json';
import { validateContent, validateContentSafe } from './validation';
import type { VirtualXpContent, ContentFloor, ContentCity, ContentProject, ContentRoom, RoomVariant } from '../types';

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
