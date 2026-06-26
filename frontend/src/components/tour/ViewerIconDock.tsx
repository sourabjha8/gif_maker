'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GlassIconButton } from '../GlassIconButton';
import { CountBadge } from '../CountBadge';

const CartIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor">
    <path d="M236.58-118.12q-20.42-20.42-20.42-49.57 0-29.16 20.42-49.58 20.42-20.42 49.57-20.42 29.16 0 49.58 20.42 20.42 20.42 20.42 49.58 0 29.15-20.42 49.57-20.42 20.43-49.58 20.43-29.15 0-49.57-20.43Zm387.69 0q-20.42-20.42-20.42-49.57 0-29.16 20.42-49.58 20.42-20.42 49.58-20.42 29.15 0 49.57 20.42t20.42 49.58q0 29.15-20.42 49.57Q703-97.69 673.85-97.69q-29.16 0-49.58-20.43ZM240.61-730 342-517.69h272.69q3.46 0 6.16-1.73 2.69-1.73 4.61-4.81l107.31-195q2.31-4.23.38-7.5-1.92-3.27-6.54-3.27h-486Zm-28.76-60h555.38q24.54 0 37.11 20.89 12.58 20.88 1.2 42.65L677.38-494.31q-9.84 17.31-26.03 26.96-16.2 9.66-35.5 9.66H324l-46.31 84.61q-3.08 4.62-.19 10 2.88 5.39 8.65 5.39h427.7q12.76 0 21.38 8.61 8.61 8.62 8.61 21.39 0 12.77-8.61 21.38-8.62 8.62-21.38 8.62h-427.7q-40 0-60.11-34.5-20.12-34.5-1.42-68.89l57.07-102.61L136.16-810H90q-12.77 0-21.38-8.62Q60-827.23 60-840t8.62-21.38Q77.23-870 90-870h61.15q10.24 0 19.08 5.42 8.85 5.43 13.46 15.27L211.85-790ZM342-517.69h280-280Z" />
  </svg>
);

const MusicOnIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor">
    <path d="M302.19-184.89q-41.03-41.03-41.03-98.96 0-57.92 41.12-98.96 41.12-41.03 98.87-41.03 23 0 43.08 6.84 20.08 6.85 36.92 20.54V-780q0-15.36 10.44-25.76 10.44-10.39 25.88-10.39h145.25q15.43 0 25.78 10.39 10.34 10.4 10.34 25.76v58.46q0 15.37-10.39 25.76-10.39 10.39-25.76 10.39H541.15v401.54q0 57.75-41.04 98.88-41.03 41.12-98.96 41.12-57.92 0-98.96-41.04Z" />
  </svg>
);

const MusicOffIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor">
    <path d="M761.69-94.77 106.31-750.15q-8.31-8.31-8.5-20.89-.19-12.57 8.5-21.27Q115-801 127.39-801q12.38 0 21.07 8.69l655.38 655.39q8.31 8.3 8.5 20.88.2 12.58-8.5 21.27-8.69 8.69-21.07 8.69-12.39 0-21.08-8.69ZM550-685.39v108.85q0 15.07-9.35 22.23-9.36 7.16-20.58 7.16-11.22 0-20.65-7.5-9.42-7.5-9.42-22.5V-780q0-15.36 10.44-25.76 10.44-10.39 25.87-10.39h145.26q15.43 0 25.78 10.39 10.34 10.4 10.34 25.76v58.46q0 15.37-10.39 25.76-10.4 10.39-25.76 10.39H550ZM410-143.85q-57.75 0-98.87-41.04Q270-225.92 270-283.85q0-57.92 41.13-98.96 41.12-41.03 98.87-41.03 23 0 43.08 6.84 20.07 6.85 36.92 20.54v-54.31l60 60v106.92q0 57.75-41.13 98.88-41.12 41.12-98.87 41.12Z" />
  </svg>
);

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
        >
          <CartIcon size={20} />
        </GlassIconButton>
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
      >
        {isMuted ? <MusicOffIcon size={20} /> : <MusicOnIcon size={20} />}
      </GlassIconButton>
    </div>
  );
};
