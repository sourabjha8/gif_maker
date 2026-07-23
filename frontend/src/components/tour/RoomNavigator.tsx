'use client';

import React from 'react';
import { GlassIconButton } from '../GlassIconButton';
import { Typography } from '../UI';

export interface RoomNavigatorProps {
  roomName: string;
  onPrev: () => void;
  onNext: () => void;
  onOpenInfo: () => void;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  isInfoOpen?: boolean;
  /** Shared idle-dim state — lifted to TourScreen so every chrome group
   * dims/restores together instead of independently. */
  dimmed: boolean;
  onRestore: () => void;
  onScheduleDim: () => void;
}

export const RoomNavigator: React.FC<RoomNavigatorProps> = ({
  roomName,
  onPrev,
  onNext,
  onOpenInfo,
  isPrevDisabled = false,
  isNextDisabled = false,
  isInfoOpen = false,
  dimmed,
  onRestore,
  onScheduleDim,
}) => {
  const chevronClass = `transition-opacity duration-500 ${dimmed ? 'opacity-[0.45]' : 'opacity-100'}`;

  return (
    <div
      className="inline-flex items-center gap-tight"
      onMouseEnter={onRestore}
      onMouseLeave={onScheduleDim}
      onTouchStart={onRestore}
      onTouchEnd={onScheduleDim}
    >
      <span className={chevronClass}>
        <GlassIconButton
          label="Previous room"
          tooltip
          tooltipPosition="top"
          shape="rounded"
          onClick={onPrev}
          disabled={isPrevDisabled}
        >
          <img
            src="/assets/icons/chevron_previous.svg"
            alt=""
            aria-hidden="true"
            className="w-4 h-4 opacity-80"
          />
        </GlassIconButton>
      </span>

      {/* Centre pill — never dims */}
      <button
        type="button"
        onClick={onOpenInfo}
        aria-label={`${roomName} — tap for room info`}
        aria-expanded={isInfoOpen}
        className="
          h-12 min-w-[120px] sm:min-w-[160px] px-4 sm:px-6 flex items-center justify-center
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

      <span className={chevronClass}>
        <GlassIconButton
          label="Next room"
          tooltip
          tooltipPosition="top"
          shape="rounded"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          <img
            src="/assets/icons/chevron_next.svg"
            alt=""
            aria-hidden="true"
            className="w-4 h-4 opacity-80"
          />
        </GlassIconButton>
      </span>
    </div>
  );
};
