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
