# Virtual XP Web - Claude Code Build Pack

Updated: 2026-05-06

This pack is designed to be dropped into a new or existing repository before running Claude Code. It turns the Virtual XP Web plan into an implementation-focused brief that Claude Code can execute in safe phases.

## Recommended use

1. Create a new Git branch.
2. Copy `CLAUDE.md`, `BUILD_PLAN.md`, `FEATURE_SPEC.md`, `PACKAGE_BASELINE.md`, `VALIDATION_CHECKLIST.md`, and `.claude/commands/*` into the repository root.
3. Start Claude Code in the repo root.
4. Ask Claude Code to read `CLAUDE.md` and `BUILD_PLAN.md` first.
5. Use the prompt in `TASK_PROMPTS.md` to start Phase 0.

## v1 strategy

Build a fast pilot first:

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Photo Sphere Viewer official packages
- Static typed JSON content
- Existing pricing API adapter
- Hotspots and annotations
- Video modal/side panel
- Client-side estimate/cart
- Controlled layer/material swap spike

Move these out of v1 unless mandatory:

- Full SSO
- Directus CMS
- NestJS
- Postgres/Prisma
- Kiosk mode
- Persistent carts
- Hotspot authoring UI
- PDF/share link export

## Files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Root instruction file for Claude Code |
| `BUILD_PLAN.md` | Phased build plan and architecture decisions |
| `FEATURE_SPEC.md` | Detailed feature and data contracts |
| `PACKAGE_BASELINE.md` | Recommended package versions and install guidance |
| `TASK_PROMPTS.md` | Prompts to paste into Claude Code by phase |
| `VALIDATION_CHECKLIST.md` | Manual and automated QA checklist |
| `.claude/commands/*.md` | Optional slash-command style reusable prompts |

## Non-negotiable build principles

- Keep v1 simple and shippable.
- Use official Photo Sphere Viewer packages directly.
- Keep the 360 viewer isolated in client-only components.
- Validate content JSON with Zod before rendering.
- Do not expose pricing API secrets in the browser.
- Do not implement CMS, SSO, database, or kiosk unless explicitly reapproved.
- Every phase must end with a runnable demo and a clean build.
