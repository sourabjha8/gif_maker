---
name: project-brain
description: >
  Core project context for a mobile-first interactive interior design experience. Load this skill at the start of every session or whenever working on any aspect of this product — design, code, content, UX, strategy, or naming. Trigger whenever the user mentions: the app, the platform, the interior design product, React Native screens, the web experience, room exploration, material browsing, CMS content, the media pipeline, client-facing flows, or any feature of this system. This skill ensures Claude always operates with the correct product vision, tone, audience, tech stack, and aesthetic constraints without needing to re-explain from scratch.
---

# Project Brain — Interactive Interior Design Experience

## What We're Building

A **mobile-first interactive interior design platform** that lets users explore real executed projects, rooms, and materials in a rich visual, spatial way — primarily on phones, with a companion web experience on desktop.

This is not a catalog. Not a PDF. Not a portfolio site.
It is a **living, navigable design experience** — one that communicates how a space *feels*, how materials work together in context, and how different design decisions compound into a cohesive result.

---

## Why It Exists

Interior design is a high-ticket, high-trust, highly visual decision. Traditional formats fail because they don't convey:
- How a space actually *feels* at human scale
- How materials and finishes look *in context* (not in a swatch)
- How the elements of a room work *together*

This product solves that by letting users:

| Goal | Mechanism |
|---|---|
| **Visualize clearly** | Step into rooms; understand layouts, finishes, combinations |
| **Explore at their own pace** | Browse anytime, anywhere — before, during, and after designer meetings |
| **Build confidence** | Real, executed designs in context increase trust in outcomes |
| **Shorten decision cycles** | Faster understanding → quicker alignment → better conversion |

---

## Audience

### Primary (Mobile-First)
- **Prospective clients** — exploring design possibilities on their phone, often before a first meeting
- **Existing clients** — reviewing specific rooms, materials, or options during an ongoing project

### Secondary
- **Interior designers** — using the same system during client discussions as a presentation layer
- **Web users** — browsing on desktop for deeper, slower review (more detail, more comparison)

### Tone Implications
- Never condescending or instructional
- Confident, calm, editorial — like a well-curated lookbook, not a SaaS product
- Language should feel like it belongs in an Architectural Digest caption or a luxury studio's portfolio, not a tech startup

---

## Aesthetic & Design Language

> The visual direction should feel **premium, calm, modern, and spatial** — like a curated interior design studio translated into digital.

### The Vibe: Editorial Yet Interactive
- Structured and refined, but *alive* through motion, depth, soft transitions, and responsive states
- The UI should never feel loud, playful, or overly "app-like"
- It should feel like a **high-end design companion** — not a consumer app

### What This Means in Practice

| Do | Don't |
|---|---|
| Generous whitespace | Cluttered layouts |
| Muted, warm neutrals + intentional accent | Bright, saturated color palettes |
| Serif or refined sans-serif typography | Rounded, casual, or tech-flavored fonts |
| Smooth, purposeful transitions | Bouncy, gamified animations |
| Full-bleed imagery | Thumbnails, grids, card stacks |
| Spatial depth (parallax, layering) | Flat, icon-heavy UI |
| Confidence through restraint | Feature-dense screens |

### Reference World
Architecture studios, luxury interiors, editorial design, fashion houses — not fintech, social apps, or e-commerce.

Every screen should communicate: **taste, clarity, and confidence.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Design** | Figma |
| **Mobile App** | React Native |
| **Web Experience** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS v4 (PostCSS) |
| **Architecture** | Modular, feature-based shared package |
| **Content & Data** | API + CMS (headless) — currently mock-driven |
| **Visual Assets** | Dedicated media pipeline (separate from CMS) |
| **360 Runtime** | Photo Sphere Viewer v5 (Three.js) |

### Stack Implications for Claude
- **Modular Imports** → Always use barrel imports from `packages/shared` (e.g., `import { Button } from '../components'`).
- **Domain Types** → Use centralized types from `packages/shared/types` for all models (`City`, `Society`, `Room`, etc.).
- **Config-Driven UI** → Screens should be pure; pull data from `packages/shared/data` and use the `useFlow()` hook for navigation state.
- **Strict Typing** → Maintain `strict: true` compliance in all TypeScript files.
- **Asset Access** → Use absolute paths for public assets (e.g., `/assets/images/background.png`).
- **Mobile-first code** → React Native (no web-only APIs, no DOM).
- **Web code** → Next.js (SSR/SSG preferred for content-heavy pages).

---

## Project Architecture & Scaling

The project follows a **domain-driven, modular architecture** designed for scalability and future API integration.

### Shared Logic (`packages/shared/`)
- **`types/`**: Single source of truth for domain models and navigation states.
- **`data/`**: Centralized mock data repository. Ready for seamless API swap.
- **`lib/`**: Core application logic, including the **Navigation Engine** (`FlowProvider`).
- **`components/`**: Atomic, pure UI components following the Spatial Design System.
- **`screens/`**: Feature-level screen components that consume shared data and state.

### Navigation Engine
- **`FlowProvider`**: Centralized React Context + `useReducer` state management replacing dispersed local states.
- **Config-Driven Router**: Main app screens are mapped in a `SCREEN_REGISTRY` (in `app/page.tsx`).
- **Decoupled Transitions**: Screens use the `useFlow()` hook to trigger declarative transitions (e.g., `selectCityAndGo(city)`) rather than managing logic internally.

---

## Core Product Principles

1. **The content is the product.** Design and engineering exist to let the content breathe, not to compete with it.
2. **Mobile-first, always.** Every decision is made for a 390px screen first. Desktop is an enhancement.
3. **Speed matters.** Users browsing on mobile won't wait. Performance is a design constraint, not an afterthought.
4. **Reduction over addition.** When in doubt, do less. One clear thing beats three options.
5. **Real projects, real materials.** No placeholders, no generic stock. The system is only as credible as its content.

---

## What Claude Should Always Remember

- This is a **premium product for a high-trust vertical** — not a startup MVP or a generic app
- The aesthetic bar is high; push back gently if suggestions feel off-brand
- Mobile is not a constraint to work around — it's the **primary canvas**
- Content (rooms, projects, materials) is the hero; UI is the frame
- Every interaction, animation, and screen should reinforce: *calm, confident, curated*
- **Architecture Integrity**: Keep UI components pure. Move business logic to `lib/` and data to `data/`.

---

## Technical Skill Reference
- **[Design System](file:///c:/Users/user/Desktop/Virtual%20XP-%20Phone/.agents/skills/design_system.md)**: Refined design tokens, typography (**Open Sans**), and Spatial/Glassmorphism variables.
- **[360 Showroom Runtime](file:///c:/Users/user/Desktop/Virtual%20XP-%20Phone/.agents/skills/photo_sphere_viewer.md)**: Core logic for the Photo Sphere Viewer v5, transitions, and in-scene hotspots.
- **[Implementation Plan](file:///c:/Users/user/Desktop/Virtual%20XP-%20Phone/.agents/skills/implementation_plan.md)**: Roadmap for implementing tokens and core UI architecture.
