# Virtual XP Web - Claude Code Build Plan

Updated: 2026-05-06
Audience: Claude Code, engineering lead, product owner

## 1. Product framing

Virtual XP Web is a lightweight browser-based 360-degree showroom for designer-led interior pitches. It replaces static 2D pitch material and reduces dependency on hardware-bound Unreal demo stations.

The first release should prove the pitch loop, not the enterprise operations loop.

## 2. Recommended v1 architecture

```txt
Browser
  |
  | Next.js routes and client components
  v
Next.js App Router
  |-- Static typed JSON content
  |-- 360 Viewer Client Component
  |-- Pricing adapter
  |     |-- mock local adapter
  |     |-- direct existing API adapter, only if browser-safe
  |     |-- /api/pricing proxy adapter, if secrets/CORS/auth are needed
  |-- Zustand estimate/cart store
  |-- CDN/static assets
```

No NestJS, Postgres, Prisma, Directus, or full SSO in v1 unless explicitly reapproved.

## 3. Why v1 is simplified

The original plan included SSO, CMS, NestJS, Postgres, Directus, kiosk mode, asset workers, and persistent carts. That is a valid v1.5/v2 platform, but it slows validation of the actual product risks:

1. Panorama performance on real devices.
2. Hotspot/annotation usability.
3. Pricing clarity during a pitch.
4. Client-side estimate UX.
5. Video presentation behavior.
6. Feasibility of material/color/layer swaps on 360 imagery.

## 4. v1 feature list

### Must build

- Landing/start screen.
- Experience/project selection flow.
- Floor/city/project/room/variant navigation using static content.
- 360 room viewer.
- Hotspots/annotations.
- Hotspot detail panel.
- Module-wise pricing display.
- Add-to-estimate.
- Estimate/cart sidebar and summary route.
- Video modal/side panel.
- Static content validation.
- Loading, empty, error, and offline-ish states.
- Responsive laptop/tablet/mobile layouts.

### Should build

- Room gallery thumbnails.
- View lock for product/object-focused panoramas.
- LocalStorage estimate persistence.
- Pricing unavailable state with graceful fallback.
- Mock pricing adapter for offline development.

### Spike only

- Overlay-based material/color swap.
- Equirectangular tiled loading.
- 360-degree video playback.
- Layer toggles inside panorama.

### Do not build in v1

- CMS.
- Auth/SSO.
- Database.
- Persistent carts.
- Kiosk.
- PDF/share/export.
- Hotspot authoring UI.
- Arbitrary material editor.

## 5. Route structure

Recommended App Router structure:

```txt
src/app/
  layout.tsx
  page.tsx
  globals.css
  experience/page.tsx
  floors/page.tsx
  cities/page.tsx
  cities/[citySlug]/projects/page.tsx
  projects/[projectSlug]/rooms/page.tsx
  projects/[projectSlug]/rooms/[roomSlug]/configure/page.tsx
  projects/[projectSlug]/rooms/[roomSlug]/tour/page.tsx
  estimate/page.tsx
  api/pricing/route.ts          # optional proxy only

src/components/
  shell/
  ui/
  tour/
  pricing/
  estimate/

src/lib/
  content/
  pricing/
  tour/
  validation/
  utils/

src/data/
  virtual-xp-content.json

src/stores/
  estimate-store.ts

src/types/
  content.ts
  pricing.ts
  tour.ts
```

## 6. Data and content approach

Use JSON content plus TypeScript types and Zod validation.

The app must not render invalid content silently. At startup or route load, validate content and show a clear developer-facing error in development.

### Content model overview

```txt
Floor
  City
    Project
      Room
        Variant
          PanoramaAsset
          Hotspot[]
          MediaAsset[]
          LayerOption[]
```

### Content rules

- Every slug must be stable and URL-safe.
- Every panorama must have width, height, projection type, and URL.
- Every hotspot must have yaw, pitch, label, and pricing reference.
- Every video must have MIME type and poster if possible.
- Every layer option must declare whether it uses full panorama replacement or overlay patch.
- No component should import random assets directly unless it is a global shell asset.

