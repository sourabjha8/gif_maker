# RoomNavigationArrow — Full Implementation Plan

A room-to-room navigation hotspot for a 360° panorama viewer. It reads as a
chevron trail lying flat on the ground plane and receding toward a doorway,
with a permanent destination label — not a floating icon and not a
hover-only tooltip.

**This document covers three things, in order:**

1. §1–8: a **standalone, framework-level spec** of the visual/interaction
   component (React + Tailwind reference), reproducible on any stack.
2. §9–12: how the **actual production integration** wires that same visual
   into a real Photo Sphere Viewer (PSV) scene as a clickable, room-changing
   hotspot — content schema, DOM/CSS marker HTML, and the callback chain
   that performs the room switch.
3. §13: an **alternative integration** using PSV's own `VirtualTourPlugin`
   instead of a hand-built marker, and every non-obvious gotcha discovered
   getting it working.
4. §14: open design considerations / known gaps in the reference
   implementation, worth resolving before treating this as final.

Read §9's callout before starting: **the component in §1–8 is not what's
wired into production.** The real app never mounts live React inside the
360 scene — it renders equivalent HTML/CSS as a plain marker string. Both
share the identical visual design; only the mounting mechanism differs. If
your target codebase can mount a real DOM node per marker (most non-React
360 viewers can), you can use the React version for reference and still hand
the rendered DOM to your viewer library the way §11 does.

---

## PART A — Standalone component spec (React + Tailwind)

## 1. Visual concept

- The arrow is a **stack of 3 chevrons**, tilted back in 3D (`rotateX`) so it
  reads as lying on the floor and receding into the scene — not a flat icon
  facing the camera.
- A **destination name label** sits below the chevrons, always visible.
  Never implement this as a `title` attribute or hover tooltip — it must be
  part of the hotspot's permanent rendered content.
- The whole hotspot **fades and dims by default** (subtle, not eye-catching)
  and **brightens + scales up on hover**, with a small glow. Press/active
  dips slightly smaller than hover, staying brightened.
- Only the **chevron stack** rotates to face its doorway direction. The
  **label stays upright** regardless of that rotation — it is a sibling
  element outside the rotated wrapper, not a child of it.

### The depth effect, explicitly

The "lying flat and receding" illusion is built from exactly two CSS
properties working together, applied to two different elements:

1. A **`perspective`** value (`480px`) set on the *outer* wrapper — this
   establishes a 3D viewing context for its descendants. Without it, any
   `rotateX` on a child is a pure 2D vertical squash (flat foreshortening,
   no sense of depth).
2. A **`rotateX(58deg)`** transform on the *inner* chevron-stack wrapper,
   which must have `transform-style: preserve-3d`. Because the outer
   wrapper already established perspective, tilting the chevrons back by
   58° along the X axis reads as the top of the stack receding away from
   the viewer into the scene — the same way a real arrow painted on a floor
   would foreshorten as it points away from you.

The two elements must be different: `perspective` on the parent, `rotateX`
on the child. Putting both on the same element does not work — perspective
only affects how a *descendant's* 3D transforms are rendered, not itself.

58° was chosen empirically: shallower (e.g. 30°) barely reads as tilted;
steeper (e.g. 75°) makes the chevrons nearly invisible edge-on. It is not
derived from anything physical — treat it as a tuned constant.

This is the **same technique**, reused, as this codebase's floor-mounted
"reposition" markers (`.psv-marker-reposition`, §11.3) — both use
`perspective` + `rotateX` to fake a flat, ground-painted appearance for
what is really a rendered 2D DOM element. If your target codebase has any
existing "flat on the ground" marker, check whether it already has a
perspective/rotateX pattern to reuse rather than introducing a second one.

## 2. Props / API

| Prop              | Type                                  | Required | Description                                                                                    |
| ------------------ | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `destinationName` | `string`                               | yes      | Name of the room this arrow leads to. Rendered as the permanent label text.                     |
| `position`         | `{ x: number; y: number }`             | yes      | Screen-space anchor point, in pixels, for the arrow's center (e.g. from a marker/overlay layer). |
| `rotation`         | `number`                               | yes      | In-plane rotation, in degrees. `0` = chevrons point straight up / away from the camera.          |
| `onNavigate`       | `(destinationName: string) => void`    | no       | Fired on click/tap. If omitted, the reference implementation logs to console as a dev-time stub. |

