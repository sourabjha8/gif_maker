'use client';

import React from 'react';
import { Tooltip, type TooltipPosition } from './Tooltip';

export type GlassIconButtonShape = 'circle' | 'rounded';

export interface GlassIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label; also used as the tooltip text when `tooltip` is set. */
  label: string;
  /** Show a hover tooltip with `label`. Defaults to false. */
  tooltip?: boolean;
  /** Side the tooltip appears on. Defaults to 'top'. */
  tooltipPosition?: TooltipPosition;
  /** `circle` → fully round, `rounded` → card radius. Defaults to 'circle'. */
  shape?: GlassIconButtonShape;
  /** Selected/toggled state — fills with primary colour. */
  active?: boolean;
  /**
   * Icon content. When omitted, falls back to the shared default icon.
   * Pass an icon component or an `<img>` (e.g. a rotated chevron) for control.
   */
  children?: React.ReactNode;
}

/**
 * Glass, bordered, 44×44+ icon-only button — the shared primitive behind the
 * viewer dock, the room navigator, and any other floating icon control.
 *
 * Wrapped in a `relative group` span so an optional {@link Tooltip} can reveal
 * on hover without the caller wiring up positioning.
 */
export const GlassIconButton = React.forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  (
    {
      label,
      tooltip = false,
      tooltipPosition = 'top',
      shape = 'circle',
      active = false,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-card';
    const stateClass = active
      ? 'bg-primary-500 text-white border-primary-400'
      : 'bg-spatial-glass text-neutral-100 border-spatial-border hover:text-white hover:bg-white/10 hover:border-spatial-border-elevated';

    return (
      <span className="relative group inline-flex">
        <button
          ref={ref}
          type="button"
          aria-label={label}
          className={`
            w-12 h-12 min-w-[44px] min-h-[44px] flex items-center justify-center
            ${shapeClass}
            backdrop-blur-3xl border shadow-card
            transition-all duration-200 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            ${stateClass}
            disabled:opacity-40 disabled:cursor-not-allowed
            disabled:hover:bg-spatial-glass disabled:hover:border-spatial-border disabled:active:scale-100
            ${className}
          `}
          {...props}
        >
          {children ?? (
            <img
              src="/assets/icons/default_icon.svg"
              alt=""
              aria-hidden="true"
              className="w-6 h-6 opacity-80"
            />
          )}
        </button>
        {tooltip && <Tooltip label={label} position={tooltipPosition} />}
      </span>
    );
  },
);

GlassIconButton.displayName = 'GlassIconButton';