## 7. Photo Sphere Viewer implementation plan

### Phase A - base viewer

- Create `TourViewer.tsx` as a client-only component.
- Instantiate `Viewer` in `useEffect`.
- Import required CSS in the component or global CSS.
- Destroy viewer on unmount.
- Render a skeleton until first panorama load.
- Render an error UI if WebGL/viewer creation fails.

### Phase B - markers

- Add MarkersPlugin.
- Convert content hotspots to PSV markers.
- Use accessible HTML marker buttons where possible.
- On marker select, open app-level hotspot detail panel.
- Keep business UI outside the WebGL canvas.

### Phase C - virtual navigation

Option 1: App-level navigation

- Simpler and recommended first.
- Clicking next room changes route/query param and reinitializes viewer.

Option 2: VirtualTourPlugin

- Use only if in-scene links between panoramas are required.
- More complex but better for immersive walkthroughs.

### Phase D - overlays and layers

Only after core viewer is stable:

- Add OverlaysPlugin behind `NEXT_PUBLIC_ENABLE_LAYER_SPIKE=true`.
- Test one sofa/furniture overlay patch.
- Compare visual alignment on desktop, tablet, and mobile.
- If alignment is poor, use full panorama variants.

### Phase E - tiled panoramas

Only after baseline performance test:

- Add EquirectangularTilesAdapter behind a feature flag.
- Use low-res base panorama plus tile URL function.
- Keep non-tiled fallback.

## 8. Pricing implementation plan

### Adapter interface

```ts
export interface PricingAdapter {
  getModulePricing(input: PricingRequest): Promise<PricingResponse>;
}
```

### Pricing modes

```txt
PRICING_MODE=mock
PRICING_MODE=direct
PRICING_MODE=proxy
```

### Recommended behavior

- Default local development to mock.
- Use proxy if API keys or internal tokens are required.
- Normalize all pricing responses into a single internal shape.
- Show per-module split, total, currency, and last-updated timestamp if available.
- Cache per SKU/module for a short TTL inside the route handler if proxy mode is used.
- Show “pricing temporarily unavailable” without breaking the tour.

## 9. Estimate/cart plan

Use client-side state for v1.

Estimate item shape:

```ts
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
  priceSnapshot?: NormalizedPrice;
  addedAt: string;
}
```

Rules:

- Snapshot normalized price when adding to estimate.
- If pricing is unavailable, allow add as “price pending” only if product owner approves.
- Quantity cannot go below 1.
- Duplicate hotspot adds should increment quantity or show “already added” based on UX decision.
- Summary must group by room and show subtotal.

## 10. Video behavior

Use standard HTML video in v1.

- Open videos in modal or side panel.
- Require user gesture to play audio.
- Always show play controls.
- Use H.264 MP4/AAC for Safari compatibility.
- Use poster images where possible.
- Avoid autoplay with sound.
- Use PSV VideoPlugin only for actual 360-degree video panoramas.

## 11. Layer/material/color swap behavior

### Supported v1 modes

1. **Full panorama variant**
   - User selects finish/material/color.
   - App switches to another panorama of the same camera position.
   - Best for sofas, modular furniture, cabinets, reflections, shadows, and geometry changes.

2. **Overlay patch**
   - User selects finish/material/color.
   - App toggles an aligned overlay image glued to panorama.
   - Use only when geometry and camera are locked.

### Not supported in v1

- Arbitrary texture replacement.
- Lighting-aware material recomputation.
- Real-time 3D object replacement.
- AI image generation inside the tour.

## 12. Build phases for Claude Code

### Phase 0 - repo foundation

Goal: Create a clean Next.js app foundation.

Tasks:

- Initialize Next.js App Router project or adapt existing project.
- Add TypeScript, ESLint, Tailwind, Prettier.
- Add route shell and base layout.
- Add placeholder navigation pages.
- Add README commands.