## 3. DOM structure

```
<button>                                  ← root: positioned, no visible chrome of its own
  <div>                                   ← rotation wrapper (rotate by `rotation`, holds perspective)
    <div>                                 ← tilt wrapper (rotateX ground-plane tilt + hover/active scale)
      <img />  chevron 1 (front, brightest)
      <img />  chevron 2 (middle)
      <img />  chevron 3 (back, faintest)
    </div>
  </div>
  <span>{destinationName}</span>          ← label: sibling of the rotation wrapper, NOT inside it
</button>
```

The label being a **sibling** of the rotation wrapper (not nested inside it)
is the detail that keeps it upright while the chevrons above it rotate to
face their doorway — this is not optional, it's the mechanism.

## 4. Interaction states

Two independent booleans drive every visual value: `isHovered` (mouse
enter/leave) and `isActive` (pointer down/up, only meaningful while
hovered). Two derived values are computed from them:

| State                          | `emphasis` (scale) | `baseOpacity` (chevron 1) | `glow` (drop-shadow + brighter label) |
| -------------------------------- | :-----------------: | :-------------------------: | :--------------------------------------: |
| Default (no hover, no press)    | `1`                 | `0.55`                     | off                                      |
| Hover                            | `1.1`               | `0.95`                     | on                                       |
| Active (pressed)                 | `0.92`              | `0.95`                     | on                                       |

Resolution logic (evaluate active before hover):

```
emphasis    = isActive ? 0.92 : isHovered ? 1.1 : 1
baseOpacity = isActive ? 0.95 : isHovered ? 0.95 : 0.55
glow        = isHovered || isActive
```

On mouse leave, reset **both** `isHovered` and `isActive` to `false` (a
pointer that leaves the element mid-press should not leave it stuck in the
active look).

### Per-chevron opacity

Each of the 3 stacked chevrons fades further back:

```
chevron[i].opacity = max(baseOpacity - i * 0.18, 0.08)     // i = 0, 1, 2
```

| i   | Default | Hover / Active |
| --- | :-----: | :--------------: |
| 0   | 0.55    | 0.95             |
| 1   | 0.37    | 0.77             |
| 2   | 0.19    | 0.59             |

> **Production deviation:** the shipped marker HTML/CSS (§11.3) uses a
> brighter, always-on-outline variant of this same table — `0.9 / 0.65 /
> 0.4` default and `1 / 0.85 / 0.65` on hover, plus a permanent dark
> drop-shadow at every state, not just on hover. That change was a direct
> fix for a real bug (§14, item 4) and is the version you should actually
> ship — the numbers above are the original, dimmer design intent, kept
> here for historical accuracy.

## 5. Exact styles

### 5.1 Root `<button>`

Tailwind classes:

```
absolute flex flex-col items-center border-none bg-transparent p-0 cursor-pointer
focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element
```

