'use client';

import React, { useEffect } from 'react';
import { Typography } from '../UI';
import { formatINR } from '../../lib/pricing/format';
import type { ContentRoom, GalleryImage, Hotspot, MaterialFinish, PricingResponse, RoomVariant } from '../../types';

export interface RoomInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  room: ContentRoom;
  variant: RoomVariant;
  projectName: string;
  projectBhkType?: string;
  roomIndex: number;
  totalRooms: number;
  pricingByHotspot: Record<string, PricingResponse | undefined>;
  onAddHotspot: (hotspot: Hotspot, pricing: PricingResponse | null) => void;
  isInEstimate: (hotspotId: string) => boolean;
}

export const RoomInfoPanel: React.FC<RoomInfoPanelProps> = ({
  isOpen,
  onClose,
  room,
  variant,
  projectName,
  projectBhkType,
  roomIndex,
  totalRooms,
  pricingByHotspot,
  onAddHotspot,
  isInEstimate,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const pricedHotspots = variant.hotspots.filter(
    (h: Hotspot) => h.pricingRef && pricingByHotspot[h.id]?.status === 'priced',
  );

  const grandTotalMinor = pricedHotspots.reduce(
    (sum, h) => sum + (pricingByHotspot[h.id]?.totalMinor ?? 0),
    0,
  );

  const subtotalMinor = pricedHotspots.reduce(
    (sum, h) => sum + (pricingByHotspot[h.id]?.subtotalMinor ?? 0),
    0,
  );

  const discountMinor = grandTotalMinor - subtotalMinor;

  const summary = variant.longDescription ?? variant.description ?? 'Room summary will appear here.';
  const gallery: GalleryImage[] = variant.gallery ?? [];
  const materials: MaterialFinish[] = variant.materials ?? [];

  const breadcrumb = [projectName, projectBhkType, `Room ${roomIndex} / ${totalRooms}`]
    .filter(Boolean)
    .join(' · ')
    .toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[125] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Bottom sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-info-title"
        aria-hidden={!isOpen}
        className={`
          fixed bottom-0 left-0 right-0 z-[135]
          h-[88dvh]
          flex flex-col
          bg-spatial-glass backdrop-blur-3xl border-t border-spatial-border shadow-modal
          rounded-t-container
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <header className="shrink-0 flex items-center justify-between gap-element px-element pt-tight pb-element border-b border-spatial-border">
          <div className="min-w-0 flex-1">
            <Typography variant="bodySmall" colorClass="text-neutral-500">
              {breadcrumb}
            </Typography>
            <div className="flex items-center gap-tight mt-0.5 flex-wrap">
              <span id="room-info-title">
                <Typography variant="h3" weight="bold" colorClass="text-neutral-50">
                  {room.name}
                </Typography>
              </span>
              {variant.name && (
                <span className="
                  px-element py-1 rounded-pill
                  border border-spatial-border bg-spatial-glass-elevated
                ">
                  <Typography variant="bodySmall" colorClass="text-neutral-300">
                    Style · {variant.name}
                  </Typography>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-tight shrink-0">
            {grandTotalMinor > 0 && (
              <button
                type="button"
                onClick={() => pricedHotspots.forEach(h => onAddHotspot(h, pricingByHotspot[h.id] ?? null))}
                className="
                  flex items-center gap-tight h-11 px-element rounded-pill
                  bg-neutral-900 border border-neutral-700
                  text-neutral-50 hover:bg-neutral-800
                  transition-all duration-200 active:scale-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                "
              >
                <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-4 h-4 opacity-70" />
                <Typography variant="bodySmall" weight="bold" colorClass="text-inherit">
                  Add all · {formatINR(grandTotalMinor)}
                </Typography>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close room info"
              className="
                w-11 h-11 flex items-center justify-center rounded-pill
                bg-spatial-glass-elevated border border-spatial-border
                text-neutral-300 hover:text-white hover:bg-white/10
                transition-all duration-200 active:scale-95
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              "
            >
              <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </header>

        {/* Body — two columns */}
        <div className="flex-1 overflow-hidden flex gap-0 min-h-0">

          {/* Left column: summary · gallery · materials */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-element py-element space-y-group border-r border-spatial-border">

            {/* Summary */}
            <section>
              <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mb-tight">
                Summary
              </Typography>
              <Typography variant="bodyMedium" colorClass="text-neutral-300">
                {summary}
              </Typography>
            </section>

            {/* Gallery */}
            {gallery.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-tight">
                  <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest">
                    Gallery
                  </Typography>
                  <Typography variant="bodySmall" colorClass="text-neutral-500">
                    {gallery.length} photo{gallery.length !== 1 ? 's' : ''}
                  </Typography>
                </div>
                {/* Main image */}
                <div className="w-full aspect-video rounded-card overflow-hidden border border-spatial-border bg-white/5 mb-tight">
                  <img src={gallery[0].url} alt={gallery[0].title ?? ''} className="w-full h-full object-cover" draggable={false} />
                </div>
                {/* Thumbnails */}
                {gallery.length > 1 && (
                  <div className="grid grid-cols-3 gap-tight">
                    {gallery.slice(1, 4).map((img) => (
                      <div key={img.id} className="aspect-video rounded-element overflow-hidden border border-spatial-border bg-white/5">
                        <img src={img.url} alt={img.title ?? ''} className="w-full h-full object-cover" draggable={false} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Materials & Finishes */}
            {materials.length > 0 && (
              <section className="pb-element">
                <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mb-tight">
                  Materials &amp; Finishes
                </Typography>
                <div className="flex gap-element flex-wrap">
                  {materials.map((m: MaterialFinish) => (
                    <div key={m.id} className="flex items-center gap-tight">
                      <div
                        className="w-10 h-10 rounded-element border border-spatial-border shrink-0"
                        style={{ background: m.swatch ?? 'linear-gradient(135deg,#2a2a2a,#1a1a1a)' }}
                        aria-hidden="true"
                      />
                      <div>
                        <Typography variant="bodySmall" weight="medium" colorClass="text-neutral-200">
                          {m.label}
                        </Typography>
                        <Typography variant="bodySmall" colorClass="text-neutral-500">
                          {m.material}{m.finish ? ` · ${m.finish}` : ''}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column: assets + price breakdown */}
          <div className="w-[420px] shrink-0 overflow-y-auto custom-scrollbar px-element py-element space-y-group">

            {/* Assets */}
            <section>
              <div className="flex items-center justify-between mb-tight">
                <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest">
                  Assets in this room
                </Typography>
                <Typography variant="bodySmall" colorClass="text-neutral-500">
                  {pricedHotspots.length} item{pricedHotspots.length !== 1 ? 's' : ''}
                </Typography>
              </div>

              {pricedHotspots.length === 0 ? (
                <Typography variant="bodySmall" colorClass="text-neutral-500">
                  Tap a hotspot in the room to load asset pricing.
                </Typography>
              ) : (
                <ul className="space-y-tight">
                  {pricedHotspots.map((h) => {
                    const p = pricingByHotspot[h.id]!;
                    const added = isInEstimate(h.id);
                    return (
                      <li key={h.id} className="flex items-center gap-element p-tight rounded-card border border-spatial-border bg-spatial-glass-elevated">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-element border border-spatial-border bg-white/5 shrink-0 flex items-center justify-center">
                          <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-5 h-5 opacity-30" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Typography variant="titleSmall" colorClass="text-neutral-100" className="truncate">
                            {h.label}
                          </Typography>
                          {(h.sku || h.moduleCode) && (
                            <Typography variant="bodySmall" colorClass="text-neutral-500" className="truncate">
                              {h.sku ?? h.moduleCode}
                            </Typography>
                          )}
                        </div>
                        {/* Price */}
                        <Typography variant="titleSmall" weight="bold" colorClass="text-neutral-100" className="shrink-0">
                          {formatINR(p.totalMinor)}
                        </Typography>
                        {/* Add button */}
                        <button
                          type="button"
                          onClick={() => onAddHotspot(h, p)}
                          disabled={added}
                          className={`
                            shrink-0 h-9 px-element rounded-pill border text-sm font-semibold
                            transition-all duration-200 active:scale-95
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                            ${added
                              ? 'bg-primary-500/20 border-primary-400/40 text-primary-300 cursor-default'
                              : 'bg-spatial-glass-elevated border-spatial-border text-neutral-200 hover:bg-white/10 hover:text-white'
                            }
                          `}
                        >
                          {added ? 'Added' : 'Add'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Price breakdown */}
            {pricedHotspots.length > 0 && (
              <section className="pb-element">
                <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mb-tight">
                  Price Breakdown
                </Typography>
                <div className="rounded-card border border-spatial-border bg-spatial-glass-elevated p-element space-y-tight">
                  <div className="flex justify-between">
                    <Typography variant="bodyMedium" colorClass="text-neutral-300">
                      Items subtotal ({pricedHotspots.length})
                    </Typography>
                    <Typography variant="bodyMedium" colorClass="text-neutral-100">
                      {formatINR(subtotalMinor)}
                    </Typography>
                  </div>
                  {discountMinor < 0 && (
                    <div className="flex justify-between">
                      <Typography variant="bodyMedium" colorClass="text-neutral-300">Bundle discount</Typography>
                      <Typography variant="bodyMedium" colorClass="text-primary-400">
                        – {formatINR(Math.abs(discountMinor))}
                      </Typography>
                    </div>
                  )}
                  <div className="pt-tight mt-tight border-t border-spatial-border flex justify-between">
                    <Typography variant="titleSmall" weight="bold" colorClass="text-neutral-50">
                      Room total
                    </Typography>
                    <Typography variant="titleSmall" weight="bold" colorClass="text-neutral-50">
                      {formatINR(grandTotalMinor)}
                    </Typography>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
