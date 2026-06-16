'use client';

import React from 'react';
import { Typography } from '../UI';
import { formatINR } from '../../lib/pricing/format';
import type { Hotspot, PricingResponse, RoomVariant } from '../../types';

export interface RoomDescriptionCardProps {
  variant: RoomVariant;
  pricingByHotspot: Record<string, PricingResponse | undefined>;
  onSelectHotspot?: (hotspotId: string) => void;
}

/**
 * Bottom-anchored description card.
 * Shows the variant name + description and a compact element pricing list
 * for every hotspot that has a pricing snapshot loaded.
 */
export const RoomDescriptionCard: React.FC<RoomDescriptionCardProps> = ({
  variant,
  pricingByHotspot,
  onSelectHotspot,
}) => {
  const pricedElements = variant.hotspots.filter(
    (h: Hotspot) => h.pricingRef && pricingByHotspot[h.id]?.status === 'priced',
  );
  const totalMinor = pricedElements.reduce(
    (sum, h) => sum + (pricingByHotspot[h.id]?.totalMinor ?? 0),
    0,
  );

  return (
    <div className="pointer-events-auto bg-spatial-glass backdrop-blur-3xl border border-spatial-border rounded-card px-5 py-4 shadow-modal max-w-md w-full">
      <Typography variant="titleMedium" weight="semiBold" colorClass="text-neutral-50" className="mb-1">
        {variant.name}
      </Typography>
      {variant.description && (
        <Typography variant="bodySmall" colorClass="text-neutral-300" className="mb-3">
          {variant.description}
        </Typography>
      )}

      {pricedElements.length > 0 ? (
        <div className="border-t border-spatial-border pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <Typography variant="bodySmall" weight="semiBold" colorClass="text-neutral-200" className="uppercase tracking-wide">
              Elements priced
            </Typography>
            <Typography variant="bodySmall" colorClass="text-neutral-400">
              {pricedElements.length}
            </Typography>
          </div>
          <ul className="space-y-1.5">
            {pricedElements.slice(0, 4).map((h) => {
              const p = pricingByHotspot[h.id]!;
              const Wrapper: React.ElementType = onSelectHotspot ? 'button' : 'div';
              return (
                <li key={h.id}>
                  <Wrapper
                    {...(onSelectHotspot
                      ? { type: 'button', onClick: () => onSelectHotspot(h.id) }
                      : {})}
                    className={`w-full flex items-center justify-between gap-3 text-left ${
                      onSelectHotspot ? 'hover:text-white text-neutral-100 transition-colors' : 'text-neutral-100'
                    }`}
                  >
                    <span className="min-w-0 truncate text-sm">{h.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-primary-300">
                      {formatINR(p.totalMinor)}
                    </span>
                  </Wrapper>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between pt-2 border-t border-spatial-border">
            <Typography variant="bodySmall" colorClass="text-neutral-300">
              Visible total
            </Typography>
            <Typography variant="bodyMedium" weight="bold" colorClass="text-primary-400">
              {formatINR(totalMinor)}
            </Typography>
          </div>
        </div>
      ) : (
        <Typography variant="bodySmall" colorClass="text-neutral-500" className="italic">
          Tap a hotspot to view element pricing.
        </Typography>
      )}
    </div>
  );
};