Done when:

- `pnpm dev` runs.
- `pnpm build` passes.
- Landing page and placeholder flow render.

### Phase 1 - content system

Goal: Static typed content works.

Tasks:

- Create content types.
- Create Zod schemas.
- Add sample content JSON.
- Add content loader.
- Add validation script.
- Render floor/city/project/room/variant pages from content.

Done when:

- Invalid content fails validation.
- All navigation screens render from JSON.

### Phase 2 - tour viewer core

Goal: 360 panorama renders safely.

Tasks:

- Add Photo Sphere Viewer packages.
- Create `TourViewer` client component.
- Load one equirectangular panorama.
- Add loading/error states.
- Destroy viewer on unmount.
- Add basic toolbar controls if needed.

Done when:

- Tour route loads a panorama.
- No SSR or hydration errors.
- Viewer can be opened, left, and reopened without duplicate WebGL instances.

### Phase 3 - hotspots and panels

Goal: Annotations work.

Tasks:

- Add MarkersPlugin.
- Map content hotspots to markers.
- Add marker select handler.
- Build hotspot detail panel.
- Show description, SKU/module code, image, and actions.

Done when:

- Tapping marker opens detail panel.
- Markers are touch-friendly.
- Missing hotspot data shows safe fallback.

### Phase 4 - pricing and estimate

Goal: Pricing and cart loop works.

Tasks:

- Add pricing adapter interface.
- Add mock adapter.
- Add optional Next.js proxy route.
- Normalize pricing response.
- Add estimate store.
- Add estimate sidebar and summary page.
- Add add/remove/update quantity actions.

Done when:

- Hotspot can fetch or mock pricing.
- Item can be added to estimate.
- Summary shows grouped totals.
- Pricing outage does not break tour.

### Phase 5 - video and layer spike

Goal: Media and controlled swaps work.

Tasks:

- Add video modal/side panel.
- Add poster and play controls.
- Add layer option UI.
- Implement full panorama variant switch.
- Implement one overlay patch spike behind feature flag.

Done when:

- Video opens and closes cleanly.
- Variant switch preserves app state.
- Overlay spike is either accepted or documented as not suitable.

### Phase 6 - polish and hardening

Goal: Pilot-ready.

Tasks:

- Responsive polish.
- Loading skeletons.
- Empty states.
- Error states.
- Accessibility pass.
- Performance checks.
- Playwright happy-path test.
- README setup and content guide.

Done when:

- Build passes.
- E2E happy path passes.
- App is usable on laptop, tablet, and mobile.

## 13. Acceptance criteria

### Functional

- User can navigate from landing to a room tour.
- User can view a 360 panorama.
- User can tap hotspots.
- User can see hotspot details.
- User can see module-wise pricing.
- User can add to estimate.
- User can view estimate summary.
- User can play video.
- User can try a full panorama variant switch.

### Resilience

- Missing pricing does not crash app.
- Missing asset shows a controlled error.
- Empty content shows meaningful empty state.
- Viewer route cleans up WebGL instance on unmount.
- App does not expose secret env vars.

### Performance

- First usable navigation screen loads quickly on normal office Wi-Fi.
- First panorama has visible loading state.
- Low-res panorama option exists for mobile.
- Heavy viewer code is not loaded on non-tour pages.

### Quality

- Typecheck passes.
- Lint passes.
- Build passes.
- At least one happy-path Playwright test exists.
- README explains setup, env vars, and content editing.

## 14. Future v1.5/v2 upgrade path

### v1.5

- SSO.
- Directus CMS.
- Persistent pitch sessions.
- Server-side cart.
- Protected kiosk route.
- Hotspot placement UI.
- Asset processing worker.

### v2

- Shareable client proposal.
- PDF export.
- Cart to internal 3D tool handoff.
- Analytics dashboard.
- Advanced layer/material authoring.
- Tile pipeline as default.
- Multi-language content.
