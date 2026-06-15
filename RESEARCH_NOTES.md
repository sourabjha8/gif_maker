# Research Notes Used for This Build Pack

Updated: 2026-05-06

## Claude Code

- Claude Code is an agentic coding tool that can read codebases, edit files, run commands, and integrate with development tools.
- Anthropic recommends managing context carefully because context fills quickly and performance can degrade as it fills.
- Claude Code supports hooks for deterministic automation such as formatting after edits or notifications.
- Claude Code supports built-in subagents such as Explore and Plan, and custom subagents can preserve context and enforce tool constraints.

Primary docs:

- https://code.claude.com/docs/en/overview
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/sub-agents

## Next.js and React

- Next.js App Router is the right route model for a new app.
- Current Next.js docs show latest 16.x line.
- React docs show React 19.2 as the latest documented major/minor line.

Primary docs:

- https://nextjs.org/docs/app
- https://react.dev/versions

## Tailwind

- Tailwind v4 is modern and fast, but requires modern browsers.
- If showroom TVs or older iPads are required, verify browser versions first.

Primary docs:

- https://tailwindcss.com/blog/tailwindcss-v4
- https://tailwindcss.com/docs/upgrade-guide

## Photo Sphere Viewer

- Photo Sphere Viewer has official plugins for Markers, Gallery, Overlays, Video, Virtual Tour, and Visible Range.
- Official plugins are published as `@photo-sphere-viewer/*` packages.
- Equirectangular tiles reduce initial load time and bandwidth for large panoramas.
- Overlays can glue image overlays to the panorama, useful for constrained layer/material experiments.

Primary docs:

- https://photo-sphere-viewer.js.org/plugins/
- https://photo-sphere-viewer.js.org/plugins/markers.html
- https://photo-sphere-viewer.js.org/plugins/overlays.html
- https://photo-sphere-viewer.js.org/plugins/virtual-tour.html
- https://photo-sphere-viewer.js.org/guide/adapters/equirectangular-tiles.html

## Playwright

- Playwright supports modern browser automation and cross-browser testing.
- Recent Playwright versions include strong video/screencast support, useful for agentic QA receipts.

Primary docs:

- https://playwright.dev/docs/release-notes
- https://playwright.dev/docs/intro
