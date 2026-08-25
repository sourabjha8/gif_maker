/**
 * Estimate / Cart types.
 * Defines the shape of items stored in the client-side estimate.
 *
 * Reference: BUILD_PLAN.md §9 - Estimate/cart plan
 */

import type { NormalizedPrice } from './pricing';

export interface EstimateItem {
  id: string;
  source: 'hotspot' | 'room' | 'layer-option';
  projectSlug: string;
  roomSlug: string;
  variantSlug: string;
  label: string;
  moduleCode?: string;
  sku?: string;
  quantity: number;
  /** Snapshot of the normalized price at the time of adding. */
  priceSnapshot?: NormalizedPrice;
  addedAt: string;
}

/** A physical unit resolved from the CRM/project lookup (e.g. by INCO id). */
export interface ResolvedProject {
  id: string;
  name: string;
  tower: string;
  unit: string;
  bhkType: string;
  incoId: string;
  society: string;
}

/** Physical room category — drives both sort order and skeleton generation. */
export type RoomCategory = 'living' | 'bedroom' | 'kitchen' | 'washroom' | 'balcony';

/** A room slot in the resolved unit's design scope (not a tour room). */
export interface ScopeRoom {
  /** Stable identifier used as the room-grouping key on EstimateItem.roomSlug. */
  key: string;
  name: string;
  category: RoomCategory;
}

export const UNASSIGNED_ROOM_KEY = 'unassigned';

/** Grouped estimate summary for display. */
export interface EstimateRoomGroup {
  roomSlug: string;
  roomLabel: string;
  items: EstimateItem[];
  subtotalMinor: number;
}

export interface EstimateSummary {
  groups: EstimateRoomGroup[];
  grandTotalMinor: number;
  currency: 'INR';
  itemCount: number;
}
