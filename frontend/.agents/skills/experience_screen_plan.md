# Experience Screen (Tour Viewer) Implementation Plan

Based on the instructions in `photo_sphere_viewer.md`, `project_brain.md`, and `BUILD_PLAN.md`, here is the strict implementation plan for the **Experience Screen** (the screen that comes after the user clicks "Explore" on the Room Selection screen).

**Status:** Planning only. No code changes have been made.

---

## 1. Context & Architecture

- **Trigger:** Clicking "Explore" in `RoomSelection.tsx` fires `goTo('experience')`.
- **Current State:** The `experience` screen in `app/app/page.tsx` renders a static placeholder image.
- **Goal:** Replace this placeholder with the **360 Tour Viewer** powered by Photo Sphere Viewer v5 (PSV).
- **Constraint:** PSV handles the WebGL render loop, but **all UI overlays must use the Spatial Design System**. No default PSV UI themes.

## 2. Component Structure

The implementation will be isolated within `packages/shared/components/tour/` and `packages/shared/screens/TourScreen.tsx` to maintain the monorepo architecture.

```text
packages/shared/
  components/
    tour/
      TourViewer.tsx        // The client-only PSV WebGL container
      TourOverlay.tsx       // The React UI layer (glassmorphism overlays)
      LoadingSkeleton.tsx   // Loading state before panorama is ready
  screens/
    TourScreen.tsx          // Replaces the placeholder in SCREEN_REGISTRY
```

## 3. Data Flow

1. The `TourScreen` will read the selected `citySlug`, `projectSlug`, and `roomSlug` from the `FlowProvider` state.
2. It will use the new `loadContent()` and `findBestVariant()` utilities from `packages/shared/lib/content.ts` to retrieve the correct `RoomVariant` from `virtual-xp-content.json`.
3. It will pass the `panorama.url` and `panorama.lowUrl` to the `TourViewer` component.

## 4. Technical Implementation Details

### A. Dynamic Import (`next/dynamic`)
PSV requires the `window` object. The `TourViewer` component must be imported dynamically with SSR disabled in Next.js.
```tsx
const TourViewer = dynamic(() => import('../components/tour/TourViewer'), { ssr: false });
```

### B. React PSV Wrapper
Use `@photo-sphere-viewer/core` and `react-photo-sphere-viewer`. 
Instantiate the viewer inside a `useEffect` and **ensure it is destroyed on unmount** to prevent memory leaks and duplicate WebGL contexts.

### C. UI Overlay Strategy (Strict Enforcement)
- **DOM Overlay:** The PSV container will have `pointer-events: auto` for panning. The UI overlay container (containing back buttons, hotspots details, etc.) will sit *above* PSV via absolute positioning with `pointer-events: none`.
- Interactive UI elements (buttons) will explicitly set `pointer-events: auto`.
- **Styling:** Use Tailwind tokens like `bg-spatial-glass`, `border-spatial-border`, and `rounded-card` from the Spatial Design System. Do not use standard white/light UI.

### D. Loading & Error States
- While the heavy equirectangular image loads, a skeleton or spinner using the spatial design system must be shown.
- If the content variant is missing or WebGL fails, a graceful error `AlertBox` should be displayed with an option to go back.

## 5. Phased Rollout (Aligning with Phase 2)

**Step 1:** Install `@photo-sphere-viewer/core` and `react-photo-sphere-viewer` via `npm` in the `app/` directory.
**Step 2:** Create the `TourViewer.tsx` component (WebGL only).
**Step 3:** Create the `TourScreen.tsx` which connects `FlowProvider` state to the viewer.
**Step 4:** Update `SCREEN_REGISTRY` in `app/app/page.tsx` to map `'experience'` to `<TourScreen />`.
**Step 5:** Verify loading, unmounting, and memory management.

*(Subsequent phases will introduce the MarkersPlugin for hotspots and the Estimate store for pricing interactions).*
