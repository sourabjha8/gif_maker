/**
 * Mock pricing adapter.
 * Returns deterministic pricing based on the pricing reference code,
 * so the same SKU produces the same number every time.
 *
 * This is the default adapter for local development.
 * Reference: BUILD_PLAN.md §8 - Pricing implementation plan
 */

import type { PricingAdapter, PricingRequest, PricingResponse, PricingRow } from '../../types';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Pretend to be a network call so the loading state has something to show. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exact demo prices (in paise) for the living-room showcase items.
// subtotalMinor = list price, totalMinor = after bundle discount.
const DEMO_PRICES: Record<string, { subtotalMinor: number; totalMinor: number }> = {
  'sku:SOF-3S-001':     { subtotalMinor: 13_800_000, totalMinor: 12_800_000 },
  'sku:TBL-COFFEE-001': { subtotalMinor:  4_500_000, totalMinor:  4_250_000 },
  'sku:LMP-FLOOR-001':  { subtotalMinor:  2_000_000, totalMinor:  1_890_000 },
  'sku:RUG-WOOL-001':   { subtotalMinor:  3_650_000, totalMinor:  3_400_000 },
  'module:MOD-TV-200':  { subtotalMinor:  9_300_000, totalMinor:  8_600_000 },
  'sku:CHR-ACCENT-001': { subtotalMinor: 18_000_000, totalMinor: 17_260_000 },
};

function pricedFor(input: PricingRequest): PricingResponse {
  const ref = input.pricingRef;
  const quantity = ref.quantity ?? 1;
  const key = `${ref.type}:${ref.code}`;

  const demo = DEMO_PRICES[key];
  if (demo) {
    return {
      status: 'priced',
      currency: 'INR',
      label: ref.code,
      rows: [{
        id: `${ref.code}-base`,
        label: ref.code,
        code: ref.code,
        quantity,
        unitAmountMinor: Math.round(demo.totalMinor / quantity),
        totalAmountMinor: demo.totalMinor,
      }],
      subtotalMinor: demo.subtotalMinor,
      totalMinor: demo.totalMinor,
      source: 'mock',
      updatedAt: new Date().toISOString(),
    };
  }

  const seed = hashCode(`${ref.type}:${ref.code}`);

  const baseUnit =
    ref.type === 'sku'
      ? 1500_00 + (seed % 9000) * 100
      : ref.type === 'module'
      ? 6500_00 + (seed % 24000) * 100
      : 28_000_00 + (seed % 90000) * 100;

  const rows: PricingRow[] = [
    {
      id: `${ref.code}-base`,
      label: input.pricingRef.code,
      code: ref.code,
      quantity,
      unitAmountMinor: baseUnit,
      totalAmountMinor: baseUnit * quantity,
    },
  ];

  if (ref.type === 'module') {
    const installUnit = 950_00;
    rows.push({
      id: `${ref.code}-install`,
      label: 'Installation',
      code: 'INSTALL',
      quantity,
      unitAmountMinor: installUnit,
      totalAmountMinor: installUnit * quantity,
    });
  }

  const subtotalMinor = rows.reduce((sum, row) => sum + row.totalAmountMinor, 0);
  const taxMinor = Math.round(subtotalMinor * 0.18);
  const totalMinor = subtotalMinor + taxMinor;

  return {
    status: 'priced',
    currency: 'INR',
    label: ref.code,
    rows,
    subtotalMinor,
    taxMinor,
    totalMinor,
    source: 'mock',
    updatedAt: new Date().toISOString(),
  };
}

export const mockPricingAdapter: PricingAdapter = {
  async getModulePricing(input: PricingRequest): Promise<PricingResponse> {
    await delay(220);
    // Deterministic "outage" for one well-known code so empty-state UI gets exercised.
    if (input.pricingRef.code === 'PRICING-UNAVAILABLE') {
      return {
        status: 'unavailable',
        currency: 'INR',
        label: input.pricingRef.code,
        rows: [],
        subtotalMinor: 0,
        totalMinor: 0,
        source: 'mock',
        message: 'Pricing temporarily unavailable.',
      };
    }
    return pricedFor(input);
  },
};
