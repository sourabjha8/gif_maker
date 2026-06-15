/**
 * HTTP proxy pricing adapter.
 * Posts the pricing request to the Next.js route handler at /api/pricing,
 * which is responsible for adding any internal auth headers / shaping.
 *
 * Use when: API requires server-side auth, shaping, or CORS handling.
 */

import type { PricingAdapter, PricingRequest, PricingResponse } from '../../types';

const PROXY_PATH = '/api/pricing';

export const httpProxyPricingAdapter: PricingAdapter = {
  async getModulePricing(input: PricingRequest): Promise<PricingResponse> {
    try {
      const res = await fetch(PROXY_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        return {
          status: 'error',
          currency: 'INR',
          label: input.pricingRef.code,
          rows: [],
          subtotalMinor: 0,
          totalMinor: 0,
          message: `Pricing service returned ${res.status}`,
        };
      }
      return (await res.json()) as PricingResponse;
    } catch (err) {
      return {
        status: 'error',
        currency: 'INR',
        label: input.pricingRef.code,
        rows: [],
        subtotalMinor: 0,
        totalMinor: 0,
        message: err instanceof Error ? err.message : 'Network error',
      };
    }
  },
};
