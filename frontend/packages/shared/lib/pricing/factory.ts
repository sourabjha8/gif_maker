/**
 * Pricing adapter factory.
 * Picks the adapter to use at runtime based on `NEXT_PUBLIC_PRICING_MODE`.
 *
 * Allowed values: "mock" (default), "proxy".
 * "direct" is intentionally not supported in v1 — use "proxy" instead so
 * secrets and CORS are handled server-side.
 */

import type { PricingAdapter } from '../../types';
import { mockPricingAdapter } from './mock-adapter';
import { httpProxyPricingAdapter } from './proxy-adapter';

declare const process: { env: Record<string, string | undefined> };

export function getPricingAdapter(): PricingAdapter {
  const env =
    typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>);
  const mode = (env.NEXT_PUBLIC_PRICING_MODE || 'mock').toLowerCase();
  if (mode === 'proxy') return httpProxyPricingAdapter;
  return mockPricingAdapter;
}
