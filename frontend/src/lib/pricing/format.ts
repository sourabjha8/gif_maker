/**
 * INR formatting and price normalization helpers.
 * All money math happens in integer minor units (paise).
 */

import type { NormalizedPrice, PricingResponse } from '../../types';

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function paiseToRupees(minor: number): number {
  return Math.round(minor) / 100;
}

export function formatINR(minor: number | undefined | null): string {
  if (minor == null) return '—';
  return INR_FORMATTER.format(paiseToRupees(minor));
}

/** Build a normalized snapshot for storage in the estimate. */
export function normalizeFromResponse(response: PricingResponse): NormalizedPrice | null {
  if (response.status !== 'priced') return null;
  return {
    currency: response.currency,
    totalMinor: response.totalMinor,
    label: response.label,
    source: response.source,
    snapshotAt: new Date().toISOString(),
  };
}
