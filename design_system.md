# Virtual XP Design System (v2 - Refined)

This document outlines the design tokens extracted from the Virtual XP Figma file, including color variables, typography styles, and new spatial design tokens.

## 🎨 Color Palette

### Primary Blue
| Token | Value |
| :--- | :--- |
| `primary/blue/50` | `#F1F9FE` |
| `primary/blue/100` | `#E1F2FD` |
| `primary/blue/200` | `#BDE6FA` |
| `primary/blue/300` | `#82D3F7` |
| `primary/blue/400` | `#3FBDF1` |
| `primary/blue/500` | `#17A8E5` |
| `primary/blue/600` | `#0A85BF` |
| `primary/blue/700` | `#09699B` |
| `primary/blue/800` | `#0C5A80` |
| `primary/blue/900` | `#104A6A` |
| `primary/blue/950` | `#0B2F46` |

### Neutral Greys
| Token | Value |
| :--- | :--- |
| `neutral/greys/50` | `#fafafa` |
| `neutral/greys/100` | `#f5f5f5` |
| `neutral/greys/200` | `#f0f0f0` |
| `neutral/greys/300` | `#d9d9d9` |
| `neutral/greys/400` | `#bfbfbf` |
| `neutral/greys/500` | `#8c8c8c` |
| `neutral/greys/600` | `#595959` |
| `neutral/greys/700` | `#434343` |
| `neutral/greys/800` | `#3f434a` |
| `neutral/greys/900` | `#1f1f1f` |
| `neutral/greys/950` | `#16171a` |

---

## ✨ Spatial Design Tokens

These tokens are designed to support a "glassmorphism" aesthetic with layered depth.

### Backgrounds & Glass Effects
| Token | Value | Description |
| :--- | :--- | :--- |
| `spatial/bg/base` | `#1f1f1f` | Base solid background. |
| `spatial/bg/glass-base` | `rgba(18, 18, 18, 0.6)` | Main translucent background for cards. |
| `spatial/bg/glass-elevated`| `rgba(255, 255, 255, 0.05)` | Subtle highlight for inner components. |
| `spatial/blur/standard` | `24px` | Standard backdrop blur level. |
| `spatial/border/glass` | `1px solid rgba(255, 255, 255, 0.1)` | Defining edges of glass panels. |

### Elevation & Depth
| Space/Depth | Property | Visual Cue |
| :--- | :--- | :--- |
| `depth/near` | `translateZ(20px)` | Focused elements, popups, active buttons. |
| `depth/mid` | `translateZ(10px)` | Primary UI panels and floating navigation. |
| `depth/far` | `translateZ(0)` | Background scenery and scenery overlays. |

### Spacing (The "Spaces")
| Token | Value | Context |
| :--- | :--- | :--- |
| `space/container` | `40px` | Main page/card margins. |
| `space/group` | `24px` | Gap between large logical groups. |
| `space/element` | `16px` | Standard gutter between UI elements. |
| `space/tight` | `8px` | Minimal spacing for secondary labels. |

### Corner Radius
| Token | Value | Description |
| :--- | :--- | :--- |
| `radius/container` | `32px` | Large modal containers and main UI panels. |
| `radius/card` | `24px` | Content cards and interactive blocks. |
| `radius/element` | `12px` | Small buttons, selectors, and input fields. |
| `radius/pill` | `100px` | Fully rounded CTA buttons and badges. |

### Shadows & Effects
| Token | Value | Description |
| :--- | :--- | :--- |
| `shadow/modal` | `0 8px 32px rgba(0, 0, 0, 0.4)` | Depth for floating modal containers. |
| `shadow/card` | `0 4px 16px rgba(0, 0, 0, 0.16)` | Subtle depth for inner cards. |
| `shadow/element` | `0 2px 4px rgba(0, 0, 0, 0.08)` | Minimal cue for interactive elements. |
| `glow/glass` | `0 0 1px rgba(255, 255, 255, 0.2)` | Highlight edge to enhance glass feel. |

### Detailed Borders
| Token | Value | Description |
| :--- | :--- | :--- |
| `border/glass` | `1px solid rgba(255, 255, 255, 0.1)` | Standard translucent edge. |
| `border/elevated` | `1px solid rgba(255, 255, 255, 0.2)` | More defined edge for focused items. |
| `border/active` | `1px solid #17A8E5` | Border for active/selected states (Primary Blue 500). |

---

## 🔡 Typography

**Font Family:** Open Sans (Bold, SemiBold, Medium, Regular)

| Category | Desktop Size | Mobile Size | Weight | Line Height (D/M) | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `H1` | 40px | 32px | Bold (700) | 48px / 38px | 0 |
| `H2` | 32px | 24px | Bold (700) | 38px / 32px | 0 |
| `H3` | 24px | 20px | Medium (500) | 29px / 26px | 0 |
| `Title Large` | 18px | 16px | Medium (500) | 26px / 24px | 0 |
| `Title Medium` | 16px | 14px | Bold (700) | 24px / 22px | 0.15 |
| `Title Small` | 14px | 13px | SemiBold (600) | 22px / 20px | 0.1 |
| `Body Large` | 16px | 14px | Regular (400) | 24px / 22px | 0.5 |
| `Body Medium` | 14px | 14px | Regular (400) | 22px / 22px | 0.25 |
| `Body Small` | 12px | 14px | Regular (400) | 18px / 22px | 0.4 |
| `Body Small 2` | 12px | 14px | Medium (500) | 18px / 22px | 0.4 |
| `CTA` | 14px | 14px | Bold (700) | 22px / 22px | 0.1 |

---

## 🛠️ Implementation Notes

- **Tailwind CSS System Base**: As of v2.1, all components and pages are built utilizing **Tailwind CSS v4** via PostCSS in Next.js. Avoid using inline `style={{...}}`.
- **Theme Variables**: Custom properties like colors (e.g. `bg-primary-500`), spatial tokens (`border-spatial-glass`), radiuses (`rounded-container`), and typography (`text-bodyLarge`) are fully accessible globally via `app/globals.css`.
- **Spatial Design:** When implementing glass containers independently, you can easily use the custom compiled class string: `bg-spatial-glass backdrop-blur-3xl border border-spatial-border`.
- **Typography:** The project uses the **Open Sans** family configured by default via `font-sans`. Keep line heights managed automatically using the token definitions (`text-titleLarge` injects both size and line height).
- **Responsive Typography (Mobile Overrides):** For mobile responsiveness, the following strict overrides are used on primary screen headings:
    - **Main Headings:** `text-2xl` (24px) instead of `text-h2` (32px).
    - **Sub-headings/Descriptions:** `text-sm` (14px) instead of `text-bodyLarge` (16px) or `text-bodySmall` (12px).
- **Responsiveness:** Use `px-container` and `gap-group` to handle modular spacing grids cleanly.
