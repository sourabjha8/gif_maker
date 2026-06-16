// Screen-flow navigation is now handled by real App Router routes
// (next/navigation). The former FlowProvider/useFlow context + sessionStorage
// screen state has been retired. Cross-cutting cart/estimate state still lives
// in the Zustand store below.

// ─── Content Loader ─────────────────────────────────────────────
// Import directly from './content' or './validation' when needed.
// These are NOT re-exported here to avoid eagerly loading zod and
// the content JSON on every page (including non-tour screens).
//
// Usage:
//   import { loadContent, findBestVariant } from '../lib/content';
//   import { validateContent } from '../lib/validation';

// ─── Estimate Store ─────────────────────────────────────────────
export { useEstimateStore, selectEstimateSummary } from './estimate';

// ─── Pricing helpers ────────────────────────────────────────────
// Format helpers are tiny and safe to surface broadly.
export { formatINR, paiseToRupees } from './pricing/format';
