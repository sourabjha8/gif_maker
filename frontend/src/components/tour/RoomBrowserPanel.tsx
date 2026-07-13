'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Typography } from '../UI';
import type { ContentRoom, RoomVariant } from '../../types';

export type RoomBrowserMode = 'closed' | 'list' | 'catalog';

// Group-level filter icons — same glyphs already used for this exact taxonomy
// in RoomFilterSelection.tsx, reused here rather than re-authored.
const PaletteIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M479.23-100q-77.77 0-146.92-29.96-69.16-29.96-120.77-81.58-51.62-51.61-81.58-120.96T100-480q0-79.15 30.77-148.5t83.58-120.65q52.8-51.31 123.54-81.08Q408.62-860 488.77-860q75 0 142.15 25.58 67.16 25.58 117.96 70.81 50.81 45.23 80.96 107.5Q860-593.85 860-521.08q0 103.85-61.73 162.46Q736.54-300 640-300h-72.46q-17.08 0-27.31 11.15Q530-277.69 530-262.46q0 18.54 15 38.54T560-178q0 39.61-21.92 58.81Q516.15-100 479.23-100Zm.77-380Zm-184.31 15.69Q310-478.62 310-500q0-21.38-14.31-35.69Q281.38-550 260-550q-21.38 0-35.69 14.31Q210-521.38 210-500q0 21.38 14.31 35.69Q238.62-450 260-450q21.38 0 35.69-14.31Zm120-160Q430-638.62 430-660q0-21.38-14.31-35.69Q401.38-710 380-710q-21.38 0-35.69 14.31Q330-681.38 330-660q0 21.38 14.31 35.69Q358.62-610 380-610q21.38 0 35.69-14.31Zm200 0Q630-638.62 630-660q0-21.38-14.31-35.69Q601.38-710 580-710q-21.38 0-35.69 14.31Q530-681.38 530-660q0 21.38 14.31 35.69Q558.62-610 580-610q21.38 0 35.69-14.31Zm120 160Q750-478.62 750-500q0-21.38-14.31-35.69Q721.38-550 700-550q-21.38 0-35.69 14.31Q650-521.38 650-500q0 21.38 14.31 35.69Q678.62-450 700-450q21.38 0 35.69-14.31ZM479.23-160q9.77 0 15.27-4.81T500-178q0-14-15-31.46t-15-54.69q0-42.77 29-69.31T570-360h70q70.62 0 115.31-41.38Q800-442.77 800-521.08q0-121.38-93.08-200.15Q613.85-800 488.77-800q-137.15 0-232.96 93T160-480q0 133 93.5 226.5T479.23-160Z" />
  </svg>
);

const LayersIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M182.92-394.85q-11.76-8.92-11.65-23.42.12-14.5 11.89-23.81 8.3-6.07 18.23-6.07 9.92 0 18.23 6.07l252.69 195.54q3.46 2.69 7.69 2.69t7.69-2.69l252.69-195.54q8.31-6.07 18.23-6.07 9.93 0 18.23 6.07 11.77 9.31 11.89 23.81.11 14.5-11.65 23.42L524.38-198.7q-20.07 15.47-44.38 15.47-24.31 0-44.38-15.47l-252.7-196.15Zm252.7 18.77-210-163.23q-27.93-21.69-27.93-56.84 0-35.16 27.93-56.85l210-163.23q20.07-15.46 44.38-15.46 24.31 0 44.38 15.46l210 163.23q27.93 21.69 27.93 56.85 0 35.15-27.93 56.84l-210 163.23q-20.07 15.46-44.38 15.46-24.31 0-44.38-15.46Zm52.07-47.84 209.62-162.62q5-3.84 5-9.61t-5-9.62L487.69-768.38q-3.46-2.7-7.69-2.7t-7.69 2.7L262.69-605.77q-5 3.85-5 9.62t5 9.61l209.62 162.62q3.46 2.69 7.69 2.69t7.69-2.69ZM480-596.15Z" />
  </svg>
);

const CrownIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M246.54-180q-12.75 0-21.38-8.63-8.62-8.63-8.62-21.38 0-12.76 8.62-21.37 8.63-8.62 21.38-8.62h466.92q12.75 0 21.38 8.63 8.62 8.63 8.62 21.38 0 12.76-8.62 21.37-8.63 8.62-21.38 8.62H246.54Zm29.54-127.69q-26.31 0-46.31-16.89-20-16.88-25-42.8L160.92-621q-2 .38-4.5.69-2.5.31-4.5.31Q130-620 115-635.14q-15-15.15-15-36.78 0-21.96 15-37.33 15-15.36 36.95-15.36 21.94 0 37.3 15.36 15.37 15.37 15.37 37.33 0 5.58-.93 10.37-.92 4.78-2.92 9.01l117.69 50.23q3.85 1.54 7.69.39 3.85-1.16 6.54-4.62l116.54-158.69q-9.84-6.85-15.88-18.02-6.04-11.17-6.04-24.06 0-21.95 15.36-37.32Q458.03-860 479.98-860q21.94 0 37.33 15.35 15.38 15.34 15.38 37.27 0 13.15-6.04 24.23-6.04 11.07-15.88 17.92l116.54 158.69q2.69 3.46 6.54 4.62 3.84 1.15 7.69-.39l117.69-50.23q-1.54-4.09-2.69-9.01-1.16-4.91-1.16-10.37 0-21.96 15-37.33 15-15.36 36.95-15.36 21.94 0 37.31 15.36Q860-693.88 860-671.92q0 21.57-15.39 36.75Q829.22-620 807.23-620q-1.76 0-3.96-.5-2.19-.5-4.38-.5l-43.66 253.62q-5 25.92-25 42.8-20 16.89-46.31 16.89H276.08Zm.38-60h407.08q4.23 0 7.69-2.69 3.46-2.7 4.23-6.93l35.62-196.62-66 26.93q-23.31 9.84-47.39 3.5-24.07-6.35-39.23-27.19L480-705.92l-98.46 135.23q-15.16 20.84-39.23 27.19-24.08 6.34-47.39-3.5l-66-26.93 35.62 196.62q.77 4.23 4.23 6.93 3.46 2.69 7.69 2.69Zm203.54 0Z" />
  </svg>
);

const ExpandIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M690-350h-90q-12.77 0-21.38 8.62Q570-332.77 570-320t8.62 21.38Q587.23-290 600-290h113.85q15.46 0 25.8-10.35Q750-310.69 750-326.15V-440q0-12.77-8.62-21.38Q732.77-470 720-470t-21.38 8.62Q690-452.77 690-440v90ZM270-610h90q12.77 0 21.38-8.62Q390-627.23 390-640t-8.62-21.38Q372.77-670 360-670H246.15q-15.46 0-25.8 10.35Q210-649.31 210-633.85V-520q0 12.77 8.62 21.38Q227.23-490 240-490t21.38-8.62Q270-507.23 270-520v-90Zm-97.69 430Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31Zm0-60h615.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H172.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM160-240v-480 480Z" />
  </svg>
);

export interface RoomBrowserPanelProps {
  projectName: string;
  projectBhkType?: string;
  rooms: ContentRoom[];
  activeRoomSlug: string;
  mode: RoomBrowserMode;
  onClose: () => void;
  onSelect: (roomSlug: string) => void;
  onBrowseCatalog: () => void;
}

type FacetKey = 'designStyle' | 'moduleType' | 'luxuryLevel' | 'roomSize';

const FACETS: { key: FacetKey; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: 'designStyle', label: 'Design style', Icon: PaletteIcon },
  { key: 'moduleType', label: 'Module type', Icon: LayersIcon },
  { key: 'luxuryLevel', label: 'Luxury level', Icon: CrownIcon },
  { key: 'roomSize', label: 'Room size', Icon: ExpandIcon },
];

