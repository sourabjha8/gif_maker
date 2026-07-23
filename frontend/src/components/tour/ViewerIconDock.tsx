'use client';

import React from 'react';
import { GlassIconButton } from '../GlassIconButton';

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
  onOpenGallery: () => void;
  onOpenRoomsMenu: () => void;
  onToggleMute: () => void;
  onVisualize?: () => void;
  isWalkthrough?: boolean;
  /** Shared idle-dim state — lifted to TourScreen so every chrome group
   * dims/restores together instead of independently. */
  dimmed: boolean;
  onRestore: () => void;
  onScheduleDim: () => void;
}

export const ViewerIconDock: React.FC<ViewerIconDockProps> = ({
  isMuted,
  onOpenGallery,
  onOpenRoomsMenu,
  onToggleMute,
  onVisualize,
  isWalkthrough = false,
  dimmed,
  onRestore,
  onScheduleDim,
}) => {
  return (
    <div
      className={`pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right))] md:right-[max(1.5rem,env(safe-area-inset-right))] top-1/2 -translate-y-1/2 flex flex-col items-center gap-tight z-20 transition-all duration-500 ease-in-out ${
        isWalkthrough
          ? 'opacity-0 translate-x-10 pointer-events-none'
          : dimmed
            ? 'opacity-[0.45]'
            : 'opacity-100'
      }`}
      onMouseEnter={onRestore}
      onMouseLeave={onScheduleDim}
      onTouchStart={onRestore}
      onTouchEnd={onScheduleDim}
    >
      <GlassIconButton label="Visualize room" tooltip tooltipPosition="left" onClick={onVisualize} />

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
