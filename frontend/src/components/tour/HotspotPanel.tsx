'use client';

import React, { useEffect } from 'react';
import { Typography } from '../UI';
import { Button } from '../Button';
import type { Hotspot, MediaAsset } from '../../types';
import type { PricingResponse } from '../../types';
import { formatINR } from '../../lib/pricing';

export interface HotspotPanelProps {
  hotspot: Hotspot | null;
  pricing?: PricingResponse | null;
  pricingLoading?: boolean;
  pricingError?: string | null;
  isInEstimate?: boolean;
  onClose: () => void;
  onAddToEstimate?: (hotspot: Hotspot, pricing: PricingResponse | null) => void;
  onPlayVideo?: (media: MediaAsset) => void;
  onNavigateRoom?: (roomSlug: string) => void;
  videoMedia?: MediaAsset;
}

export const HotspotPanel: React.FC<HotspotPanelProps> = ({
  hotspot,
  pricing,
  pricingLoading,
  pricingError,
  isInEstimate,
  onClose,
  onAddToEstimate,
  onPlayVideo,
  onNavigateRoom,
  videoMedia,
}) => {
  // ESC closes
  useEffect(() => {
    if (!hotspot) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hotspot, onClose]);

  const open = !!hotspot;

  return (
    <>
      <div
        className={`fixed inset-0 z-[120] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-0 right-0 z-[130] h-full w-full sm:w-[420px] bg-spatial-glass backdrop-blur-3xl border-l border-spatial-border shadow-modal flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotspot-title"
        aria-hidden={!open}
      >
        {!hotspot ? null : (
          <>
            <header className="flex items-start justify-between gap-3 p-6 border-b border-spatial-border">
              <div className="min-w-0">
                <Typography variant="bodySmall" colorClass="text-primary-400 uppercase tracking-wide">
                  {hotspot.type}
                </Typography>
                <Typography variant="h3" weight="semiBold" colorClass="text-neutral-50" className="mt-1 truncate">
                  <span id="hotspot-title">{hotspot.label}</span>
                </Typography>
                {(hotspot.sku || hotspot.moduleCode) && (
                  <Typography variant="bodySmall" colorClass="text-neutral-400" className="mt-1">
                    {hotspot.sku ? `SKU: ${hotspot.sku}` : `Module: ${hotspot.moduleCode}`}
                  </Typography>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close hotspot details"
                className="shrink-0 w-11 h-11 rounded-full bg-spatial-glass-elevated border border-spatial-border text-neutral-200 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
              >
                ×
              </button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
              {hotspot.image && (
                <div className="rounded-card overflow-hidden border border-spatial-border bg-black/30">
                  <img
                    src={hotspot.image}
                    alt={hotspot.label}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {hotspot.description && (
                <Typography variant="bodyMedium" colorClass="text-neutral-200">
                  {hotspot.description}
                </Typography>
              )}

              {/* Pricing */}
              {hotspot.pricingRef && (
                <div className="rounded-card border border-spatial-border bg-spatial-glass-elevated p-4">
                  <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50" className="mb-3">
                    Pricing
                  </Typography>

                  {pricingLoading && (
                    <Typography variant="bodySmall" colorClass="text-neutral-400">
                      Fetching latest price…
                    </Typography>
                  )}

                  {!pricingLoading && pricingError && (
                    <Typography variant="bodySmall" colorClass="text-amber-300">
                      Pricing temporarily unavailable.
                    </Typography>
                  )}

                  {!pricingLoading && pricing && pricing.status === 'priced' && (
                    <div className="space-y-2">
                      {pricing.rows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <Typography variant="bodySmall" colorClass="text-neutral-200" className="truncate">
                              {row.label}
                            </Typography>
                            {row.code && (
                              <Typography variant="bodySmall" colorClass="text-neutral-500" className="truncate">
                                {row.code} × {row.quantity}
                              </Typography>
                            )}
                          </div>
                          <Typography variant="bodyMedium" weight="medium" colorClass="text-neutral-50" className="shrink-0">
                            {formatINR(row.totalAmountMinor)}
                          </Typography>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-spatial-border">
                        <Typography variant="bodyMedium" weight="semiBold" colorClass="text-neutral-50">
                          Total
                        </Typography>
                        <Typography variant="titleMedium" weight="bold" colorClass="text-primary-400">
                          {formatINR(pricing.totalMinor)}
                        </Typography>
                      </div>
                    </div>
                  )}

                  {!pricingLoading && pricing && pricing.status === 'unavailable' && (
                    <Typography variant="bodySmall" colorClass="text-neutral-400">
                      {pricing.message ?? 'Pricing temporarily unavailable.'}
                    </Typography>
                  )}
                </div>
              )}
            </div>

            <footer className="p-6 border-t border-spatial-border space-y-2">
              {hotspot.type === 'navigation' && hotspot.targetRoomSlug ? (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    onNavigateRoom?.(hotspot.targetRoomSlug as string);
                  }}
                >
                  Go to {hotspot.label}
                </Button>
              ) : null}

              {hotspot.videoRef && videoMedia && onPlayVideo && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => onPlayVideo(videoMedia)}
                >
                  Play video
                </Button>
              )}

              {hotspot.pricingRef && onAddToEstimate && (
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={pricingLoading || isInEstimate}
                  onClick={() => onAddToEstimate(hotspot, pricing ?? null)}
                >
                  {isInEstimate ? 'Already added' : 'Add to estimate'}
                </Button>
              )}
            </footer>
          </>
        )}
      </aside>
    </>
  );
};
