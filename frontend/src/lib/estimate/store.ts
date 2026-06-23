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
import type { EstimateItem, EstimateRoomGroup, EstimateSummary } from '../../types';

interface EstimateState {
  items: EstimateItem[];
  isOpen: boolean;
  // Mutators
  addItem: (item: EstimateItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
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

      clear: () => set({ items: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'vxp-estimate-v2',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({ items: state.items }) as Partial<EstimateState>,
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
