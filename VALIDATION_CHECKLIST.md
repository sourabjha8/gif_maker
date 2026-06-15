# Validation Checklist

## Automated checks

Run after every phase where scripts exist:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run before pilot demo:

```bash
pnpm exec playwright test
```

## Manual happy path

- [ ] Open landing page.
- [ ] Start experience.
- [ ] Select floor.
- [ ] Select city.
- [ ] Select project.
- [ ] Select room.
- [ ] Select variant.
- [ ] Open 360 tour.
- [ ] Tap hotspot.
- [ ] See hotspot detail panel.
- [ ] See module-wise pricing or pricing unavailable state.
- [ ] Add item to estimate.
- [ ] Open estimate summary.
- [ ] Change quantity.
- [ ] Remove item.
- [ ] Play video.
- [ ] Switch full panorama variant if available.

## Viewer checks

- [ ] Tour route does not throw SSR/hydration errors.
- [ ] Viewer is destroyed on route exit.
- [ ] Re-entering tour does not create duplicate canvas instances.
- [ ] Hotspots align correctly after resize.
- [ ] Hotspots are tappable on mobile.
- [ ] Loading state appears before panorama is ready.
- [ ] Missing panorama shows controlled error.

## Pricing checks

- [ ] Mock pricing mode works without network.
- [ ] Pricing unavailable state does not crash tour.
- [ ] Money is formatted as INR.
- [ ] Calculations use minor units, not floats.
- [ ] Estimate stores normalized price snapshot.
- [ ] No API secrets appear in browser bundle.

## Video checks

- [ ] Video opens only after user action.
- [ ] Video controls are visible.
- [ ] Modal closes with Escape.
- [ ] Focus returns to triggering button.
- [ ] Video does not autoplay with sound.

## Layer/material checks

- [ ] Full panorama variant switch works.
- [ ] Overlay patch is behind feature flag.
- [ ] Overlay patch quality is manually reviewed on desktop and mobile.
- [ ] Geometry-changing swaps use full panorama variants, not overlays.

## Accessibility checks

- [ ] All non-viewer controls are keyboard reachable.
- [ ] Modals trap focus.
- [ ] Buttons have accessible labels.
- [ ] Touch targets are at least 44 x 44 px.
- [ ] Contrast is readable on dark panels.

## Performance checks

- [ ] Non-tour pages do not load Photo Sphere Viewer chunks.
- [ ] Tour page has loading state while viewer loads.
- [ ] Low-res panorama URL exists in content where possible.
- [ ] No obvious memory leak after switching rooms repeatedly.

## Scope checks

- [ ] No CMS added.
- [ ] No SSO added.
- [ ] No database added.
- [ ] No NestJS added.
- [ ] No persistent cart added.
- [ ] No kiosk added.
