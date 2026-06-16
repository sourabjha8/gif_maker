# Virtual XP Web — v1 Pilot

Browser-based 360° showroom and pitch tool. Built with Next.js App Router, React, TypeScript, Tailwind CSS, and Photo Sphere Viewer.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the Next.js dev server. |
| `npm run build` | Production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Lint the project. |

## Environment variables

All variables exposed to the browser must be prefixed `NEXT_PUBLIC_`. Server-only secrets must not.

| Variable | Scope | Purpose | Default |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_PRICING_MODE` | Browser | Selects the pricing adapter: `mock` (default) or `proxy`. | `mock` |
| `PRICING_API_URL` | Server only | Upstream pricing API the proxy forwards to. | (unset → mock fallback) |
| `PRICING_API_TOKEN` | Server only | Bearer token sent by the proxy to the upstream API. | (unset) |

The proxy handler lives at `app/api/pricing/route.ts`. With `NEXT_PUBLIC_PRICING_MODE=proxy` and no `PRICING_API_URL`, the proxy returns the same mock prices the client would have generated locally — handy for end-to-end testing of the proxy path.

## Project layout

```
app/                          # Next.js App Router (real routes per screen)
  layout.tsx                  # Root layout (loads globals.css)
  page.tsx                    # Start screen ("/")
  login/ choose/ location/    # Onboarding routes
  room-type/ room-filter/     # Design-flow routes
  [city]/                     # ProjectSelection
    [project]/                # RoomSelection
      [room]/                 # TourScreen (360 viewer island)
      dolly/                  # DollyScreen (floor-plan map)
  estimate/                   # Estimate summary
  globals.css                 # Tailwind 4 theme + design tokens
  api/pricing/route.ts        # Optional pricing proxy

src/                          # Shared design system + screens (alias: @shared)
  components/                 # UI primitives (Button, AlertBox, AppFrame, ...)
    tour/                     # 360 viewer + hotspot panel + video modal
    estimate/                 # Estimate sidebar + summary view
  screens/                    # Screen components (wired to routes via @shared)
  lib/
    content.ts                # JSON content loader + nav/slug helpers
    validation/               # Zod schemas
    pricing/                  # Adapter, factory, INR formatter
    estimate/                 # Zustand store + selectors
  data/
    virtual-xp-content.json   # Static content (tour + navigation; edit here for v1)
  types/                      # All TypeScript domain types

public/assets/                # Panoramas, posters, videos, icons
```

Routing uses `next/navigation`; selections live in URL segments. Cross-cutting
cart/estimate state stays in the Zustand store. Screens are imported via the
`@shared` path alias (configured in `tsconfig.json`).

## Editing tour content

All tour data lives in `src/data/virtual-xp-content.json`. The shape is enforced by Zod schemas in `src/lib/validation/schemas.ts`.

When adding a hotspot:

- `yaw` and `pitch` are in degrees and converted to radians by the viewer.
- Use `pricingRef` to enable price + add-to-estimate. Use the well-known code `PRICING-UNAVAILABLE` to test the unavailable state.
- Use `targetRoomSlug` for in-tour navigation.
- Use `videoRef` referencing a `media` entry to show a "Play video" action.

## Design system

Tokens live in `app/globals.css` under `@theme`. Colors, typography, radii, shadows, and animations are exposed as CSS variables and consumed via Tailwind utilities (e.g. `bg-spatial-glass`, `rounded-card`, `text-titleMedium`).

A premium dark "spatial" aesthetic is the default: glassmorphic panels, ambient pulses, large 44+px touch targets, and clear hierarchy.

## Notes

- The Photo Sphere Viewer chunk is dynamically imported (`ssr: false`) so navigation pages stay light.
- The estimate cart is client-side only and persisted to `localStorage` under `vxp-estimate-v1`. There is no server-side persistence in v1.
- See `BUILD_PLAN.md` for the v1 scope and `VALIDATION_CHECKLIST.md` for the manual QA pass.
