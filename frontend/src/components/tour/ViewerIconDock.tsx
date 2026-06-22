'use client';

import React from 'react';
import { GlassIconButton } from '../GlassIconButton';
import { CountBadge } from '../CountBadge';

export interface ViewerIconDockProps {
  isMuted: boolean;
  /** Number of items in the estimate — shown as a badge on the Cart button. */
  estimateCount: number;
  onOpenGallery: () => void;
  onOpenRoomsMenu: () => void;
  onOpenEstimate: () => void;
  onToggleMute: () => void;
  /** Visualize handler — wired in a later phase. */
  onVisualize?: () => void;
}

export const ViewerIconDock: React.FC<ViewerIconDockProps> = ({
  isMuted,
  estimateCount,
  onOpenGallery,
  onOpenRoomsMenu,
  onOpenEstimate,
  onToggleMute,
  onVisualize,
}) => (
  <div className="pointer-events-auto absolute right-element md:right-group top-1/2 -translate-y-1/2 flex flex-col items-center gap-tight z-20">
    <GlassIconButton label="Visualize room" tooltip tooltipPosition="left" onClick={onVisualize} />

    <GlassIconButton label="Gallery" tooltip tooltipPosition="left" onClick={onOpenGallery} />

    <GlassIconButton label="Room Menu" tooltip tooltipPosition="left" onClick={onOpenRoomsMenu} />

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
