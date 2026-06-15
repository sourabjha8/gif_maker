'use client';

import React from 'react';
import { GlassIconButton } from '../GlassIconButton';
import { Typography } from '../UI';

export interface RoomNavigatorProps {
  /** Current room name shown on the centre button. */
  roomName: string;
  onPrev: () => void;
  onNext: () => void;
  /** Opens the room-info panel (centre button tap). */
  onOpenInfo: () => void;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  isInfoOpen?: boolean;
}

/**
 * Bottom room navigator: previous · room name · next.
 *
 * The chevron buttons are shared {@link GlassIconButton}s with tooltips; the
 * centre button is a tour-specific glass label that opens the room-info panel.
 */
export const RoomNavigator: React.FC<RoomNavigatorProps> = ({
  roomName,
  onPrev,
  onNext,
  onOpenInfo,
  isPrevDisabled = false,
  isNextDisabled = false,
  isInfoOpen = false,
}) => (
  <div className="inline-flex items-center gap-tight">
    <GlassIconButton
      label="Previous room"
      tooltip
      tooltipPosition="top"
      shape="rounded"
      onClick={onPrev}
      disabled={isPrevDisabled}
    >
      <img
        src="/assets/icons/default_icon.svg"
        alt=""
        aria-hidden="true"
        className="w-4 h-4 opacity-80 rotate-90"
      />
    </GlassIconButton>

    {/* Current room name — tapping opens the room-info panel. */}
    <button
      type="button"
      onClick={onOpenInfo}
      aria-label={`${roomName} — tap for room info`}
      aria-expanded={isInfoOpen}
      className="
        h-12 min-w-[160px] px-6 flex items-center justify-center
        rounded-card
        bg-spatial-glass backdrop-blur-3xl
        border border-spatial-border shadow-card
        transition-all duration-200
        hover:bg-white/10 hover:border-spatial-border-elevated
        active:scale-95
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
      "
    >
      <Typography
        variant="titleSmall"
        weight="semiBold"
        colorClass="text-neutral-50"
        className="leading-none whitespace-nowrap"
      >
        {roomName}
      </Typography>
    </button>

    <GlassIconButton
      label="Next room"
      tooltip
      tooltipPosition="top"
      shape="rounded"
      onClick={onNext}
      disabled={isNextDisabled}
    >
      <img
        src="/assets/icons/default_icon.svg"
        alt=""
        aria-hidden="true"
        className="w-4 h-4 opacity-80 -rotate-90"
      />
    </GlassIconButton>
  </div>
);