const emptyFacetSelections = (): Record<FacetKey, Set<string>> => ({
  designStyle: new Set(),
  moduleType: new Set(),
  luxuryLevel: new Set(),
  roomSize: new Set(),
});

/** Capitalizes each word — real variant values are single lowercase tokens
 * (e.g. "modern", "large"), but this stays safe for multi-word values too. */
function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

function representativeVariant(room: ContentRoom): RoomVariant | undefined {
  return room.variants.find((v) => v.isDefault) ?? room.variants[0];
}

// No room in the current content has a dedicated `thumbnail` — fall back to
// its showcased variant's own panorama still, so the catalog always shows a
// real image instead of a generic icon whenever one exists.
function thumbnailFor(room: ContentRoom): string | undefined {
  if (room.thumbnail) return room.thumbnail;
  const panorama = representativeVariant(room)?.panorama;
  return panorama?.lowUrl ?? panorama?.url;
}

// ─── Color palette — derived from real material swatches ──────────
// RoomVariant has no dedicated "palette" field, so the palette facet is
// built from the hex colors actually used in `materials[].swatch` (mostly
// two-stop CSS gradients) across the project's rooms, bucketed into
// families by hue/saturation/lightness. A family only appears if at least
// one real swatch falls into it.

const PALETTE_FAMILIES: Record<string, string> = {
  neutral: 'Neutrals',
  warm: 'Warm tones',
  cool: 'Cool tones',
  earthy: 'Earthy',
  bold: 'Bold accents',
};

const PALETTE_DESCRIPTIONS: Record<string, string> = {
  neutral: 'Whites, greys and beiges for versatility',
  warm: 'Sun-warmed woods and brass for a cozy glow',
  cool: 'Calm blues and greys for a breezy feel',
  earthy: 'Nature-inspired browns and olive tones',
  bold: 'Vibrant colors with strong contrast',
};

