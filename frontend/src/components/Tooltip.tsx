'use client';

import React from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Text shown inside the tooltip. */
  label: string;
  /** Side of the trigger the tooltip appears on. Defaults to 'top'. */
  position?: TooltipPosition;
}

const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-3',
  right: 'left-full top-1/2 -translate-y-1/2 ml-3',
};

/**
 * Glass tooltip pill that fades in on hover.
 *
 * Render it as a sibling of the trigger inside a `relative group` wrapper —
 * it reveals on `group-hover`. Purely presentational (pointer-events: none).
 */
export const Tooltip: React.FC<TooltipProps> = ({ label, position = 'top' }) => (
  <span
    role="tooltip"
    className={`
      pointer-events-none absolute z-30 whitespace-nowrap
      ${POSITION_CLASSES[position]}
      rounded-pill bg-spatial-glass backdrop-blur-3xl
      border border-spatial-border shadow-element
      px-element py-tight text-bodySmall text-neutral-100
      opacity-0 group-hover:opacity-100 transition-opacity duration-200
    `}
  >
    {label}
  </span>
);
