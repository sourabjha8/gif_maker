'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
}

function useAutoDim(delayMs = 2000, initialDelayMs = 4000) {
  const [dimmed, setDimmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimer = useCallback((ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDimmed(true), ms);
  }, []);

  const restore = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setDimmed(false);
  }, []);

  const scheduledim = useCallback(() => {
    startTimer(delayMs);
  }, [startTimer, delayMs]);

  useEffect(() => {
    startTimer(initialDelayMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [startTimer, initialDelayMs]);

  return { dimmed, restore, scheduledim };
}

export const RoomNavigator: React.FC<RoomNavigatorProps> = ({
  roomName,
  onPrev,
  onNext,
  onOpenInfo,
  isPrevDisabled = false,
  isNextDisabled = false,
  isInfoOpen = false,
}) => {
  const { dimmed, restore, scheduledim } = useAutoDim();
  const chevronClass = `transition-opacity duration-500 ${dimmed ? 'opacity-[0.45]' : 'opacity-100'}`;

  return (
    <div
      className="inline-flex items-center gap-tight"
      onMouseEnter={restore}
      onMouseLeave={scheduledim}
      onTouchStart={restore}
      onTouchEnd={scheduledim}
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
            src="/assets/icons/default_icon.svg"
            alt=""
            aria-hidden="true"
            className="w-4 h-4 opacity-80 rotate-90"
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
            src="/assets/icons/default_icon.svg"
            alt=""
            aria-hidden="true"
            className="w-4 h-4 opacity-80 -rotate-90"
          />
        </GlassIconButton>
      </span>
    </div>
  );
};
