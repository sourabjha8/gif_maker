'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GlassIconButton } from '../GlassIconButton';
import { CountBadge } from '../CountBadge';

export interface ViewerIconDockProps {
  isMuted: boolean;
  estimateCount: number;
  onOpenGallery: () => void;
  onOpenRoomsMenu: () => void;
  onOpenEstimate: () => void;
  onToggleMute: () => void;
  onVisualize?: () => void;
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

export const ViewerIconDock: React.FC<ViewerIconDockProps> = ({
  isMuted,
  estimateCount,
  onOpenGallery,
  onOpenRoomsMenu,
  onOpenEstimate,
  onToggleMute,
  onVisualize,
}) => {
  const { dimmed, restore, scheduledim } = useAutoDim();

  return (
    <div
      className={`pointer-events-auto absolute right-element md:right-group top-1/2 -translate-y-1/2 flex flex-col items-center gap-tight z-20 transition-opacity duration-500 ${dimmed ? 'opacity-[0.45]' : 'opacity-100'}`}
      onMouseEnter={restore}
      onMouseLeave={scheduledim}
      onTouchStart={restore}
      onTouchEnd={scheduledim}
    >
      <GlassIconButton label="Visualize room" tooltip tooltipPosition="left" onClick={onVisualize} />

      <span className="relative">
        <GlassIconButton
          label={`Cart${estimateCount > 0 ? ` (${estimateCount})` : ''}`}
          tooltip
          tooltipPosition="left"
          onClick={onOpenEstimate}
        />
        {estimateCount > 0 && (
          <span className="absolute -top-1 -right-1 pointer-events-none">
            <CountBadge count={estimateCount} />
          </span>
        )}
      </span>

      <GlassIconButton
        label={isMuted ? 'Unmute' : 'Mute'}
        tooltip
        tooltipPosition="left"
        active={!isMuted}
        onClick={onToggleMute}
      />
    </div>
  );
};
