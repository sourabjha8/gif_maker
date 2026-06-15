'use client';

import React from 'react';

export interface CountBadgeProps {
  /** Number to display. */
  count: number;
  /** Extra classes (e.g. positioning when used as an overlay badge). */
  className?: string;
}

/**
 * Small pill badge for counts — estimate item totals, notification counts, etc.
 */
export const CountBadge: React.FC<CountBadgeProps> = ({ count, className = '' }) => (
  <span
    className={`
      min-w-6 h-6 px-1.5 rounded-full
      bg-primary-500 text-white text-[11px] font-bold
      flex items-center justify-center
      ${className}
    `}
  >
    {count}
  </span>
);
