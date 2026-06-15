# Package Baseline

Updated: 2026-05-06

Claude Code should verify latest patch versions before install, then pin the lockfile.

## Runtime

- Node.js: prefer current LTS. Minimum must satisfy Next.js requirement. Use Node 20.9+ minimum, Node 22 LTS preferred if infra supports it.
- Package manager: `pnpm` preferred.

## Core packages

| Area | Recommended package | Version guidance |
|---|---|---|
| Framework | `next` | `16.2.x` latest stable patch |
| React | `react`, `react-dom` | `19.2.x` latest stable patch |
| Language | `typescript` | latest stable 5.x compatible with Next |
| Styling | `tailwindcss`, `@tailwindcss/postcss` | `4.1.x` if browser targets allow; otherwise Tailwind 3.4.x |
| 360 viewer | `@photo-sphere-viewer/core` | `5.14.1` or latest stable 5.x after checking compatibility |
| Hotspots | `@photo-sphere-viewer/markers-plugin` | same version as core |
| Tours | `@photo-sphere-viewer/virtual-tour-plugin` | same version as core |
| Gallery | `@photo-sphere-viewer/gallery-plugin` | same version as core |
| View lock | `@photo-sphere-viewer/visible-range-plugin` | same version as core |
| Overlays | `@photo-sphere-viewer/overlays-plugin` | same version as core, feature-flagged |
| Tiles | `@photo-sphere-viewer/equirectangular-tiles-adapter` | same version as core, spike only |
| 360 video | `@photo-sphere-viewer/video-plugin` | same version as core, only for 360 videos |
| State | `zustand` | latest stable 5.x |
| Validation | `zod` | latest stable |
| Icons | `lucide-react` | latest stable |
| Tests | `vitest`, `@testing-library/react` | latest stable |
| E2E | `@playwright/test` | latest stable 1.x |
| Formatting | `prettier` | latest stable |

## Install command example

Claude Code should adapt this to the actual project setup:

```bash
pnpm add @photo-sphere-viewer/core @photo-sphere-viewer/markers-plugin @photo-sphere-viewer/virtual-tour-plugin @photo-sphere-viewer/gallery-plugin @photo-sphere-viewer/visible-range-plugin zustand zod lucide-react
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @playwright/test prettier
```

Add overlays, tiles, and video plugins only when their spikes start:

```bash
pnpm add @photo-sphere-viewer/overlays-plugin @photo-sphere-viewer/equirectangular-tiles-adapter @photo-sphere-viewer/video-plugin
```

## Version discipline

- Keep all `@photo-sphere-viewer/*` packages on the exact same version.
- Do not mix PSV plugin versions.
- Do not use `react-photo-sphere-viewer` unless specifically approved after a plugin compatibility spike.
- Commit the lockfile.
- Run `pnpm build` after installing PSV because CSS/export paths can fail only at build time.

## Tailwind browser warning

Tailwind 4 requires modern browser support. If showroom TVs or older iPads are targets, verify browser versions first. If older browser support is required, use Tailwind 3.4.x for v1.
