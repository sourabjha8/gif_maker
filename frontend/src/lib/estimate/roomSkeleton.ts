/**
 * Room-skeleton generation for a resolved unit, and the logic that maps
 * cart items (still carrying tour room slugs, or already reassigned to a
 * skeleton room key) onto that skeleton.
 *
 * Reference: EstimateSidebar "design scope" restructure.
 */

import type { EstimateItem, RoomCategory, ScopeRoom } from '../../types/estimate';
import { UNASSIGNED_ROOM_KEY } from '../../types/estimate';

/** Physical walkthrough order — living first, utility/balcony last. */
export const ROOM_CATEGORY_ORDER: RoomCategory[] = ['living', 'bedroom', 'kitchen', 'washroom', 'balcony'];

const CATEGORY_LABEL: Record<RoomCategory, string> = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  washroom: 'Washroom',
  balcony: 'Balcony',
};

function nameForIndex(category: RoomCategory, index: number, totalInCategory: number): string {
  const label = CATEGORY_LABEL[category];
  return totalInCategory > 1 ? `${label} ${index}` : label;
}

/**
 * Builds the initial room list for a unit, from its BHK type (e.g. "2BHK").
 * Convention: one living room, one bedroom per BHK count, one kitchen,
 * one washroom per bedroom, one balcony.
 */
export function generateRoomSkeleton(bhkType: string): ScopeRoom[] {
  const bedroomCount = Math.max(1, parseInt(bhkType, 10) || 1);
  const washroomCount = bedroomCount;
  const rooms: ScopeRoom[] = [];

  rooms.push({ key: 'living-1', name: nameForIndex('living', 1, 1), category: 'living' });
  for (let i = 1; i <= bedroomCount; i++) {
    rooms.push({ key: `bedroom-${i}`, name: nameForIndex('bedroom', i, bedroomCount), category: 'bedroom' });
  }
  rooms.push({ key: 'kitchen-1', name: nameForIndex('kitchen', 1, 1), category: 'kitchen' });
  for (let i = 1; i <= washroomCount; i++) {
    rooms.push({ key: `washroom-${i}`, name: nameForIndex('washroom', i, washroomCount), category: 'washroom' });
  }
  rooms.push({ key: 'balcony-1', name: nameForIndex('balcony', 1, 1), category: 'balcony' });

  return rooms;
}

/** Sorts rooms by physical walkthrough order, then by their index within that category. */
export function sortRooms(rooms: ScopeRoom[]): ScopeRoom[] {
  return [...rooms].sort((a, b) => {
    const catDiff = ROOM_CATEGORY_ORDER.indexOf(a.category) - ROOM_CATEGORY_ORDER.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return a.key.localeCompare(b.key, undefined, { numeric: true });
  });
}

/** Next auto-numbered room for "add another {category}" / "add {category}". */
export function nextRoomInCategory(rooms: ScopeRoom[], category: RoomCategory): ScopeRoom {
  const existing = rooms.filter((r) => r.category === category);
  const usedIndices = existing.map((r) => parseInt(r.key.split('-').pop() ?? '0', 10) || 0);
  const nextIndex = (usedIndices.length > 0 ? Math.max(...usedIndices) : 0) + 1;
  const totalAfterAdd = existing.length + 1;
  // Renaming isn't retroactive — only the label for the newly added room is
  // computed against the post-add count, existing rooms keep their names.
  return {
    key: `${category}-${nextIndex}`,
    name: nameForIndex(category, nextIndex, Math.max(totalAfterAdd, nextIndex)),
    category,
  };
}

/** Best-effort category guess for a raw tour room slug, e.g. "master-bedroom" -> "bedroom". */
export function categorizeTourRoomSlug(slug: string): RoomCategory | null {
  const s = slug.toLowerCase();
  if (s.includes('living')) return 'living';
  if (s.includes('bedroom')) return 'bedroom';
  if (s.includes('kitchen')) return 'kitchen';
  if (s.includes('bath') || s.includes('washroom') || s.includes('toilet')) return 'washroom';
  if (s.includes('balcony') || s.includes('utility')) return 'balcony';
  return null;
}

/**
 * Deterministically maps each distinct tour room slug found in `items` to a
 * skeleton room key, in order of first appearance, filling each category's
 * slots in skeleton order. A slug whose category has no free slot left (or
 * no matching category at all) maps to `UNASSIGNED_ROOM_KEY`.
 */
export function buildCategoryAssignment(items: EstimateItem[], rooms: ScopeRoom[]): Map<string, string> {
  const assignment = new Map<string, string>();
  const roomKeySet = new Set(rooms.map((r) => r.key));
  const roomsByCategory = new Map<RoomCategory, ScopeRoom[]>();
  for (const category of ROOM_CATEGORY_ORDER) {
    roomsByCategory.set(category, rooms.filter((r) => r.category === category));
  }
  const slotsUsed = new Map<RoomCategory, number>();

  for (const item of items) {
    const slug = item.roomSlug;
    if (roomKeySet.has(slug) || slug === UNASSIGNED_ROOM_KEY || assignment.has(slug)) continue;

    const category = categorizeTourRoomSlug(slug);
    if (!category) {
      assignment.set(slug, UNASSIGNED_ROOM_KEY);
      continue;
    }
    const roomsOfCategory = roomsByCategory.get(category) ?? [];
    const usedCount = slotsUsed.get(category) ?? 0;
    if (usedCount < roomsOfCategory.length) {
      assignment.set(slug, roomsOfCategory[usedCount].key);
      slotsUsed.set(category, usedCount + 1);
    } else {
      assignment.set(slug, UNASSIGNED_ROOM_KEY);
    }
  }

  return assignment;
}

/** Resolves the skeleton room key (or UNASSIGNED_ROOM_KEY) an item currently belongs to. */
export function resolveItemRoomKey(
  item: EstimateItem,
  rooms: ScopeRoom[],
  categoryAssignment: Map<string, string>,
): string {
  if (rooms.some((r) => r.key === item.roomSlug)) return item.roomSlug;
  if (item.roomSlug === UNASSIGNED_ROOM_KEY) return UNASSIGNED_ROOM_KEY;
  return categoryAssignment.get(item.roomSlug) ?? UNASSIGNED_ROOM_KEY;
}
