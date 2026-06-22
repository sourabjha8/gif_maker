'use client';

import React from 'react';
import { Typography } from '../UI';

export interface TourTopBarProps {
  /** Current room name shown in the centre pill. */
  roomName: string;
  /** Project name (e.g. "Sunrise"). */
  projectName: string;
  /** BHK type label (e.g. "3BHK"). */
  projectBhkType?: string;
  /** Called when the back / project pill is tapped. */
  onBack?: () => void;
  /** Opens the floating room-list sidebar. */
  onOpenRooms?: () => void;
  /** Called when the Walkthrough button is tapped — wired up in a later phase. */
  onWalkthrough?: () => void;
}

export const TourTopBar: React.FC<TourTopBarProps> = ({
  roomName,
  projectName,
  projectBhkType,
  onBack,
  onOpenRooms,
  onWalkthrough,
}) => {
  const projectLabel = projectBhkType
    ? `${projectName} · ${projectBhkType}`
    : projectName;

  return (
    <div className="flex items-start justify-between w-full gap-element">
      {/* Left — back button + project pill */}
      <div className="pointer-events-auto flex items-center gap-tight">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="
            w-11 h-11 flex items-center justify-center
            rounded-pill
            bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
            text-neutral-100 hover:text-white hover:bg-white/10
            transition-all duration-200 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          "
        >
          <img
            src="/assets/icons/default_icon.svg"
            alt=""
            aria-hidden="true"
            className="w-3.5 h-3.5 opacity-80 rotate-180"
          />
        </button>

        <button
          type="button"
          onClick={onOpenRooms}
          aria-label={`Open room list for ${projectLabel}`}
          className="
            flex items-center h-11 px-element rounded-pill
            bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
            hover:bg-white/10 transition-all duration-200 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          "
        >
          <Typography variant="bodySmall" weight="semiBold" colorClass="text-neutral-100" className="whitespace-nowrap">
            {projectLabel}
          </Typography>
        </button>
      </div>

      {/* Right — Walkthrough button */}
      <button
        type="button"
        onClick={onWalkthrough}
        aria-label="Start walkthrough"
        className="
          pointer-events-auto flex items-center gap-tight h-11 px-element
          rounded-pill
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
          text-neutral-50 hover:text-white hover:bg-white/10
          transition-all duration-200 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        "
      >
        <img
          src="/assets/icons/default_icon.svg"
          alt=""
          aria-hidden="true"
          className="w-4 h-4 opacity-80"
        />
        <Typography variant="bodySmall" weight="semiBold" colorClass="text-inherit">
          Walkthrough
        </Typography>
      </button>
    </div>
  );
};
