# Interactive Interior Design Experience - Implementation Plan

Update and implement the design system and 360 viewer core for Virtual XP based on user feedback and technical requirements.

## User Review Required

> [!IMPORTANT]
> The implementation strategy now incorporates the following critical updates:
> - **360 Viewer Core:** Using **Photo Sphere Viewer v5** for the virtual tour runtime, with a strict requirement to use our custom Spatial Design System for all UI overlays.
> - **Typography:** Standardized on **Open Sans** for all editorial and UI text.
> - **Spatial Design:** Enabled Glassmorphism tokens (blur, translucency, depth) to be used as Next.js/React overlays above the 360 canvas.
> - **Colors:** Primary Blue palette refined and Primary Orange removed.

## Proposed Changes

### Design System & Documentation

#### [MODIFY] [design_system.md](file:///c:/Users/user/Desktop/Virtual%20XP-%20Phone/.agents/skills/design_system.md)
Update typography to Open Sans and ensure all spatial tokens are documented for developer use.

#### [NEW] [photo_sphere_viewer.md](file:///c:/Users/user/Desktop/Virtual%20XP-%20Phone/.agents/skills/photo_sphere_viewer.md)
Document the PSV v5 runtime configuration, plugin requirements (Virtual Tour, Markers, Gallery), and future 3D extension paths.

---

### Shared Package Implementation

#### [NEW] [tokens.ts](file:///c:/Users/user/Desktop/Virtual%20XP-%20Phone/packages/shared/tokens.ts)
Implement the refined design system as a TypeScript module (Open Sans fonts, hex codes, spacing).

#### [NEW] [viewer-config.ts](file:///c:/Users/user/Desktop/Virtual%20XP-%20Phone/packages/shared/viewer-config.ts)
Abstract the Photo Sphere Viewer bootstrap logic and plugin configurations to be shared between web and mobile (using the React wrapper).

## Verification Plan

### Automated Tests
- Run `npm test` in the shared package to verify token values match `design_system.md`.
- Validate PSV node configuration against the sample `document.md` specifications.

### Manual Verification
- Visual inspection of the `design_system.md` file in `.agents/skills/` to confirm the **Open Sans** family is correctly assigned.
- Verify the 360 runtime skill covers all P0/P1 roadmap features from the showroom design.
