'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
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
  /** Called when the Walkthrough button is tapped. */
  onWalkthrough?: () => void;
  /**
   * When true, plays the walkthrough transition: the back icon fades away and
   * the project pill slides left, while the walkthrough button collapses
   * vertically as its label fades out. Reverses when set back to false.
   */
  isWalkthroughActive?: boolean;
}

export const TourTopBar: React.FC<TourTopBarProps> = ({
  roomName,
  projectName,
  projectBhkType,
  onBack,
  onOpenRooms,
  onWalkthrough,
  isWalkthroughActive = false,
}) => {
  const projectLabel = projectBhkType
    ? `${projectName} · ${projectBhkType}`
    : projectName;

  const leftGroupRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const walkBtnRef = useRef<HTMLButtonElement>(null);
  const walkContentRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Build the (paused) walkthrough timeline once the elements exist.
  useEffect(() => {
    const leftGroup = leftGroupRef.current;
    const backBtn = backBtnRef.current;
    const walkBtn = walkBtnRef.current;
    const walkContent = walkContentRef.current;
    if (!leftGroup || !backBtn || !walkBtn || !walkContent) return;

    const tl = gsap.timeline({ paused: true });
    // Back icon fades + collapses, so the society pill slides left into its place.
    tl.to(backBtn, { width: 0, opacity: 0, duration: 0.45, ease: 'power2.inOut' }, 0)
      .to(leftGroup, { gap: 0, duration: 0.45, ease: 'power2.inOut' }, 0)
      // Walkthrough label fades, then the pill collapses vertically.
      .to(walkContent, { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0)
      .to(
        walkBtn,
        { height: 0, opacity: 0, borderWidth: 0, duration: 0.4, ease: 'power2.inOut' },
        0.12,
      );

    tlRef.current = tl;
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, []);

  // Play / reverse the transition when the active flag changes.
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (isWalkthroughActive) tl.play();
    else tl.reverse();
  }, [isWalkthroughActive]);

  return (
    <div ref={leftGroupRef} className="flex items-start justify-between w-full gap-element">
      {/* Left — back button + project pill */}
      <div className="pointer-events-auto flex items-center gap-tight">
        <button
          ref={backBtnRef}
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="
            w-11 h-11 flex items-center justify-center overflow-hidden shrink-0
            rounded-pill
            bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
            text-neutral-100 hover:text-white hover:bg-white/10
            transition-colors duration-200 active:scale-95
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
        ref={walkBtnRef}
        type="button"
        onClick={onWalkthrough}
        aria-label="Start walkthrough"
        className="
          pointer-events-auto flex items-center h-11 px-element overflow-hidden shrink-0
          rounded-pill
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
          text-neutral-50 hover:text-white hover:bg-white/10
          transition-colors duration-200 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        "
      >
        <div ref={walkContentRef} className="flex items-center gap-tight">
          <img
            src="/assets/icons/default_icon.svg"
            alt=""
            aria-hidden="true"
            className="w-4 h-4 opacity-80"
          />
          <Typography variant="bodySmall" weight="semiBold" colorClass="text-inherit">
            Walkthrough
          </Typography>
        </div>
      </button>
    </div>
  );
};
