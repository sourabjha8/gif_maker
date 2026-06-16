'use client';

import React, { useEffect } from 'react';
import { Typography } from '../UI';
import { formatINR } from '../../lib/pricing/format';
import type { ContentRoom, Hotspot, MaterialFinish, PricingResponse, RoomVariant } from '../../types';

export interface RoomInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  room: ContentRoom;
  variant: RoomVariant;
  pricingByHotspot: Record<string, PricingResponse | undefined>;
  /** When provided, clicking a priced row opens that hotspot's detail panel. */
  onSelectHotspot?: (hotspotId: string) => void;
}

/**
 * Bottom-sheet "elongated" room information panel — opens from the
 * hamburger (Menu) trigger on the tour screen.
 *
 * Sections:
 *   1. Long-form room summary (~100 words).
 *   2. Detailed price breakdown — every priced hotspot with row totals.
 *   3. Materials & finishes — each surface / module with the material
 *      and finish that was specified.
 */
export const RoomInfoPanel: React.FC<RoomInfoPanelProps> = ({
  isOpen,
  onClose,
  room,
  variant,
  pricingByHotspot,
  onSelectHotspot,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
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
  const summary =
    variant.longDescription ??
    variant.description ??
    'Detailed room summary will appear here once content is added.';

  return (
    <>
      <div
        className={`fixed inset-0 z-[125] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-info-title"
        aria-hidden={!isOpen}
        className={`fixed left-1/2 -translate-x-1/2 bottom-0 z-[135] w-full sm:max-w-2xl
          max-h-[min(85vh,720px)]
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal
          rounded-t-container flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-spatial-border-elevated" />
        </div>

        <header className="flex items-start justify-between gap-3 px-6 pt-2 pb-4 border-b border-spatial-border">
          <div className="min-w-0">
            <Typography variant="bodySmall" colorClass="text-primary-400 uppercase tracking-wide">
              {room.name}
            </Typography>
            <Typography variant="h3" weight="semiBold" colorClass="text-neutral-50" className="mt-1 truncate">
              <span id="room-info-title">{variant.name}</span>
            </Typography>
            {variant.designStyle && (
              <Typography variant="bodySmall" colorClass="text-neutral-400" className="mt-1 capitalize">
                {variant.designStyle} · {variant.moduleType ?? 'modular'} · {variant.luxuryLevel ?? '—'}
              </Typography>
            )}
          </div>
          <button
            type="button"
            aria-label="Close room info"
            onClick={onClose}
            className="shrink-0 w-11 h-11 rounded-full bg-spatial-glass-elevated border border-spatial-border text-neutral-200 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-6">
          {/* 1. Summary */}
          <section>
            <Typography
              variant="titleSmall"
              weight="semiBold"
              colorClass="text-neutral-50"
              className="uppercase tracking-wide mb-2"
            >
              Summary
            </Typography>
            <Typography variant="bodyMedium" colorClass="text-neutral-200" className="leading-relaxed">
              {summary}
            </Typography>
          </section>

          {/* 2. Price breakdown */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <Typography
                variant="titleSmall"
                weight="semiBold"
                colorClass="text-neutral-50"
                className="uppercase tracking-wide"
              >
                Price breakdown
              </Typography>
              <Typography variant="bodySmall" colorClass="text-neutral-400">
                {pricedHotspots.length} item{pricedHotspots.length === 1 ? '' : 's'}
              </Typography>
            </div>

            {pricedHotspots.length === 0 ? (
              <Typography variant="bodySmall" colorClass="text-neutral-500" className="italic">
                Pricing loads when you tap a hotspot. Once tapped, the line items appear here.
              </Typography>
            ) : (
              <ul className="space-y-3">
                {pricedHotspots.map((h) => {
                  const p = pricingByHotspot[h.id]!;
                  const Wrapper: React.ElementType = onSelectHotspot ? 'button' : 'div';
                  return (
                    <li key={h.id}>
                      <Wrapper
                        {...(onSelectHotspot
                          ? { type: 'button', onClick: () => onSelectHotspot(h.id) }
                          : {})}
                        className={`w-full text-left rounded-card border border-spatial-border bg-spatial-glass-elevated p-4 ${
                          onSelectHotspot ? 'hover:bg-white/5 transition-colors' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <Typography variant="bodyMedium" weight="semiBold" colorClass="text-neutral-50" className="truncate">
                              {h.label}
                            </Typography>
                            {(h.sku || h.moduleCode) && (
                              <Typography variant="bodySmall" colorClass="text-neutral-500" className="truncate">
                                {h.sku ?? h.moduleCode}
                              </Typography>
                            )}
                          </div>
                          <Typography variant="titleSmall" weight="bold" colorClass="text-primary-400" className="shrink-0">
                            {formatINR(p.totalMinor)}
                          </Typography>
                        </div>
                        {p.rows.length > 0 && (
                          <ul className="space-y-1 mt-2 pt-2 border-t border-spatial-border">
                            {p.rows.map((row) => (
                              <li
                                key={row.id}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="text-neutral-300 truncate">
                                  {row.label}
                                  {row.quantity > 1 ? ` × ${row.quantity}` : ''}
                                </span>
                                <span className="text-neutral-100 shrink-0">
                                  {formatINR(row.totalAmountMinor)}
                                </span>
                              </li>
                            ))}
                            {(p.taxMinor ?? 0) > 0 && (
                              <li className="flex items-center justify-between gap-3 text-xs text-neutral-500">
                                <span>Tax (incl.)</span>
                                <span>{formatINR(p.taxMinor!)}</span>
                              </li>
                            )}
                          </ul>
                        )}
                      </Wrapper>
                    </li>
                  );
                })}
              </ul>
            )}

            {pricedHotspots.length > 0 && (
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-spatial-border">
                <Typography variant="bodyMedium" weight="semiBold" colorClass="text-neutral-50">
                  Visible total
                </Typography>
                <Typography variant="h3" weight="bold" colorClass="text-primary-400">
                  {formatINR(grandTotalMinor)}
                </Typography>
              </div>
            )}
          </section>

          {/* 3. Materials & finishes */}
          <section className="pb-4">
            <Typography
              variant="titleSmall"
              weight="semiBold"
              colorClass="text-neutral-50"
              className="uppercase tracking-wide mb-3"
            >
              Materials &amp; finishes
            </Typography>
            {variant.materials && variant.materials.length > 0 ? (
              <ul className="space-y-3">
                {variant.materials.map((m: MaterialFinish) => (
                  <li
                    key={m.id}
                    className="rounded-card border border-spatial-border bg-spatial-glass-elevated p-4 flex items-start gap-3"
                  >
                    <div
                      className="shrink-0 w-10 h-10 rounded-element border border-spatial-border"
                      style={{ background: m.swatch ?? 'linear-gradient(135deg, #2a2a2a, #1a1a1a)' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <Typography variant="bodyMedium" weight="semiBold" colorClass="text-neutral-50">
                        {m.label}
                      </Typography>
                      <Typography variant="bodySmall" colorClass="text-neutral-300" className="mt-0.5">
                        {m.material}
                        {m.finish ? ` · ${m.finish}` : ''}
                      </Typography>
                      {m.note && (
                        <Typography variant="bodySmall" colorClass="text-neutral-500" className="mt-1">
                          {m.note}
                        </Typography>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="bodySmall" colorClass="text-neutral-500" className="italic">
                Materials and finishes for this variant have not been documented yet.
              </Typography>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};
