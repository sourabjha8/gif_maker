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
  onRemoveHotspot: (hotspotId: string) => void;
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
  onRemoveHotspot,
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

  const itemsSubtotalMinor = pricedHotspots.reduce(
    (sum, h) => sum + (pricingByHotspot[h.id]?.totalMinor ?? 0),
    0,
  );

  const taxMinor = Math.round(itemsSubtotalMinor * 0.18);
  const grandTotalMinor = itemsSubtotalMinor + taxMinor;
  const allAdded = pricedHotspots.length > 0 && pricedHotspots.every(h => isInEstimate(h.id));


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
          h-[calc(min(100dvh,100vw)*0.88)]
          flex flex-col
          bg-spatial-glass backdrop-blur-3xl border-t border-spatial-border shadow-modal
          rounded-t-container
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-pill bg-white/20" />
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
                onClick={() => { if (!allAdded) pricedHotspots.forEach(h => onAddHotspot(h, pricingByHotspot[h.id] ?? null)); }}
                disabled={allAdded}
                className={`
                  flex items-center gap-tight h-11 px-element rounded-pill border
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                  ${allAdded
                    ? 'bg-primary-500/20 border-primary-400/40 text-primary-300 cursor-default'
                    : 'bg-neutral-900/40 border-neutral-700/40 text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 hover:bg-neutral-900/70 active:scale-95'
                  }
                `}
              >
                <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-4 h-4 opacity-70" />
                <Typography variant="bodySmall" weight="bold" colorClass="text-inherit">
                  {allAdded ? 'Added all' : 'Add all'} · {formatINR(grandTotalMinor)}
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

        {/* Body — two columns on desktop; on phones it stacks into one
            scroll column with the price/assets block on top (room + price is
            the priority), summary/gallery below. */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-0 overflow-y-auto lg:overflow-hidden custom-scrollbar">

          {/* Left column: summary · gallery · materials */}
          <div className="order-2 lg:order-1 lg:flex-1 overflow-visible lg:overflow-y-auto custom-scrollbar px-element py-element space-y-group lg:border-r border-spatial-border">

            {/* Summary */}
            <section>
              <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mb-tight">
                Summary
              </Typography>
              <Typography variant="bodyMedium" colorClass="text-neutral-300">
                {summary}
              </Typography>
            </section>

            {/* Materials & Finishes — editorial credibility section */}
            {materials.length > 0 && (
              <section className="py-group">
                {/* Kicker + headline */}
                <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mb-tight">
                  Materials &amp; Finishes
                </Typography>

                {/* Swatch grid — non-interactive, editorial */}
                <div className="flex flex-wrap gap-group">
                  {materials.map((m: MaterialFinish) => (
                    <div key={m.id} className="flex flex-col w-[130px]">
                      {/* Texture swatch — square, no radius, no chrome. inline background is data-driven, no token alternative */}
                      <div
                        className="w-full aspect-square"
                        style={{ background: m.swatch ?? 'linear-gradient(135deg,#2a2a2a,#1a1a1a)' }}
                        aria-hidden="true"
                      />
                      {/* Category label */}
                      <Typography variant="titleSmall" colorClass="text-neutral-100" className="mt-tight leading-tight">
                        {m.label}
                      </Typography>
                      {/* Finish spec */}
                      <Typography variant="bodySmall" colorClass="text-neutral-500" className="leading-tight">
                        {m.material}{m.finish ? ` · ${m.finish}` : ''}
                      </Typography>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery — hero + 3-thumbnail editorial layout */}
            {gallery.length > 0 && (
              <section className="pb-element">
                <div className="flex items-center justify-between mb-tight">
                  <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest">
                    Gallery
                  </Typography>
                  <Typography variant="bodySmall" colorClass="text-neutral-500">
                    {gallery.length} photo{gallery.length !== 1 ? 's' : ''}
                  </Typography>
                </div>

                {/* Hero image */}
                <div className="w-full aspect-video overflow-hidden bg-white/5 mb-tight">
                  <img
                    src={gallery[0].url}
                    alt={gallery[0].title ?? ''}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* Thumbnails row — up to 3, last one gets "see all" if more exist */}
                {gallery.length > 1 && (
                  <div className="flex gap-tight w-full">
                    {gallery.slice(1, 4).map((img, idx) => {
                      const isLast = idx === 2;
                      const hasMore = gallery.length > 4;
                      return (
                        <div
                          key={img.id}
                          className="relative flex-1 aspect-video overflow-hidden bg-white/5"
                        >
                          <img
                            src={img.url}
                            alt={img.title ?? ''}
                            className={`w-full h-full object-cover ${isLast && hasMore ? 'blur-sm scale-105' : ''}`}
                            draggable={false}
                          />
                          {isLast && hasMore && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 px-tight">
                              <Typography variant="bodySmall" weight="bold" colorClass="text-white" className="text-center leading-tight">
                                See all {gallery.length} images
                              </Typography>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right column: assets + price breakdown */}
          <div className="order-1 lg:order-2 w-full lg:w-[580px] shrink-0 overflow-visible lg:overflow-y-auto custom-scrollbar px-element py-element space-y-group border-b lg:border-b-0 border-spatial-border">

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
                          <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-6 h-6 opacity-30" />
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
                        {/* Add / Remove button */}
                        {added ? (
                          <button
                            type="button"
                            onClick={() => onRemoveHotspot(h.id)}
                            className="
                              shrink-0 h-11 px-element rounded-pill border text-sm font-semibold
                              bg-red-500/15 border-red-400/40 text-red-300
                              hover:bg-red-500/25 hover:text-red-200
                              transition-all duration-200 active:scale-95
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                            "
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddHotspot(h, p)}
                            className="
                              shrink-0 h-11 px-element rounded-pill border text-sm font-semibold
                              bg-spatial-glass-elevated border-spatial-border text-neutral-200
                              hover:bg-white/10 hover:text-white
                              transition-all duration-200 active:scale-95
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                            "
                          >
                            Add
                          </button>
                        )}
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
                      {formatINR(itemsSubtotalMinor)}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="bodyMedium" colorClass="text-neutral-300">Est. GST (18%)</Typography>
                    <Typography variant="bodyMedium" colorClass="text-neutral-100">
                      {formatINR(taxMinor)}
                    </Typography>
                  </div>
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
