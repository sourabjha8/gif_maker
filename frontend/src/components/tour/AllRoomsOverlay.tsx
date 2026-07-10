'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Typography } from '../UI';
import type { ContentRoom, RoomVariant } from '../../types';

export interface AllRoomsOverlayProps {
  projectName: string;
  projectBhkType?: string;
  rooms: ContentRoom[];
  activeRoomSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (roomSlug: string) => void;
}

type FacetKey = 'designStyle' | 'moduleType' | 'luxuryLevel' | 'roomSize';

const FACETS: { key: FacetKey; label: string }[] = [
  { key: 'designStyle', label: 'Design style' },
  { key: 'moduleType', label: 'Module type' },
  { key: 'luxuryLevel', label: 'Luxury level' },
  { key: 'roomSize', label: 'Room size' },
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
  if (s < 12) return 'neutral';
  if (l < 35 && s > 15) return 'bold';
  if (h < 20 || h >= 340) return 'warm';
  if (h < 55) return s < 35 ? 'earthy' : 'warm';
  if (h < 170) return 'earthy';
  if (h < 260) return 'cool';
  return 'bold';
}

function extractSwatchHexes(swatch?: string): string[] {
  if (!swatch) return [];
  return swatch.match(/#[0-9a-f]{6}/gi) ?? [];
}

export const AllRoomsOverlay: React.FC<AllRoomsOverlayProps> = ({
  projectName,
  projectBhkType,
  rooms,
  activeRoomSlug,
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selections, setSelections] = useState<Record<FacetKey, Set<string>>>(emptyFacetSelections());
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [activePaletteFamily, setActivePaletteFamily] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset filters each time the overlay is opened fresh.
  useEffect(() => {
    if (isOpen) {
      setSelections(emptyFacetSelections());
      setSelectedShade(null);
      setActivePaletteFamily(null);
    }
  }, [isOpen]);

  // Chip facets — always shown when the data has the field at all (even a
  // single option is a real, honest filter; hiding the whole section reads
  // as broken).
  const facetGroups = useMemo(() => {
    return FACETS.map(({ key, label }) => {
      const values = new Set<string>();
      rooms.forEach((room) => room.variants.forEach((v) => {
        const value = v[key];
        if (value) values.add(value);
      }));
      return { key, label, options: Array.from(values).sort() };
    }).filter((g) => g.options.length > 0);
  }, [rooms]);

  // Palette families — bucketed from real material swatches, family only
  // rendered if at least one real swatch falls into it.
  const paletteFamilies = useMemo(() => {
    const byFamily: Record<string, Set<string>> = {};
    rooms.forEach((room) => room.variants.forEach((v) => {
      (v.materials ?? []).forEach((m) => {
        extractSwatchHexes(m.swatch).forEach((hex) => {
          const family = classifyPalette(hex);
          if (!byFamily[family]) byFamily[family] = new Set();
          byFamily[family].add(hex.toLowerCase());
        });
      });
    }));
    return Object.entries(byFamily).map(([key, hexes]) => ({
      key,
      label: PALETTE_FAMILIES[key] ?? titleCase(key),
      shades: Array.from(hexes).sort(),
    }));
  }, [rooms]);

  const hasActiveFilters = facetGroups.some((g) => selections[g.key].size > 0) || selectedShade !== null;

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const facetsMatch = facetGroups.every(({ key }) => {
        const selected = selections[key];
        if (selected.size === 0) return true;
        return room.variants.some((v) => v[key] && selected.has(v[key] as string));
      });
      if (!facetsMatch) return false;
      if (!selectedShade) return true;
      return room.variants.some((v) =>
        (v.materials ?? []).some((m) => extractSwatchHexes(m.swatch).some((hex) => hex.toLowerCase() === selectedShade)),
      );
    });
  }, [rooms, facetGroups, selections, selectedShade]);

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
    setSelectedShade(null);
    setActivePaletteFamily(null);
  };

  const activeFamily = paletteFamilies.find((f) => f.key === activePaletteFamily);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="All rooms"
      aria-hidden={!isOpen}
      className={`
        fixed inset-0 z-[160]
        flex flex-col
        bg-spatial-glass backdrop-blur-3xl
        transition-all duration-300 ease-out
        ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-[0.99] pointer-events-none'}
      `}
    >
      {/* Header */}
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
              <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100" className="mb-tight">
                {group.label}
              </Typography>
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
          {paletteFamilies.length > 0 && (
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
                        flex items-center gap-tight p-tight rounded-element border text-left
                        bg-spatial-glass-elevated border-spatial-border
                        hover:bg-white/10 hover:border-spatial-border-elevated
                        transition-all duration-200
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                      "
                    >
                      <span className="flex shrink-0">
                        {family.shades.slice(0, 3).map((hex, i) => (
                          <i
                            key={hex}
                            aria-hidden
                            style={{ background: hex, marginLeft: i === 0 ? 0 : -6 }}
                            className="w-5 h-5 rounded-full border border-spatial-border-elevated"
                          />
                        ))}
                      </span>
                      <Typography variant="bodySmall" colorClass="text-neutral-200">
                        {family.label}
                      </Typography>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setActivePaletteFamily(null)}
                    className="
                      flex items-center gap-tight mb-tight
                      text-neutral-300 hover:text-white transition-colors duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element
                    "
                  >
                    <img
                      src="/assets/icons/chevron_previous.svg"
                      alt=""
                      aria-hidden
                      className="w-3.5 h-3.5 opacity-70"
                    />
                    <Typography variant="bodySmall" colorClass="text-inherit">
                      {activeFamily.label}
                    </Typography>
                  </button>
                  <div className="flex flex-wrap gap-tight">
                    {activeFamily.shades.map((hex) => {
                      const isOn = selectedShade === hex;
                      return (
                        <button
                          key={hex}
                          type="button"
                          aria-pressed={isOn}
                          aria-label={`Filter by shade ${hex}`}
                          onClick={() => setSelectedShade(isOn ? null : hex)}
                          style={{ background: hex }}
                          className={`
                            w-7 h-7 rounded-full border-2 transition-all duration-200
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                            ${isOn ? 'border-primary-400 scale-110' : 'border-spatial-border-elevated'}
                          `}
                        />
                      );
                    })}
                  </div>
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
                const tags = [variant?.designStyle, variant?.luxuryLevel, variant?.roomSize].filter(
                  (v): v is string => Boolean(v),
                );

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => { onSelect(room.slug); onClose(); }}
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
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] border-b border-spatial-border bg-white/5 flex items-center justify-center">
                      {room.thumbnail
                        ? <img src={room.thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
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

                    {/* Info */}
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
  );
};
