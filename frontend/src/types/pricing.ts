/**
 * Pricing types.
 * Defines the adapter interface and normalized response shape
 * for the pricing system.
 *
 * Reference: FEATURE_SPEC.md §4 - Pricing response contract
 *
 * Rules:
 * - Use integer minor units (paise) for all money fields.
 * - Format INR in UI layer only.
 * - Never calculate with floating-point rupee values.
 * - Do not render raw API objects directly.
 */

import type { PricingRef } from './tour';

// ─── Request ─────────────────────────────────────────────────────

export interface PricingRequest {
  pricingRef: PricingRef;
  citySlug?: string;
  projectSlug?: string;
  roomSlug?: string;
  variantSlug?: string;
}

// ─── Response ────────────────────────────────────────────────────

export interface PricingResponse {
  status: 'priced' | 'unavailable' | 'error';
  currency: 'INR';
  label: string;
  rows: PricingRow[];
  /** Subtotal in minor units (paise). */
  subtotalMinor: number;
  /** Tax in minor units (paise). */
  taxMinor?: number;
  /** Discount in minor units (paise). */
  discountMinor?: number;
  /** Grand total in minor units (paise). */
  totalMinor: number;
  source?: string;
  updatedAt?: string;
  message?: string;
}

export interface PricingRow {
  id: string;
  label: string;
  code?: string;
  quantity: number;
  /** Unit price in minor units (paise). */
  unitAmountMinor: number;
  /** Total for this row in minor units (paise). */
  totalAmountMinor: number;
}

// ─── Normalized Price Snapshot ────────────────────────────────────
// Stored in the estimate when an item is added.

export interface NormalizedPrice {
  currency: 'INR';
  totalMinor: number;
  label: string;
  source?: string;
  snapshotAt: string;
}

// ─── Adapter Interface ──────────────────────────────────────────

export interface PricingAdapter {
  getModulePricing(input: PricingRequest): Promise<PricingResponse>;
}
