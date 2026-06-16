---
name: photo-sphere-viewer-runtime
description: >
  Core technical context for the 360 Virtual Showroom Tour runtime using Photo Sphere Viewer v5 (PSV) and Three.js. Load this whenever working on the immersive 360 viewer, panorama rendering, virtual tours, in-scene hotspots, or integrating 3D assets. Importantly, this skill enforces the use of the project's custom spatial design system over the library's default UI.
---

# Photo Sphere Viewer (v5) Runtime

## Overview
The 360 showroom runtime is built on top of **Photo Sphere Viewer v5 (@photo-sphere-viewer/core)**, a robust Three.js-backed panorama viewer. It offers an official plugin architecture that handles virtual tours, nodes, transitions, interactive markers, and responsiveness.

> [!IMPORTANT]
> **Custom UI & UX Constraint (Enforced)**
> While we rely on PSV for the 360 WebGL canvas, rendering, and spatial math, **we strictly use our own Design System for the UI/UX.** 
> - **DOM Overlay:** Product UI (menus, drawers, toggles) must sit in a Next.js/React overlay *above* the PSV canvas using absolute positioning and our Spatial Design tokens (Glassmorphism, backdrop filters).
> - **Hotspots/Markers:** Use the `MarkersPlugin` with custom HTML/SVG elements styled exclusively via our `tokens.css` (Archivo typography, `spatial/bg/glass-base`). 
> - **Avoid Default UI:** Do not use PSV's built-in, un-styled controls if they conflict with the premium, editorial "vibe" of our architectural product.

---

## Architecture & App Shell Integration

The architecture clearly separates the WebGL render loop from the application UI logic.

1. **PSV Core & Three.js:** Owns the render loop, the WebGLRenderer, and the 3D scene.
2. **Adapters:** Define display geometry (e.g., `equirectangular-tiles-adapter` for large 16K+ tiled images).
3. **Plugins:** The public extensibility contract. Used to subscribe to lifecycles, register behaviors, and push `Object3D` into the scene.
4. **UI Overlay Layer:** A React UI layer composited as a sibling over the PSV container via absolute positioning and CSS. Toggle chrome (UI vs Kiosk mode) efficiently using a `ui-hidden` CSS body class, avoiding React unmount/remount cycles.

### Next.js Specifics
- PSV requires the `window` object upon import. In Next.js, it must be loaded dynamically using `next/dynamic` with `ssr: false`.
- **`react-photo-sphere-viewer`** is recommended as a thin wrapper for standard React integration.

---

## Core Plugins Used

| Plugin | Purpose in Project |
| :--- | :--- |
| **VirtualTourPlugin** | Node-to-node panorama navigation. Configured with `renderMode: '3d'` (spatial depth arrows) and `preload: true` (for instant transitions over fast networks). |
| **MarkersPlugin** | In-scene interactive spatial hotspots. Employs `html`/`element` type markers (styled with our Glass tokens) and `polygonPixels` for defining recolorable wall regions linked to CSS variables. |
| **OverlaysPlugin** | Allows painted-into-panorama imagery. We use this to overlap wall paints or specific material decals over the base room. |
| **GalleryPlugin** | Thumbnail gallery strips. Automatically morphs for mobile. *Note: Conflicts with ResolutionPlugin.* |
| **Custom AudioPlugin** | Wraps `Howler.js` (for ambient loops, UI clicks) and `THREE.PositionalAudio` (for 3D spatialized asset sounds in the scene). |
| **Advanced 3D (Future)**| Using raw `viewer.renderer.addObject()` hooks to place `GLTFLoader` (GLB) items and `@mkkellogg/gaussian-splats-3d` assets atop the 3D scene. |

---

## Event Hooks & Dynamic System

Tour transitions are the core state changes in the showroom. Use PSV's `node-changed` event to orchestrate out-of-bounds tasks:

```ts
const tour = viewer.getPlugin(VirtualTourPlugin);
tour.addEventListener('node-changed', ({ node, data }) => {
  // Sync state upward to Next.js
  applyNodeMarkers(viewer, node.id); 
  applyNodeOverlays(viewer, node.id);
  audio.switchAmbience(node.data?.ambienceTrack);
});
```

---

## Critical Gotchas & Constraints

- **React Interactions:** To allow the user to click-and-drag the 360 panorama, the UI Overlay container must employ `pointer-events: none`. Re-enable `pointer-events: auto` *only* on the specific UI buttons, sliders, and cards so touch events properly reach the underlying PSV canvas.
- **Audio Autoplay:** Modern browsers block audio autoplay. Ambient audio (via Howler) must start muted and only unmute upon the first deliberate user interaction.
- **iOS Gyroscope:** `DeviceOrientationEvent.requestPermission()` needs a user gesture (i.e. a "Look Around" CTA button) to activate.
- **Tiled Optimization:** For ultra-high fidelity panoramas (e.g. 8K+), always format to `equirectangular-tiles-adapter` to conserve mobile memory constraints. KTX2 formats with Basis Universal are strongly preferred.
- **Layer Cleanups:** Objects injected directly into the Three.js scene natively via `addObject()` are NOT cleaned up dynamically by PSV nodes. Your logic must explicitly destroy them using `removeObject()`, `geometry.dispose()`, and `material.dispose()` upon node transitions.
