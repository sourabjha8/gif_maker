# Claude Code Task Prompts

Use these prompts sequentially. Do not ask Claude Code to build all phases at once.

## Initial prompt

```txt
Read CLAUDE.md, BUILD_PLAN.md, FEATURE_SPEC.md, PACKAGE_BASELINE.md, and VALIDATION_CHECKLIST.md.

Start in planning mode. Do not edit files yet.

Produce a concise Phase 0 implementation plan for the Virtual XP Web v1 pilot. Confirm the repo state, package manager, existing framework if any, and the exact files you will create or modify. Keep v1 scoped to Next.js, static typed content, Photo Sphere Viewer, pricing adapter, hotspots, video modal, and client-side estimate. Do not add CMS, SSO, database, NestJS, or kiosk.
```

## Phase 0 prompt

```txt
Implement Phase 0 only.

Goal: Create or adapt a clean Next.js App Router foundation for Virtual XP Web.

Tasks:
- Set up TypeScript, Tailwind, ESLint, Prettier if missing.
- Create route shell and placeholder navigation pages.
- Create basic premium dark UI shell.
- Add README setup commands.
- Do not add Photo Sphere Viewer yet.
- Do not add CMS/auth/database.

After implementation, run typecheck, lint, and build if scripts exist. Report changed files and any remaining issues.
```

## Phase 1 prompt

```txt
Implement Phase 1 only.

Goal: Static typed content system.

Tasks:
- Add TypeScript content types.
- Add Zod schemas.
- Add sample virtual-xp-content.json with one floor, one city, one project, two rooms, two variants, and several hotspots.
- Add content loader and validation helper.
- Render navigation pages from content.
- Add empty and invalid-content states.

Do not add Photo Sphere Viewer yet. Run checks and report changed files.
```

## Phase 2 prompt

```txt
Implement Phase 2 only.

Goal: 360 panorama viewer core.

Tasks:
- Install official Photo Sphere Viewer core package.
- Build a client-only TourViewer component.
- Load panorama from the selected room variant.
- Add loading and error states.
- Destroy viewer instance on unmount.
- Ensure viewer code is not loaded on non-tour pages.

Do not implement overlays or tiles yet. Run checks and report changed files.
```

## Phase 3 prompt

```txt
Implement Phase 3 only.

Goal: Hotspots and annotation panels.

Tasks:
- Add MarkersPlugin.
- Map content hotspots to PSV markers.
- On marker select, open a hotspot detail panel.
- Show label, description, image, SKU/module code, and pricing placeholder.
- Add touch-friendly marker styling.
- Add safe fallbacks for missing hotspot metadata.

Do not implement real pricing yet. Run checks and report changed files.
```

## Phase 4 prompt

```txt
Implement Phase 4 only.

Goal: Pricing adapter and client-side estimate.

Tasks:
- Add pricing adapter interface and normalized pricing types.
- Add mock pricing adapter.
- Add optional Next.js /api/pricing proxy route only if env indicates proxy mode.
- Add Zustand estimate store.
- Add add/remove/update quantity actions.
- Show pricing in hotspot panel.
- Add estimate sidebar and estimate summary page grouped by room.
- Handle pricing unavailable gracefully.

Do not add server-side cart persistence. Run checks and report changed files.
```

## Phase 5 prompt

```txt
Implement Phase 5 only.

Goal: Video and controlled layer/material swap spike.

Tasks:
- Add video modal or side panel with standard HTML video controls.
- Require user gesture for audio playback.
- Add layer option UI if content has layerOptions.
- Implement full-panorama-variant switch.
- Implement overlay-patch only behind a feature flag using OverlaysPlugin.
- Document whether overlay patch quality is acceptable.

Do not add arbitrary real-time material editing. Run checks and report changed files.
```

## Phase 6 prompt

```txt
Implement Phase 6 only.

Goal: Pilot hardening.

Tasks:
- Add loading skeletons.
- Improve responsive layouts.
- Add keyboard/focus handling for panels and modals.
- Add at least one Playwright happy-path test.
- Add content validation script to package.json.
- Update README with setup, env vars, content editing, and known limitations.
- Run typecheck, lint, test, e2e if available, and build.

Report final readiness and known gaps.
```