Inline style (values depend on props, can't be static Tailwind classes):

```css
left: {position.x}px;
top: {position.y}px;
transform: translate(-50%, -50%);
```

`aria-label="Go to {destinationName}"` — required; this is the only
accessible name the control has, since it has no visible text of its own
at the root level (the label span is a separate visual element, not
semantically tied to the button as its name unless you also wire
`aria-labelledby`, so keep `aria-label` regardless).

### 5.2 Rotation wrapper (first child `<div>`)

No Tailwind classes — style-only:

```css
transform: rotate({rotation}deg);
perspective: 480px;
```

This is the element that receives the `rotation` prop directly. The
`perspective` here is what makes the descendant's `rotateX` read as true 3D
depth rather than a flat vertical squish (see §1, "The depth effect,
explicitly").

### 5.3 Tilt wrapper (second child `<div>`)

Tailwind classes:

```
flex flex-col items-center -space-y-3
```

`-space-y-3` (−12px) pulls the 3 stacked chevrons tightly together —
without it they read as 3 separate icons instead of one receding trail.

Inline style:

```css
transform: rotateX(58deg) scale({emphasis});
transform-style: preserve-3d;
transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
```

`58deg` is the fixed ground-plane tilt angle — it does not change with
state, only `scale()` (via `emphasis`) does.

### 5.4 Each chevron `<img>`

Tailwind classes:

```
w-10 h-10
```

Source: **reuse the existing `chevron_up.svg` icon asset** — do not author
a new SVG or inline SVG path markup for this. If `chevron_up.svg` isn't
available in the target project's icon set, substitute the closest existing
upward-chevron/arrow icon rather than drawing a new one. The reference icon
is a single thin-stroke chevron (`^`), Material-Symbols style, e.g.:

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 11.0537L7.92701 15.127C7.78851 15.2653 7.61443 15.3362 7.40476 15.3395C7.19526 15.3427 7.01801 15.2718 6.87301 15.127C6.72818 14.982 6.65576 14.8063 6.65576 14.6C6.65576 14.3937 6.72818 14.218 6.87301 14.073L11.3673 9.57874C11.4609 9.48524 11.5597 9.41924 11.6635 9.38074C11.7673 9.34224 11.8795 9.32299 12 9.32299C12.1205 9.32299 12.2327 9.34224 12.3365 9.38074C12.4403 9.41924 12.5391 9.48524 12.6328 9.57874L17.127 14.073C17.2653 14.2115 17.3362 14.3856 17.3395 14.5952C17.3427 14.8047 17.2718 14.982 17.127 15.127C16.982 15.2718 16.8063 15.3442 16.6 15.3442C16.3937 15.3442 16.218 15.2718 16.073 15.127L12 11.0537Z" fill="#E8EAED"/>
</svg>
```

Inline style (per chevron, using its own computed opacity from §4):

```css
opacity: {chevron-opacity};
filter: {glow ? 'drop-shadow(0 0 6px rgba(23,168,229,0.65))' : 'none'};
transition: opacity 0.2s ease, filter 0.2s ease;
```

The glow color `rgba(23,168,229,0.65)` corresponds to this project's
`primary-500` design token (`#17A8E5`) at 65% opacity — use the equivalent
brand-primary token/color on another stack rather than hardcoding this
literal value.

> See §11.3 for the shipped/hardened version of this rule, which adds a
> permanent (not hover-only) dark drop-shadow for legibility.

### 5.5 Label `<span>`

Tailwind classes:

```
mt-1 whitespace-nowrap font-sans text-xs font-semibold text-neutral-50
```

Inline style:

```css
text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5);
opacity: {glow ? 1 : 0.85};
transition: opacity 0.2s ease;
```

The text-shadow is **not** state-dependent — it's always present, so the
white label text stays legible against any panorama background (light
walls, bright skies, etc.) at every state, not just on hover.

## 6. Behavior

- `onClick` → call `onNavigate(destinationName)` if provided.
- If `onNavigate` is not provided, fall back to `console.log` (or your
  platform's equivalent) rather than throwing or silently no-op-ing — this
  keeps the component usable as a visual-only stub before real navigation
  logic is wired up.
- `onMouseEnter` → `isHovered = true`.
- `onMouseLeave` → `isHovered = false` **and** `isActive = false`.
- `onPointerDown` → `isActive = true`.
- `onPointerUp` → `isActive = false`.

## 7. Accessibility notes

- Root element must be a real `<button type="button">` (or equivalent
  focusable, activatable native control) — not a `<div>` with a click
  handler.
- `aria-label="Go to {destinationName}"` on the root.
- All chevron `<img>` elements: empty `alt=""` and `aria-hidden`, since the
  label text already conveys the meaning.
- Must be reachable and activatable by keyboard (native `<button>` gives
  you this for free); the `focus-visible:ring-2` treatment above must not
  be removed.
- **See §14 for a real, unresolved gap**: the 44×44px minimum touch-target
  rule this project otherwise enforces may not actually hold once the
  `rotateX` tilt is applied — verify before shipping on another stack.

## 8. Reference implementation (React version)

The exact source this section was extracted from:
`frontend/src/components/tour/RoomNavigationArrow.tsx` in this repository.

**Important:** as of this writing, that file is not imported or rendered
anywhere in the app (see §14, item 3). It was the first draft of this
component, built before the decision to render markers as plain HTML/CSS
strings inside the PSV viewer (§9). Treat PART A as the *design* source of
truth and PART B as the *integration* source of truth — they should produce
an identical visual, but only PART B is what a user of this app actually
sees today.

---

## PART B — Production integration (Photo Sphere Viewer)

## 9. Why this differs from PART A

Photo Sphere Viewer's `MarkersPlugin` places markers by handing it an HTML
**string** (or, per §13, a raw `HTMLElement` factory) that it inserts into
the DOM itself, positioned via spherical yaw/pitch → screen projection. It
does not mount React (or any component framework) per marker. So the
production version re-expresses PART A's exact visual design as:

- a small HTML-string-returning function (`portalMarkerHtml`, §11.2), and
- plain CSS with `:hover`/`:active`/`:focus-visible` pseudo-classes standing
  in for the `isHovered`/`isActive` React state (§11.3).

The visual result is designed to be pixel-identical to PART A. If your
target viewer library *can* mount a real component/element per marker
(many can — see §13 for one that takes a raw `HTMLElement`), you can render
PART A's component to a detached DOM node and hand that node to the marker
API directly, skipping the HTML-string translation.

## 10. Content / data model

The hotspot that becomes this arrow is just one more entry in this
project's existing per-room hotspot list, distinguished by
`type: 'room-portal'`. Add these fields to whatever hotspot type your
target codebase already has:

```ts
export interface Hotspot {
  // ...whatever fields your hotspot type already has (id, label, yaw, pitch, ...)
  type: 'room-portal' /* | your other hotspot types */;
  /** The room slug this marker navigates to. */
  targetRoomSlug?: string;
  /** In-plane rotation (degrees) orienting the ground arrow toward its doorway. Defaults to 0. */
  rotation?: number;
}
```

Zod (or equivalent runtime validation) schema fields to match:

```ts
targetRoomSlug: z.string().optional(),
rotation: z.number().optional(),
```

Example content entry (this project's actual data, Bangalore bedroom →
living room):

```json
{
  "id": "hs-portal-living-room",
  "label": "Living Room",
  "type": "room-portal",
  "yaw": 110.0,
  "pitch": -45.0,
  "targetRoomSlug": "living-room",
  "rotation": 20
}
```

Notes on authoring `yaw`/`pitch`/`rotation` for a new hotspot:

- `yaw`/`pitch` (degrees) are **where in the panorama** the arrow sits —
  point them at the actual doorway/opening in the photo.
- `pitch` should be noticeably negative (this project uses `-45°` to
  `-2°` depending on how low the doorway sits in frame) since the arrow is
  meant to sit near the floor, not at eye level.
- `rotation` (degrees) is a **separate, independently-authored** value —
  it's the on-screen facing direction of the chevron stack, not derived
  from yaw/pitch. There is no formula for it; pick a value, look at the
  render, adjust. This project uses small values (±20°) so the trail leans
  subtly toward its own doorway rather than pointing straight up.
- Give every room-portal hotspot its **reciprocal** on the target room
  (an arrow back) if you want two-way navigation — they are two entirely
  separate hotspot entries in two different rooms' content, not one
  bidirectional record.

## 11. The marker itself (HTML string + CSS)

### 11.1 Escaping helper

Any hotspot content (labels) that flows into an HTML string must be
escaped:

```ts
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

### 11.2 Marker HTML factory

```ts
/**
 * Room-change portal — a chevron trail lying flat on the ground plane
 * (tilted back with rotateX so it reads as painted on the floor and
 * receding toward the doorway, not a camera-facing icon), pointing in the
 * travel direction via `rotation`. The destination name is a permanent
 * label, not a hover tooltip. HTML/CSS port of RoomNavigationArrow.tsx —
 * PSV markers are plain DOM strings, not mounted React components, so hover
 * / active states are driven by CSS `:hover`/`:active` instead of React
 * state.
 */
function portalMarkerHtml(label: string, rotation: number): string {
  return `
    <button type="button" aria-label="Go to ${escapeHtml(label)}" class="psv-marker-portal">
      <span class="psv-marker-portal__rotator" style="transform: rotate(${rotation}deg);">
        <span class="psv-marker-portal__chevrons">
          <span class="psv-marker-portal__chevron"></span>
          <span class="psv-marker-portal__chevron"></span>
          <span class="psv-marker-portal__chevron"></span>
        </span>
      </span>
      <span class="psv-marker-portal__label">${escapeHtml(label)}</span>
    </button>
  `;
}
```

Note the structural correspondence to PART A §3: `__rotator` is PART A's
"rotation wrapper", `__chevrons` is the "tilt wrapper", each `__chevron`
span is CSS-background-image-only (no `<img>` needed since there's no
per-chevron `alt`/`aria` requirement in a decorative background image), and
`__label` is the sibling span, exactly as PART A's mechanism requires.

### 11.3 Full CSS (global stylesheet)

This is the complete, currently-shipping ruleset — copy verbatim, then
adjust only the color tokens (`--color-primary-400/500`,
`--spacing-tight`, `--radius-element`, `--shadow-*`, `--text-bodySmall`,
`--font-sans`) to your own design system's equivalents.

```css
/*
 * Room-change portal — a chevron trail lying flat on the ground plane,
 * tilted back with rotateX (same technique as any other flat-on-the-floor
 * marker in this system) so it reads as painted on the floor and receding
 * toward the doorway, rather than a camera-facing icon. `__rotator` carries
 * the in-plane rotation (set inline per-marker) so the trail points at its
 * doorway while the label — always visible, never a hover tooltip — stays
 * upright as a sibling outside the rotated element. Default state is
 * dim/subtle; hover brightens and scales up; press dips slightly.
 */
.psv-marker-portal {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.psv-marker-portal__rotator {
  display: flex;
  justify-content: center;
  perspective: 480px;
}
.psv-marker-portal__chevrons {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: rotateX(58deg);
  transform-style: preserve-3d;
  transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.psv-marker-portal__chevron {
  width: 40px;
  height: 40px;
  margin-top: -14px;
  background: no-repeat center / contain url('/assets/icons/chevron_up.svg');
  /* Always-on dark outline, not just on hover — a semi-transparent white
     icon disappears against a light wall/ceiling without it. */
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
  transition: opacity 0.2s ease, filter 0.2s ease;
}
.psv-marker-portal__chevron:nth-child(1) { opacity: 0.9; }
.psv-marker-portal__chevron:nth-child(2) { opacity: 0.65; }
.psv-marker-portal__chevron:nth-child(3) { opacity: 0.4; }
.psv-marker-portal__label {
  margin-top: 2px;
  font-family: var(--font-sans);
  font-size: var(--text-bodySmall);
  line-height: 1;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}
.psv-marker-portal:hover .psv-marker-portal__chevrons,
.psv-marker-portal:focus-visible .psv-marker-portal__chevrons {
  transform: rotateX(58deg) scale(1.1);
}
.psv-marker-portal:hover .psv-marker-portal__chevron,
.psv-marker-portal:focus-visible .psv-marker-portal__chevron {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 6px rgba(23, 168, 229, 0.65));
}
.psv-marker-portal:hover .psv-marker-portal__chevron:nth-child(1),
.psv-marker-portal:focus-visible .psv-marker-portal__chevron:nth-child(1) { opacity: 1; }
.psv-marker-portal:hover .psv-marker-portal__chevron:nth-child(2),
.psv-marker-portal:focus-visible .psv-marker-portal__chevron:nth-child(2) { opacity: 0.85; }
.psv-marker-portal:hover .psv-marker-portal__chevron:nth-child(3),
.psv-marker-portal:focus-visible .psv-marker-portal__chevron:nth-child(3) { opacity: 0.65; }
.psv-marker-portal:hover .psv-marker-portal__label,
.psv-marker-portal:focus-visible .psv-marker-portal__label {
  opacity: 1;
}
.psv-marker-portal:active .psv-marker-portal__chevrons {
  transform: rotateX(58deg) scale(0.92);
}
```

(There is no explicit `:active` rule for `__chevron`/`__label` beyond the
scale on `__chevrons` — active state inherits the hover filter/opacity
rules since `:hover` is typically still matched during a press. If your
target platform's touch/pointer emulation doesn't keep `:hover` matched
during `:active` — common on touch-only devices — add explicit
`:active`-scoped opacity/filter rules mirroring the `:hover` block.)

**No Tailwind classes are used for this marker at all** — it's plain CSS
against a global stylesheet, because the class names (`psv-marker-portal`,
etc.) need to be resolvable inside a raw HTML string the marker plugin
injects outside of Tailwind's normal JSX-scanning/purging pipeline. If your
build tool purges "unused" CSS based on static analysis of your source
files, make sure these class names are visible to it (e.g. they appear
literally as string literals in a `.ts`/`.tsx` file, which is sufficient
for most purge-CSS tools to keep them) or safelist them explicitly.

### 11.4 Wiring the marker into the viewer

Given a per-room list of hotspots, branch on `type === 'room-portal'` when
building your marker list:

```ts
if (hotspot.type === 'room-portal') {
  return {
    id: hotspot.id,
    position: { yaw: (hotspot.yaw * Math.PI) / 180, pitch: (hotspot.pitch * Math.PI) / 180 },
    html: portalMarkerHtml(hotspot.label, hotspot.rotation ?? 0),
    anchor: 'center center',
    data: {
      hotspotId: hotspot.id,
      hotspotType: hotspot.type,
      targetRoomSlug: hotspot.targetRoomSlug,
    },
  };
}
```

`anchor: 'center center'` matters — this marker is a flat-on-ground graphic
with no vertical stem, so it should be centered on its yaw/pitch point, not
bottom-anchored (which would be correct for a floating pin/flag style
marker, but not this one).

### 11.5 Click → room change

On your marker-click event, read back the `data` you attached and route
room-portal clicks to a room-change handler *before* falling through to
whatever generic hotspot-select handler you use for other marker types —
a room portal should never open a product/pricing panel:

```ts
// Inside your marker click handler:
if (data.hotspotType === 'room-portal' && data.targetRoomSlug) {
  handleNavigateRoom(data.targetRoomSlug);
  return;
}
// ...fall through to generic hotspot handling for every other type
```

```ts
const handleNavigateRoom = useCallback((targetRoomSlug: string) => {
  setRoomSlug(targetRoomSlug);       // whatever state drives "which room's content is loaded"
  setActiveHotspotId(null);          // close any open hotspot panel
  setIsViewerReady(false);           // show your loading state until the new panorama is ready
  // ...any other per-room UI state that needs resetting
}, []);
```

Changing `roomSlug` should re-resolve the room's own project/content
(new panorama URL, new hotspot list) through however your app already
loads room data — this hotspot doesn't need special-case data-fetching
logic, it just needs to trigger the same "switch active room" path your
room list / prev-next room controls already use.

---

## 12. Full checklist for a from-scratch port

1. Add `type: 'room-portal'`, `targetRoomSlug`, `rotation` to your hotspot
   type + validation schema (§10).
2. Add `escapeHtml` + `portalMarkerHtml` (§11.1–11.2).
3. Copy the CSS block verbatim, retokenize colors/spacing (§11.3).
4. Add the `chevron_up.svg` icon (or your closest existing upward-chevron
   asset) at the path your CSS references.
5. Branch your marker-builder function on `type === 'room-portal'`,
   `anchor: 'center center'` (§11.4).
6. Branch your marker-click handler to call a room-change function instead
   of your generic hotspot-select path, before that generic path runs
   (§11.5).
7. Author `yaw`/`pitch`/`rotation`/`targetRoomSlug` per hotspot in content
   (§10) — remember reciprocal arrows are separate entries in the target
   room's own content, not automatic.
8. Read §14 before calling this "done" — there are real, unresolved gaps
   in the reference implementation worth deciding on rather than silently
   inheriting.

---

## PART C — Alternative: PSV's own VirtualTourPlugin

## 13. Using `VirtualTourPlugin` instead of a hand-built marker

If you're specifically on Photo Sphere Viewer (not porting to a different
360 library), PSV ships a purpose-built plugin for room-to-room links:
`@photo-sphere-viewer/virtual-tour-plugin`. It was evaluated as an
alternative to the hand-built marker in §11, and can render this exact same
visual via a custom `arrowStyle.element` callback — but has several sharp
edges that cost real debugging time to work through. Documenting them here
so a fresh implementation doesn't repeat the same investigation.

**Only use this section if you specifically want PSV's own node/link graph
(automatic node management, built-in gallery/map/compass integration,
etc.) instead of the simpler flat hotspot-list approach in Part B.** For
just "an arrow that changes rooms," Part B is simpler and has no version-
pinning or render-mode gotchas.

### 13.1 Version pinning (hard requirement)

`@photo-sphere-viewer/virtual-tour-plugin`'s `peerDependencies` pins the
exact same version as `@photo-sphere-viewer/core` — not a caret range. If
your package manager resolves the plugin to a newer patch than core (easy
to hit with a caret dependency and no lockfile yet), PSV logs a runtime
console error and the plugin does not work correctly:

```
PhotoSphereViewer: @photo-sphere-viewer/virtual-tour is in version 5.15.1 but @photo-sphere-viewer/core is in version 5.14.1
```

Fix: pin all `@photo-sphere-viewer/*` packages to the identical exact
version. Verify with `pnpm why @photo-sphere-viewer/core` (or your package
manager's equivalent) — it should show exactly one resolved version across
every package that depends on it. If you change the plugin version later,
re-verify; a routine `pnpm add`/`npm install` can silently drift them
apart again.

Also, after fixing the version mismatch: if you're testing against an
already-running dev server, a stale webpack/Next.js build cache can keep
serving the *old* mismatched bundle even after `node_modules` is corrected.
Stop the dev server, delete its build cache (`.next` for Next.js), and
restart clean before concluding the fix didn't work.

### 13.2 Never pass `panorama` at the top level alongside node config

```ts
// WRONG — starts two competing loads of the same texture
new Viewer({
  panorama: panoramaUrl,
  plugins: [[VirtualTourPlugin, { nodes, startNodeId: 'bedroom' }]],
});
```

`VirtualTourPlugin` loads its `startNodeId` node's own panorama itself. If
the outer `Viewer` config *also* specifies `panorama`, you get two
overlapping loads of the same texture; the second cancels the first, and
the viewer's `ready` event never fires — it's stuck on a loading spinner
forever, with no error to explain why.

```ts
// RIGHT — omit `panorama` entirely when a VirtualTourPlugin node config exists
new Viewer({
  // no `panorama` key here at all
  plugins: [[VirtualTourPlugin, { nodes, startNodeId: 'bedroom' }]],
});
```

### 13.3 `arrowStyle.size` is effectively required

Even when supplying your own `arrowStyle.element`, also supply `size`:

```ts
arrowStyle: {
  element: makeArrowElement,
  size: { width: 80, height: 80 }, // required — see below
}
```

The plugin's internal renderer reads `size.width`/`size.height`
unconditionally when sizing the arrow's DOM element. Omitting `size` risks
that read hitting `undefined`, which silently aborts the arrow before it's
ever added to the scene — no console error, the arrow just never appears.
This is the single most likely reason a custom `arrowStyle.element` renders
nothing.

### 13.4 `renderMode: '2d'` vs `'3d'` — pick `'2d'`, understand why

- **`renderMode: '3d'`** (the plugin's default) keeps a fixed 3D
  orientation for the arrow in world space and projects it through a live
  camera transform every frame. As you look around, the arrow's on-screen
  shape visibly skews/rotates with your viewing angle — a real, correct
  property of a true 3D-anchored object, but it reads as the arrow
  "spinning" or "tracking the screen," which is *not* what a fixed doorway
  sign should look like.
- **`renderMode: '2d'`** renders through a simpler billboard-style
  positioning system and does not exhibit that reorientation — this is the
  mode to use for a "points in one fixed direction" arrow like this one.

### 13.5 `renderMode: '2d'` visibility is real frustum culling — not a bug

The 2D-mode element is only actually appended to the DOM while its
projected position falls within the camera's current view. If you check
for the arrow's DOM element with the camera facing some other direction
first, you will correctly find nothing — **this is not a rendering
failure**, it's the same principle as any billboard marker only being
visible while you're looking toward it. Before concluding a 2D-mode arrow
"doesn't render," rotate the camera to face the link's own `yaw`/`pitch`
and check again.

For an isolated demo/test harness (not the full app, where free-look
panning naturally reveals these arrows), it's worth rotating the camera to
face a room's own outgoing link immediately after each node change, so
whoever's testing doesn't have to hunt for it:

```ts
virtualTourPlugin.addEventListener('node-changed', ({ node }) => {
  const link = node.links?.[0];
  if (link?.position) {
    viewer.rotate({ yaw: link.position.yaw, pitch: link.position.pitch });
  }
});
```

### 13.6 Don't set `markers` on `MarkersPlugin`'s own config

If `MarkersPlugin` is registered alongside `VirtualTourPlugin` with a
non-empty `markers: [...]` in `MarkersPlugin`'s own constructor config, PSV
logs:

```
PhotoSphereViewer: No default markers can be configured on the MarkersPlugin when using the VirtualTourPlugin. Consider defining `markers` on each tour node.
```

...and then **deletes that config itself** to avoid a conflict (this part
is non-fatal — it does not explain a missing arrow on its own, unlike
§13.3–13.5, but it is a real misconfiguration worth fixing). Register
`MarkersPlugin` with no initial `markers`, and set your own hotspot markers
afterward via `markersPlugin.setMarkers([...])` once the viewer is ready
(and again any time your hotspot list changes) instead of passing them at
construction time.

### 13.7 Custom arrow element factory

Reuses the exact same visual as §11.2/§11.3 — the only difference is it
returns a real `HTMLElement` (this plugin's API for a custom arrow), not an
HTML string:

```ts
function makeArrowElement(link: { data?: { label?: string; rotation?: number } }): HTMLElement {
  const { label = '', rotation = 0 } = link.data ?? {};
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="psv-marker-portal">
      <span class="psv-marker-portal__rotator" style="transform: rotate(${rotation}deg);">
        <span class="psv-marker-portal__chevrons">
          <span class="psv-marker-portal__chevron"></span>
          <span class="psv-marker-portal__chevron"></span>
          <span class="psv-marker-portal__chevron"></span>
        </span>
      </span>
      <span class="psv-marker-portal__label">${escapeHtml(label)}</span>
    </div>
  `;
  return wrapper.firstElementChild as HTMLElement;
}
```

Stash `label`/`rotation` in each link's own `data` field when building your
`nodes`/`links` config — the callback receives the link object directly,
so there's no need to cross-reference node names at render time.

### 13.8 Known unresolved issue with this approach

As of this writing, this project runs **both** the §11 hand-built marker
and the §13 VirtualTourPlugin arrow simultaneously, for the same room
connections — meaning two overlapping arrows render at the same spot,
pointing the same way, in every room that has a `room-portal` hotspot. This
was left unresolved pending a decision on which approach to keep. Pick one
before shipping; don't carry both into a new codebase.

---

## 14. Open design considerations (not yet resolved in the reference app)

Carried over verbatim from a design review of the shipped implementation —
worth a decision before treating this as a finished component, in either
codebase:

1. **Duplicate arrows.** See §13.8 — every room with a `room-portal`
   connection currently renders both the §11 CSS marker and the §13
   VirtualTourPlugin arrow on top of each other. Pick one implementation.
2. **Touch target size compression.** This project otherwise enforces a
   44×44px minimum touch target. The chevron stack's `rotateX(58deg)` tilt
   visually (and, since CSS transforms affect hit-testing geometry,
   *functionally*) compresses its apparent height — the real tappable area
   may fall below the minimum, particularly on mobile. Not yet measured;
   measure and pad the button's hit area if needed (e.g. a larger
   invisible hit-box via padding on the root `<button>`, independent of the
   visual chevron size).
3. **`RoomNavigationArrow.tsx` (PART A) is dead code.** It's exported and
   present in the source tree but not rendered anywhere in the running app
   — see §9. It's also already out of sync with production: the opacity/
   drop-shadow legibility fix in §11.3/§4's callout was applied to the CSS
   version only. Either update the React component to match and find it a
   real use (e.g. a Storybook/isolated preview), or delete it — don't leave
   two silently-diverging copies of the same design.
4. **No overflow guard on the label.** `white-space: nowrap` with no
   `max-width`/`text-overflow: ellipsis` — a sufficiently long destination
   name can run off the edge of the panorama viewport uncontained. Add a
   sensible `max-width` + `overflow: hidden; text-overflow: ellipsis;` if
   your content's room names aren't tightly controlled.
5. **No fallback for a dangling `targetRoomSlug`.** If a hotspot points at
   a room slug that doesn't exist in the current project (a content typo,
   or a room removed after the hotspot was authored), the failure surfaces
   as a generic "room not found" error from whatever your app's room-
   resolution logic does, not a specific, actionable message tied to the
   arrow that caused it. Consider validating `targetRoomSlug` against the
   project's actual room list at content-load time (or at least at
   render time) rather than at click time.
