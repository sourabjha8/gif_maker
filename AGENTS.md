# AGENTS.md - Virtual XP Web v1 Pilot

You are building **Virtual XP Web**, a browser-based 360-degree interior showroom and pitch tool.

This file is the highest-priority project instruction for Codex. Read it before editing files.

## Product goal

Build a v1 pilot that lets a designer:

1. Navigate through a showroom/project selection flow.
2. Open a 360-degree room panorama.
3. Tap hotspots/annotations on products or modules.
4. View module-wise pricing from an existing pricing API or mock adapter.
5. Play room/product videos in a modal or side panel.
6. Try controlled color/material/layer swaps where feasible.
7. Add modules/items/rooms to an on-screen estimate.
8. Review an estimate/cart summary.

## v1 scope

Build these:

- Next.js App Router web app.
- React + TypeScript.
- Tailwind CSS styling.
- Photo Sphere Viewer official packages.
- Static typed JSON content in repo.
- Zod validation for content.
- Existing pricing API adapter, with a mock fallback.
- Hotspots/annotations via Photo Sphere Viewer MarkersPlugin.
- Optional room-to-room navigation via VirtualTourPlugin or app-level navigation.
- Video modal/side panel using standard HTML video.
- Optional 360 video only if explicitly required.
- Client-side cart/estimate using Zustand or React state.
- Optional localStorage persistence.
- Basic internal access gate only if configured.

Do not build these in v1 unless the user explicitly asks:

- Directus CMS.
- NestJS backend.
- Postgres or Prisma.
- Full SSO.
- Protected kiosk device mode.
- Server-side cart persistence.
- PDF export.
- Shareable client link.
- Advanced analytics dashboard.
- Full material editor.
- In-browser hotspot authoring UI.

## Technical decisions

### Framework

Use Next.js App Router. Keep server-rendered pages for navigation screens where possible. Keep the 360 viewer in a client-only component.

### 360 viewer

Use official Photo Sphere Viewer packages directly:

- `@photo-sphere-viewer/core`
- `@photo-sphere-viewer/markers-plugin`
- `@photo-sphere-viewer/virtual-tour-plugin` if needed
- `@photo-sphere-viewer/gallery-plugin` if useful
- `@photo-sphere-viewer/visible-range-plugin` if view locking is needed
- `@photo-sphere-viewer/overlays-plugin` only for layer/material swap spike
- `@photo-sphere-viewer/equirectangular-tiles-adapter` only after a performance spike
- `@photo-sphere-viewer/video-plugin` only for true 360-degree video, not ordinary product videos

Do not use `react-photo-sphere-viewer` unless a spike proves it supports all required plugins cleanly.

### Client-only viewer rule

Photo Sphere Viewer touches browser APIs and WebGL. Do not instantiate it in a Server Component.

Use one of these approaches:

- `"use client"` component with `useEffect` lifecycle cleanup.
- Dynamic import with `ssr: false` for the viewer island.

Always destroy the viewer instance on unmount.

### Pricing

Pricing comes from an existing API. Build a narrow adapter layer.

Allowed v1 modes:

1. Mock local adapter for development.
2. Direct browser fetch only if the API is browser-safe and uses no secret.
3. Next.js route handler proxy if API key, auth token, CORS, caching, or response shaping is needed.

Never expose API keys in `NEXT_PUBLIC_*` variables.

### Material/color/layer swaps

A 360 panorama is not a true 3D scene. Do not pretend arbitrary real-time material replacement is possible.

Support these approaches:

1. **Full panorama variant** - best quality, safest for sofas, modular furniture, and lighting-sensitive materials.
2. **Overlay patch** - acceptable for constrained color/material changes if the camera, panorama dimensions, and object geometry are locked.
3. **Marker/image layer** - acceptable for callouts, labels, icons, and small visual explanations.

If a requested swap changes geometry, cushions, modules, shadows, reflections, or occlusions, use a full panorama variant rather than an overlay patch.

### State

Use Zustand for cart/estimate state if the app needs shared state across routes and panels. Keep state small and serializable.

Persist only estimate state and selected variant/layer preferences to localStorage. Do not persist secrets, raw pricing API responses with internal fields, or user identifiers.

### Content

Use typed JSON content in v1. Validate using Zod.

Content should include:

- floors
- cities
- projects
- room types
- room variants
- panorama assets
- hotspots
- pricing references
- media references
- layer options

Do not hard-code content inside UI components.

### Styling

Use a premium dark showroom aesthetic: glass panels, strong hierarchy, clear contrast, large touch targets, and spacious layouts. Avoid overstuffed screens.

### Icons

Until explicitly told otherwise, do **not** create new icon components as `.tsx` files (e.g. under `frontend/packages/shared/assets/icons/`). For every icon used anywhere in the project — not just one screen — use the shared SVG asset at `frontend/public/assets/icons/default_icon.svg` (referenced as `/assets/icons/default_icon.svg`).

This applies to the whole project and is a standing rule for future work. Only add or author a dedicated icon file when the user explicitly asks for it.

### Accessibility

- Touch targets should be at least 44 x 44 px.
- Keyboard navigation should work on non-viewer UI.
- Viewer controls should have labels.
- Modals must trap focus and close with Escape.
- Do not rely only on color to communicate state.

## Workflow rules for Codex

1. Start every major phase with a short implementation plan.
2. Do not mix multiple phases in one pass.
3. Keep changes small and reviewable.
4. After each phase, run available checks:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
5. If a command fails, fix the root cause before moving on.
6. Do not delete existing user files without explicit approval.
7. Do not add new heavy dependencies without explaining why.
8. Do not introduce server/database/CMS code into v1 unless the user explicitly re-scopes.
9. Keep feature flags for optional spikes.
10. Update `README.md` whenever commands, env vars, or setup steps change.

## Quality bar

A phase is done only when:

- The app runs locally.
- The route or feature can be manually tested.
- Types pass.
- No console errors are expected during the happy path.
- Empty, loading, error, and unavailable-pricing states are handled.
- The implementation remains aligned to v1 scope.
