/**
 * Optional pricing proxy route handler.
 *
 * Forwards a PricingRequest to an upstream pricing service identified by
 * the (server-only) PRICING_API_URL env var, attaches PRICING_API_TOKEN,
 * and returns a normalized PricingResponse.
 *
 * If neither env var is set, the route falls back to the local mock
 * adapter so that `NEXT_PUBLIC_PRICING_MODE=proxy` always returns
 * something sensible during development.
 *
 * Reference: BUILD_PLAN.md §8 - Pricing implementation plan.
 *
 * Never expose API keys via NEXT_PUBLIC_* — only PRICING_API_TOKEN
 * (server-only) is read here.
 */

import type { NextRequest } from 'next/server';
import type { PricingRequest, PricingResponse } from '../../../packages/shared/types';
import { mockPricingAdapter } from '../../../packages/shared/lib/pricing/mock-adapter';

export const runtime = 'nodejs';

declare const process: { env: Record<string, string | undefined> };

export async function POST(req: NextRequest) {
  let body: PricingRequest;
  try {
    body = (await req.json()) as PricingRequest;
  } catch {
    return Response.json(
      { error: 'Invalid JSON body' } as const,
      { status: 400 },
    );
  }

  if (!body?.pricingRef?.code) {
    return Response.json(
      { error: 'Missing pricingRef.code' } as const,
      { status: 400 },
    );
  }

  const env = typeof process !== 'undefined' && process.env ? process.env : {};
  const upstreamUrl = env.PRICING_API_URL;
  const upstreamToken = env.PRICING_API_TOKEN;

  if (!upstreamUrl) {
    // Fallback: serve the same mock the client would otherwise see.
    const response = await mockPricingAdapter.getModulePricing(body);
    return Response.json(response);
  }

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(upstreamToken ? { Authorization: `Bearer ${upstreamToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!upstreamRes.ok) {
      const fallback: PricingResponse = {
        status: 'unavailable',
        currency: 'INR',
        label: body.pricingRef.code,
        rows: [],
        subtotalMinor: 0,
        totalMinor: 0,
        message: `Upstream ${upstreamRes.status}`,
      };
      return Response.json(fallback, { status: 200 });
    }

    const data = (await upstreamRes.json()) as PricingResponse;
    return Response.json(data);
  } catch (err) {
    const fallback: PricingResponse = {
      status: 'unavailable',
      currency: 'INR',
      label: body.pricingRef.code,
      rows: [],
      subtotalMinor: 0,
      totalMinor: 0,
      message: err instanceof Error ? err.message : 'Pricing proxy error',
    };
    return Response.json(fallback, { status: 200 });
  }
}
