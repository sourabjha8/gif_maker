'use client';

import React from 'react';
import { CountBadge } from './CountBadge';

export interface EstimateButtonProps {
  /** Number of items in the estimate. */
  count: number;
  onClick?: () => void;
  /** Visible text. Defaults to "Estimate". */
  label?: string;
  className?: string;
}

/**
 * Glass pill button that opens the estimate, with a trailing item-count badge.
 */
export const EstimateButton: React.FC<EstimateButtonProps> = ({
  count,
  onClick,
  label = 'Estimate',
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Open ${label.toLowerCase()}, ${count} item${count === 1 ? '' : 's'}`}
    className={`
      relative h-11 px-element rounded-pill
      bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
      text-neutral-50 hover:bg-white/10 transition
      flex items-center gap-tight
      ${className}
    `}
  >
    <span className="text-sm font-semibold">{label}</span>
    <CountBadge count={count} />
  </button>
);
