/**
 * Pricing module barrel.
 * Exposes the adapter, mock adapter, formatter, and adapter factory.
 *
 * Reference: BUILD_PLAN.md §8 - Pricing implementation plan
 */

export { formatINR, paiseToRupees, normalizeFromResponse } from './format';
export { mockPricingAdapter } from './mock-adapter';
export { httpProxyPricingAdapter } from './proxy-adapter';
export { getPricingAdapter } from './factory';
