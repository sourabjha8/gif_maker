'use client';

import React from 'react';
import { Typography } from '../UI';
import type { RoomVariant } from '../../types';

export interface VariantSwitcherProps {
  variants: RoomVariant[];
  activeVariantSlug: string;
  onSelect: (variant: RoomVariant) => void;
}

/**
 * Full-panorama variant switcher.
 * Lists every variant of the current room (e.g. modern / classic / minimal)
 * and lets the user swap the panorama by switching variants.
 *
 * Reference: BUILD_PLAN.md §11 - "Full panorama variant" mode is the safe,
 * geometry-correct way to do material/finish swaps in v1.
 */
export const VariantSwitcher: React.FC<VariantSwitcherProps> = ({
  variants,
  activeVariantSlug,
  onSelect,
}) => {
  if (variants.length <= 1) return null;

  return (
    <div className="pointer-events-auto bg-spatial-glass backdrop-blur-3xl border border-spatial-border rounded-pill p-1.5 flex items-center gap-1 shadow-card">
      {variants.map((variant) => {
        const isActive = variant.slug === activeVariantSlug;
        return (
          <button
            key={variant.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(variant)}
            className={`px-4 h-10 min-h-[44px] rounded-pill text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary-500 text-white shadow-element'
                : 'text-neutral-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Typography variant="bodySmall" weight={isActive ? 'semiBold' : 'medium'} className="text-inherit">
              {variant.name}
            </Typography>
          </button>
        );
      })}
    </div>
  );
};