interface PaletteEntry {
  key: string;
  roomSlug: string;
  name: string;
  family: string;
  swatches: string[];
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

function classifyPalette(hex: string): keyof typeof PALETTE_FAMILIES {
  const { h, s, l } = hexToHsl(hex);
  // A distinctly blue/blue-green hue reads as "cool" even when pale — hue
  // carries that signal more than saturation does for interior swatches.
  if (h >= 170 && h < 270) return 'cool';
  // A true, reasonably saturated red reads as a deliberate bold accent.
  if ((h < 20 || h >= 340) && s >= 25) return 'bold';
  // Otherwise we're in the warm/earthy hue band that dominates interior
  // material photography (woods, plasters, linens) — split by chroma/depth.
  if (s < 23) return 'neutral';
  if (l < 45) return 'earthy';
  return 'warm';
}

function extractSwatchHexes(swatch?: string): string[] {
  if (!swatch) return [];
  return swatch.match(/#[0-9a-f]{6}/gi) ?? [];
}

export const RoomBrowserPanel: React.FC<RoomBrowserPanelProps> = ({
  projectName,
  projectBhkType,
  rooms,
  activeRoomSlug,
  mode,
  onClose,
  onSelect,
  onBrowseCatalog,
}) => {
  const isOpen = mode !== 'closed';
  const isCatalog = mode === 'catalog';

  const [selections, setSelections] = useState<Record<FacetKey, Set<string>>>(emptyFacetSelections());
  const [selectedPaletteEntry, setSelectedPaletteEntry] = useState<string | null>(null);
  const [activePaletteFamily, setActivePaletteFamily] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset catalog filters each time the catalog is entered fresh.
  useEffect(() => {
    if (isCatalog) {
      setSelections(emptyFacetSelections());
      setSelectedPaletteEntry(null);
      setActivePaletteFamily(null);
    }
  }, [isCatalog]);

  const facetGroups = useMemo(() => {
    return FACETS.map(({ key, label, Icon }) => {
      const values = new Set<string>();
      rooms.forEach((room) => room.variants.forEach((v) => {
        const value = v[key];
        if (value) values.add(value);
      }));
      return { key, label, Icon, options: Array.from(values).sort() };
    }).filter((g) => g.options.length > 0);
  }, [rooms]);

  // Each real room variant becomes one "named palette" — its own material
  // swatches, grouped under whichever family its swatches mostly belong to.
  // This stays grounded in actual content instead of inventing palette names.
  const paletteEntries = useMemo<PaletteEntry[]>(() => {
    const entries: PaletteEntry[] = [];
    rooms.forEach((room) => room.variants.forEach((v) => {
      const hexes: string[] = [];
      (v.materials ?? []).forEach((m) => {
        extractSwatchHexes(m.swatch).forEach((hex) => {
          const lower = hex.toLowerCase();
          if (!hexes.includes(lower)) hexes.push(lower);
        });
      });
      if (hexes.length === 0) return;
      const counts: Record<string, number> = {};
      hexes.forEach((hex) => {
        const fam = classifyPalette(hex);
        counts[fam] = (counts[fam] ?? 0) + 1;
      });
      const family = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      entries.push({
        key: `${room.slug}:${v.slug}`,
        roomSlug: room.slug,
        name: v.name,
        family,
        swatches: hexes.slice(0, 4),
      });
    }));
    return entries;
  }, [rooms]);

  const paletteFamilies = useMemo(() => {
    const byFamily = new Map<string, PaletteEntry[]>();
    paletteEntries.forEach((entry) => {
      if (!byFamily.has(entry.family)) byFamily.set(entry.family, []);
      byFamily.get(entry.family)!.push(entry);
    });
    return Array.from(byFamily.entries()).map(([key, entries]) => {
      const preview: string[] = [];
      outer: for (const entry of entries) {
        for (const hex of entry.swatches) {
          if (!preview.includes(hex)) preview.push(hex);
          if (preview.length === 2) break outer;
        }
      }
      return {
        key,
        label: PALETTE_FAMILIES[key] ?? titleCase(key),
        description: PALETTE_DESCRIPTIONS[key] ?? '',
        preview,
        entries,
      };
    });
  }, [paletteEntries]);

  const hasActiveFilters = facetGroups.some((g) => selections[g.key].size > 0) || selectedPaletteEntry !== null;

  const filteredRooms = useMemo(() => {
    const activeEntry = selectedPaletteEntry
      ? paletteEntries.find((e) => e.key === selectedPaletteEntry)
      : undefined;
    return rooms.filter((room) => {
      const facetsMatch = facetGroups.every(({ key }) => {
        const selected = selections[key];
        if (selected.size === 0) return true;
        return room.variants.some((v) => v[key] && selected.has(v[key] as string));
      });
      if (!facetsMatch) return false;
      if (!activeEntry) return true;
      return room.slug === activeEntry.roomSlug;
    });
  }, [rooms, facetGroups, selections, selectedPaletteEntry, paletteEntries]);

  const totalStyles = rooms.reduce((sum, r) => sum + r.variants.length, 0);
  const projectLabel = projectBhkType ? `${projectName} · ${projectBhkType}` : projectName;

  const toggleOption = (key: FacetKey, option: string) => {
    setSelections((prev) => {
      const next = new Set(prev[key]);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return { ...prev, [key]: next };
    });
  };

  const clearAll = () => {
    setSelections(emptyFacetSelections());
    setSelectedPaletteEntry(null);
    setActivePaletteFamily(null);
  };

  const activeFamily = paletteFamilies.find((f) => f.key === activePaletteFamily);

  return (
    <>
      {/* Backdrop — only meaningful while the panel is the small floating
          drawer; once it has grown to fill the screen there's no "outside"
          to dim. */}
      <div
        className={`fixed inset-0 z-[150] transition-opacity duration-300 ${
          mode === 'list' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Single shell — the same element widens from the floating drawer's
          340px card to a near-full-width panel, keeping the same 8px
          margin, rounded corners, and border throughout, so the resize
          animates as one continuous motion instead of a cut between two
          different overlays. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isCatalog ? 'All rooms' : 'Room list'}
        aria-hidden={!isOpen}
        className={`
          fixed z-[160] top-2 left-2 h-[calc(100dvh-16px)] flex flex-col overflow-hidden
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal rounded-card
          transition-all duration-500 ease-out
          ${isCatalog ? 'w-[calc(100vw-16px)]' : 'w-[340px]'}
          ${isOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'}
        `}
      >
        <div className="relative flex-1 min-h-0">
          {/* ── LIST PAGE ─────────────────────────────────────────── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${isCatalog ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}
            `}
          >
            <div className="flex items-start justify-between px-element py-element border-b border-spatial-border shrink-0">
              <div>
                <Typography variant="titleMedium" weight="bold" colorClass="text-neutral-50">
                  {projectLabel}
                </Typography>
                <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mt-0.5">
                  {rooms.length} room{rooms.length !== 1 ? 's' : ''} · tap a room to tour
                </Typography>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close room list"
                className="
                  w-11 h-11 flex items-center justify-center shrink-0
                  rounded-element border border-spatial-border
                  bg-spatial-glass-elevated text-neutral-300
                  hover:text-white hover:bg-white/10
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                "
              >
                <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>

            <Typography
              variant="bodySmall"
              colorClass="text-neutral-500"
              className="uppercase tracking-widest px-element pt-group pb-tight shrink-0"
            >
              Rooms in this property
            </Typography>

            <ul className="overflow-y-auto custom-scrollbar px-element pb-element space-y-tight flex-1">
              {rooms.map((room) => {
                const isActive = room.slug === activeRoomSlug;
                const thumbnail = thumbnailFor(room);
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => { if (isActive) return; onSelect(room.slug); onClose(); }}
                      className={`
                        w-full flex items-center gap-element p-tight rounded-element
                        border transition-all duration-200 text-left
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                        ${isActive
                          ? 'bg-primary-500/15 border-primary-400/40'
                          : 'bg-spatial-glass-elevated border-spatial-border hover:bg-white/10 hover:border-spatial-border-elevated'
                        }
                      `}
                    >
                      <div className="w-16 h-16 rounded-element overflow-hidden border border-spatial-border shrink-0 bg-white/5">
                        {thumbnail
                          ? <img src={thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
                          : <div className="w-full h-full flex items-center justify-center">
                              <img src="/assets/icons/design_house.svg" alt="" aria-hidden className="w-6 h-6 opacity-30" />
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-tight">
                          <Typography variant="titleSmall" colorClass={isActive ? 'text-neutral-50' : 'text-neutral-200'} className="truncate">
                            {room.name}
                          </Typography>
                          {isActive && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-pill bg-primary-500/30 border border-primary-400/40">
                              <Typography variant="bodySmall" colorClass="text-primary-300">
                                Now
                              </Typography>
                            </span>
                          )}
                        </div>
                      </div>
                      <img src="/assets/icons/chevron_next.svg" alt="" aria-hidden className="w-4 h-4 opacity-40 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Catalog entry — plain text row, no card chrome. Clicking this
                is what grows the panel below into the full-page catalog. */}
            <button
              type="button"
              onClick={onBrowseCatalog}
              className="
                flex items-center gap-tight px-element h-11 shrink-0 text-left
                border-t border-spatial-border
                text-neutral-300 hover:text-white hover:bg-white/5
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              "
            >
              <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-4 h-4 opacity-60 shrink-0" />
              <Typography variant="bodyMedium" colorClass="text-inherit" className="flex-1">
                Browse all rooms in the catalog
              </Typography>
              <img src="/assets/icons/chevron_next.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-40 shrink-0" />
            </button>
          </div>

          {/* ── CATALOG PAGE ──────────────────────────────────────── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${isCatalog ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}
            `}
          >
            <header className="shrink-0 flex items-start justify-between gap-element px-group py-element border-b border-spatial-border">
              <div className="min-w-0">
                <Typography variant="h3" weight="bold" colorClass="text-neutral-50">
                  All Rooms
                </Typography>
                <Typography variant="bodySmall" colorClass="text-neutral-400" className="mt-0.5">
                  {rooms.length} room{rooms.length !== 1 ? 's' : ''} · {totalStyles} style{totalStyles !== 1 ? 's' : ''} available
                </Typography>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close all rooms"
                className="
                  w-11 h-11 flex items-center justify-center shrink-0
                  rounded-element border border-spatial-border
                  bg-spatial-glass-elevated text-neutral-300
                  hover:text-white hover:bg-white/10
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                "
              >
                <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
              </button>
            </header>

            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* Filter rail */}
              <aside className="w-[260px] shrink-0 overflow-y-auto custom-scrollbar border-r border-spatial-border p-element space-y-group">
                <div className="flex items-center justify-between">
                  <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest">
                    Filters
                  </Typography>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element"
                    >
                      <Typography variant="bodySmall" colorClass="text-primary-400" className="underline">
                        Clear all
                      </Typography>
                    </button>
                  )}
                </div>

                {facetGroups.map((group) => (
                  <div key={group.key}>
                    <div className="flex items-center gap-tight mb-tight">
                      <div className="p-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 shrink-0">
                        <group.Icon size={16} className="text-primary-400" />
                      </div>
                      <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100">
                        {group.label}
                      </Typography>
                    </div>
                    <div className="flex flex-wrap gap-tight">
                      {group.options.map((option) => {
                        const isOn = selections[group.key].has(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleOption(group.key, option)}
                            aria-pressed={isOn}
                            className={`
                              px-element py-1.5 rounded-pill border transition-all duration-200
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                              ${isOn
                                ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                                : 'bg-spatial-glass-elevated border-spatial-border text-neutral-300 hover:border-spatial-border-elevated hover:text-neutral-100'
                              }
                            `}
                          >
                            <Typography variant="bodySmall" colorClass="text-inherit">
                              {titleCase(option)}
                            </Typography>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Color palette — two-stage: families, then shades within a family */}
                {/* TODO: commented out for now — re-enable by removing `false &&` */}
                {false && paletteFamilies.length > 0 && (
                  <div>
                    <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100" className="mb-tight">
                      Color palette
                    </Typography>

                    {!activeFamily ? (
                      <div className="flex flex-col gap-tight">
                        {paletteFamilies.map((family) => (
                          <button
                            key={family.key}
                            type="button"
                            onClick={() => setActivePaletteFamily(family.key)}
                            className="
                              w-full flex items-center gap-element p-tight rounded-card border text-left
                              bg-spatial-glass-elevated border-spatial-border
                              hover:bg-white/10 hover:border-spatial-border-elevated
                              transition-all duration-200
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                            "
                          >
                            <span className="w-14 h-14 rounded-element overflow-hidden border border-spatial-border-elevated shrink-0 flex">
                              {family.preview.map((hex) => (
                                <i key={hex} aria-hidden style={{ background: hex }} className="flex-1 h-full" />
                              ))}
                            </span>
                            <span className="min-w-0">
                              <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50">
                                {family.label}
                              </Typography>
                              <Typography variant="bodySmall" colorClass="text-neutral-400" className="mt-0.5">
                                {family.description}
                              </Typography>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-tight">
                        <button
                          type="button"
                          onClick={() => setActivePaletteFamily(null)}
                          className="
                            w-full flex items-center gap-tight p-tight rounded-card border text-left
                            bg-primary-500/10 border-primary-400/50
                            hover:bg-primary-500/15
                            transition-all duration-200
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                          "
                        >
                          <img
                            src="/assets/icons/chevron_previous.svg"
                            alt=""
                            aria-hidden
                            className="w-3.5 h-3.5 opacity-70 shrink-0"
                          />
                          <span className="w-12 h-12 rounded-element overflow-hidden border border-spatial-border-elevated shrink-0 flex">
                            {activeFamily.preview.map((hex) => (
                              <i key={hex} aria-hidden style={{ background: hex }} className="flex-1 h-full" />
                            ))}
                          </span>
                          <span className="min-w-0">
                            <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50">
                              {activeFamily.label}
                            </Typography>
                            <Typography variant="bodySmall" colorClass="text-neutral-400" className="mt-0.5">
                              {activeFamily.description}
                            </Typography>
                          </span>
                        </button>

                        {activeFamily.entries.map((entry) => {
                          const isOn = selectedPaletteEntry === entry.key;
                          return (
                            <button
                              key={entry.key}
                              type="button"
                              aria-pressed={isOn}
                              onClick={() => setSelectedPaletteEntry(isOn ? null : entry.key)}
                              className={`
                                w-full flex flex-col gap-tight p-tight rounded-card border text-left
                                transition-all duration-200
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                                ${isOn
                                  ? 'bg-primary-500/15 border-primary-400'
                                  : 'bg-spatial-glass-elevated border-spatial-border hover:bg-white/10 hover:border-spatial-border-elevated'
                                }
                              `}
                            >
                              <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50">
                                {entry.name}
                              </Typography>
                              <div className="flex gap-tight">
                                {entry.swatches.map((hex) => (
                                  <i
                                    key={hex}
                                    aria-hidden
                                    style={{ background: hex }}
                                    className="flex-1 aspect-square rounded-element border border-spatial-border-elevated"
                                  />
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </aside>

              {/* Results */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-element">
                {filteredRooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-tight">
                    <Typography variant="bodyMedium" colorClass="text-neutral-400">
                      No rooms match your filters.
                    </Typography>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element"
                    >
                      <Typography variant="bodySmall" colorClass="text-primary-400" className="underline">
                        Clear filters
                      </Typography>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-element">
                    {filteredRooms.map((room) => {
                      const isActive = room.slug === activeRoomSlug;
                      const variant = representativeVariant(room);
                      const thumbnail = thumbnailFor(room);
                      const tags = [variant?.designStyle, variant?.luxuryLevel, variant?.roomSize].filter(
                        (v): v is string => Boolean(v),
                      );

                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => { if (isActive) return; onSelect(room.slug); onClose(); }}
                          className={`
                            flex flex-col text-left rounded-card border overflow-hidden
                            transition-all duration-200
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                            ${isActive
                              ? 'bg-primary-500/10 border-primary-400/40'
                              : 'bg-spatial-glass-elevated border-spatial-border hover:bg-white/10 hover:border-spatial-border-elevated'
                            }
                          `}
                        >
                          <div className="relative aspect-[4/3] border-b border-spatial-border bg-white/5 flex items-center justify-center">
                            {thumbnail
                              ? <img src={thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
                              : <img src="/assets/icons/design_house.svg" alt="" aria-hidden className="w-8 h-8 opacity-30" />
                            }
                            {isActive && (
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-pill bg-primary-500/30 border border-primary-400/40">
                                <Typography variant="bodySmall" colorClass="text-primary-300" className="uppercase tracking-wider">
                                  Now
                                </Typography>
                              </span>
                            )}
                          </div>
                          <div className="p-tight">
                            <div className="flex items-center justify-between gap-tight">
                              <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100" className="truncate">
                                {room.name}
                              </Typography>
                              <Typography variant="bodySmall" colorClass="text-neutral-500" className="shrink-0">
                                {room.variants.length} style{room.variants.length !== 1 ? 's' : ''}
                              </Typography>
                            </div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-tight">
                                {tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 rounded-pill border border-spatial-border bg-white/5"
                                  >
                                    <Typography variant="bodySmall" colorClass="text-neutral-400">
                                      {titleCase(tag)}
                                    </Typography>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
