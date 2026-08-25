/**
 * Client-side estimate / cart store.
 * Reference: BUILD_PLAN.md §9 - Estimate/cart plan
 *
 * Rules:
 * - Snapshot normalized price when adding.
 * - Quantity cannot go below 1.
 * - Persist to localStorage so a designer's estimate survives a refresh.
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EstimateItem, EstimateRoomGroup, EstimateSummary, ResolvedProject, RoomCategory, ScopeRoom } from '../../types';
import { UNASSIGNED_ROOM_KEY } from '../../types';
import { buildCategoryAssignment, generateRoomSkeleton, nextRoomInCategory, resolveItemRoomKey, sortRooms } from './roomSkeleton';

interface EstimateState {
  items: EstimateItem[];
  isOpen: boolean;
  /** Set once an INCO id / unit is resolved via the quotation search. */
  resolvedProject: ResolvedProject | null;
  /** The resolved unit's room skeleton — empty until a project is resolved. */
  rooms: ScopeRoom[];
  // Mutators
  addItem: (item: EstimateItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setItemRoom: (id: string, roomSlug: string) => void;
  resolveProject: (project: ResolvedProject) => void;
  /** Drops back to the default, unresolved flat-cart UI. Items are kept. */
  clearResolvedProject: () => void;
  /** Designer override of the resolved unit's BHK — regenerates the room skeleton. */
  setBhkType: (bhkType: string) => void;
  addRoom: (category: RoomCategory) => void;
  /** Removing a room never deletes its items — they move to Unassigned. */
  removeRoom: (roomKey: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useEstimateStore = create<EstimateState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      resolvedProject: null,
      rooms: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.max(1, item.quantity || 1) }] };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        })),

      setItemRoom: (id, roomSlug) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, roomSlug } : i)),
        })),

      // A resolved unit always gets a fresh skeleton for its own BHK config —
      // a room list customized for a previous unit shouldn't carry over.
      resolveProject: (project) =>
        set({
          resolvedProject: project,
          rooms: generateRoomSkeleton(project.bhkType),
        }),

      clearResolvedProject: () => set({ resolvedProject: null, rooms: [] }),

      // Regenerates the skeleton from scratch for the new BHK — any manual
      // add/remove customization is superseded, same as the initial
      // resolution. Items aren't touched: they're re-categorized against the
      // new room list live (see resolveItemRoomKey), so shrinking the count
      // pushes overflow to Unassigned and growing it can pull items back out.
      setBhkType: (bhkType) =>
        set((state) =>
          state.resolvedProject
            ? { resolvedProject: { ...state.resolvedProject, bhkType }, rooms: generateRoomSkeleton(bhkType) }
            : {},
        ),

      addRoom: (category) =>
        set((state) => ({ rooms: [...state.rooms, nextRoomInCategory(state.rooms, category)] })),

      removeRoom: (roomKey) =>
        set((state) => {
          const categoryAssignment = buildCategoryAssignment(state.items, state.rooms);
          const items = state.items.map((item) => {
            const currentKey = resolveItemRoomKey(item, state.rooms, categoryAssignment);
            return currentKey === roomKey ? { ...item, roomSlug: UNASSIGNED_ROOM_KEY } : item;
          });
          return { items, rooms: state.rooms.filter((r) => r.key !== roomKey) };
        }),

      clear: () => set({ items: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'vxp-estimate-v2',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage))),
      partialize: (state) =>
        ({ items: state.items, resolvedProject: state.resolvedProject, rooms: state.rooms }) as Partial<EstimateState>,
      // Skip rehydration on server / first SSR pass so the snapshot used during
      // hydration is identical to the one rendered on the server. We rehydrate
      // manually on the client below — this avoids React 19's
      // "getSnapshot should be cached" warning when persist swaps the items
      // array reference mid-render on initial mount.
      skipHydration: true,
    },
  ),
);

if (typeof window !== 'undefined') {
  // Rehydrate after the module is first evaluated in the browser.
  void useEstimateStore.persist.rehydrate();
}

/** Group items by room and compute totals from price snapshots. */
export function selectEstimateSummary(items: EstimateItem[]): EstimateSummary {
  const groupMap = new Map<string, EstimateRoomGroup>();
  let grandTotalMinor = 0;

  for (const item of items) {
    const group = groupMap.get(item.roomSlug) ?? {
      roomSlug: item.roomSlug,
      roomLabel: item.roomSlug,
      items: [],
      subtotalMinor: 0,
    };
    const lineTotal = (item.priceSnapshot?.totalMinor ?? 0) * item.quantity;
    group.items.push(item);
    group.subtotalMinor += lineTotal;
    groupMap.set(item.roomSlug, group);
    grandTotalMinor += lineTotal;
  }

  return {
    groups: Array.from(groupMap.values()),
    grandTotalMinor,
    currency: 'INR',
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export interface DesignScopeRoomGroup {
  room: ScopeRoom;
  items: EstimateItem[];
  subtotalMinor: number;
}

export interface DesignScope {
  unassignedItems: EstimateItem[];
  unassignedSubtotalMinor: number;
  roomGroups: DesignScopeRoomGroup[];
}

/**
 * Groups items onto the resolved unit's room skeleton. Every skeleton room
 * is present in `roomGroups` even with zero items — an empty room is a
 * coverage gap to surface, not a row to omit. Items that don't resolve to
 * any current room land in `unassignedItems`, never dropped.
 */
export function selectDesignScope(items: EstimateItem[], rooms: ScopeRoom[]): DesignScope {
  const categoryAssignment = buildCategoryAssignment(items, rooms);
  const roomGroups: DesignScopeRoomGroup[] = sortRooms(rooms).map((room) => ({
    room,
    items: [],
    subtotalMinor: 0,
  }));
  const groupByKey = new Map(roomGroups.map((g) => [g.room.key, g]));
  const unassignedItems: EstimateItem[] = [];
  let unassignedSubtotalMinor = 0;

  for (const item of items) {
    const lineTotal = (item.priceSnapshot?.totalMinor ?? 0) * item.quantity;
    const key = resolveItemRoomKey(item, rooms, categoryAssignment);
    const group = groupByKey.get(key);
    if (group) {
      group.items.push(item);
      group.subtotalMinor += lineTotal;
    } else {
      unassignedItems.push(item);
      unassignedSubtotalMinor += lineTotal;
    }
  }

  return { unassignedItems, unassignedSubtotalMinor, roomGroups };
}
