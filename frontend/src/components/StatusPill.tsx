'use client';

import React from 'react';
import { Typography } from './UI';

export interface StatusPillProps {
  /** Text shown in the pill. */
  label: string;
  /** Show a leading status dot. Defaults to false. */
  showDot?: boolean;
  /** Dot colour class. Defaults to a pulsing primary dot. */
  dotClassName?: string;
  /** Extra classes for the outer pill. */
  className?: string;
}

/**
 * Glass status pill with an optional leading dot — the "now viewing" room
 * badge, connection/state indicators, and similar at-a-glance labels.
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  showDot = false,
  dotClassName = 'bg-primary-400 animate-pulse',
  className = '',
}) => (
  <div
    className={`
      bg-spatial-glass backdrop-blur-3xl border border-spatial-border
      rounded-pill px-element py-tight shadow-card
      flex items-center gap-tight
      ${className}
    `}
  >
    {showDot && <span className={`w-2 h-2 rounded-full ${dotClassName}`} />}
    <Typography variant="bodyMedium" weight="medium" colorClass="text-neutral-50">
      {label}
    </Typography>
  </div>
);
