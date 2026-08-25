'use client';

/**
 * Anchored room picker for a cart row's room label.
 *
 * Renders as a floating popover (position: fixed, sized off the trigger's
 * own bounding rect) so opening/closing it never changes the row's height
 * or shifts any other row in the list — unlike an inline expanding list.
 *
 * Rendered through a portal into document.body rather than inline: the cart
 * drawer slides in/out via a `transform` on its own root, and a `transform`
 * on any ancestor makes that ancestor the containing block for `position:
 * fixed` descendants instead of the viewport. Without the portal, the
 * popover's viewport-relative coordinates would resolve against the sliding
 * drawer and it would render off-screen.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Typography } from '../UI';

interface RoomOption {
  slug: string;
  name: string;
}

export interface RoomLabelPickerProps {
  label: string;
  itemLabel: string;
  options: RoomOption[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

interface Placement {
  left: number;
  top?: number;
  bottom?: number;
  minWidth: number;
  openUp: boolean;
}

const VISIBLE_COUNT = 4;
const ROW_HEIGHT = 36;
const POPOVER_PADDING = 8;
const VIEWPORT_MARGIN = 8;

export const RoomLabelPicker: React.FC<RoomLabelPickerProps> = ({
  label,
  itemLabel,
  options,
  selectedSlug,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setIsOpen(false);
    setExpanded(false);
  };

  // Selected room pinned to the top, then the rest in taxonomy order.
  const ordered = [
    ...options.filter((r) => r.slug === selectedSlug),
    ...options.filter((r) => r.slug !== selectedSlug),
  ];
  const visible = expanded ? ordered : ordered.slice(0, VISIBLE_COUNT + 1);
  const remaining = ordered.length - visible.length;

  const computePlacement = useCallback((expandedNow: boolean) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const rowCount = expandedNow
      ? ordered.length
      : Math.min(ordered.length, VISIBLE_COUNT + 1) + (ordered.length > VISIBLE_COUNT + 1 ? 1 : 0);
    const estimatedHeight = Math.min(rowCount, 8) * ROW_HEIGHT + POPOVER_PADDING * 2;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight + VIEWPORT_MARGIN && rect.top > estimatedHeight;

    const longestName = options.reduce((max, r) => Math.max(max, r.name.length), 0);
    const minWidth = Math.max(rect.width, Math.min(220, Math.max(160, longestName * 7)));

    setPlacement({
      left: rect.left,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      minWidth,
      openUp,
    });
  }, [ordered, options]);

  const openPicker = () => {
    computePlacement(false);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const handleReposition = () => computePlacement(expanded);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, expanded, computePlacement]);

  // Re-measure when the list within the popover grows via "+N more" so the
  // up/down flip decision accounts for the taller content.
  useEffect(() => {
    if (isOpen) computePlacement(expanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : openPicker())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change room for ${itemLabel}, currently ${label}`}
        className="
          flex items-center gap-0.5 min-w-0 max-w-full -mx-1 px-1 rounded-element
          hover:bg-white/5 transition-colors duration-150
          focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
        "
      >
        <Typography variant="bodySmall" colorClass="text-neutral-400" className="truncate capitalize">
          {label}
        </Typography>
        <img
          src="/assets/icons/chevron_down.svg"
          alt=""
          aria-hidden
          className={`w-2.5 h-2.5 shrink-0 opacity-50 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && placement && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          aria-label={`Choose room for ${itemLabel}`}
          style={{
            position: 'fixed',
            left: placement.left,
            top: placement.top,
            bottom: placement.bottom,
            minWidth: placement.minWidth,
            maxWidth: 280,
            zIndex: 200,
          }}
          className="
            max-h-64 overflow-y-auto custom-scrollbar py-1
            rounded-element border border-spatial-border-elevated
            bg-spatial-glass-elevated backdrop-blur-2xl shadow-modal
          "
        >
          {visible.map((room) => {
            const isActive = room.slug === selectedSlug;
            return (
              <button
                key={room.slug}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(room.slug);
                  close();
                }}
                className={`
                  w-full flex items-center justify-between gap-tight
                  px-element py-1.5 text-left whitespace-nowrap
                  transition-colors duration-100
                  focus:outline-none focus-visible:bg-white/10
                  ${isActive ? 'text-primary-300' : 'text-neutral-200 hover:bg-white/5 hover:text-neutral-50'}
                `}
              >
                <Typography variant="bodySmall" colorClass="text-inherit" className="capitalize truncate">
                  {room.name}
                </Typography>
                {isActive && <span aria-hidden className="shrink-0 leading-none">✓</span>}
              </button>
            );
          })}
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="
                w-full px-element py-1.5 text-left
                text-neutral-500 hover:text-neutral-200 hover:bg-white/5
                transition-colors duration-100
                focus:outline-none focus-visible:bg-white/10
              "
            >
              <Typography variant="bodySmall" colorClass="text-inherit">
                +{remaining} more
              </Typography>
            </button>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};
