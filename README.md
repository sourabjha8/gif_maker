# GIF Maker

A before/after slider GIF/PNG exporter with an infinite canvas editor.

## Structure

```
gif_maker/
├── frontend/   React + Vite + TypeScript app (all UI, canvas editor, GIF export)
└── backend/    Express + TypeScript API (currently a health-check scaffold)
```

### frontend/

```
src/
├── pages/        Top-level screens (Homepage, Editor)
├── components/
│   ├── home/     Homepage-only components
│   └── editor/   Editor-only components (canvas, panels, toolbar, overlays)
├── hooks/        Stateful logic (frames CRUD, canvas pan/zoom, GIF export, shortcuts)
├── lib/          Pure helper functions (easing curves, canvas rendering)
├── constants/    Static data (theme tokens, mock projects)
└── types/        Shared TypeScript types
```

Run it:

```
cd frontend
npm install
npm run dev
```

### backend/

Empty Express skeleton for future server-side features (currently unused by the frontend, which does all GIF/PNG export client-side).

```
cd backend
npm install
npm run dev
```
