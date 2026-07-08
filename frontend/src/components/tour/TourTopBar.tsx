'use client';

import React, { useEffect, useRef } from 'react';
import { Typography } from '../UI';

export interface TourTopBarProps {
  roomName: string;
  projectName: string;
  projectBhkType?: string;
  onBack?: () => void;
  onOpenRooms?: () => void;
  onWalkthrough?: () => void;
  onExitWalkthrough?: () => void;
  isWalkthroughActive?: boolean;
}

export const TourTopBar: React.FC<TourTopBarProps> = ({
  roomName,
  projectName,
  projectBhkType,
  onBack,
  onOpenRooms,
  onWalkthrough,
  onExitWalkthrough,
  isWalkthroughActive = false,
}) => {
  const projectLabel = projectBhkType
    ? `${projectName} · ${projectBhkType}`
    : projectName;

  const leftGroupRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const walkBtnRef = useRef<HTMLButtonElement>(null);
  const walkContentRef = useRef<HTMLDivElement>(null);
  const walkTextRef = useRef<HTMLSpanElement>(null);
  const walkIconRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<{ play(): void; reverse(): void; kill(): void } | null>(null);

  // Build the GSAP timeline lazily (dynamic import keeps gsap out of the server bundle).
  useEffect(() => {
    const leftGroup = leftGroupRef.current;
    const backBtn = backBtnRef.current;
    const walkBtn = walkBtnRef.current;
    const walkContent = walkContentRef.current;
    const walkText = walkTextRef.current;
    const walkIcon = walkIconRef.current;
    if (!leftGroup || !backBtn || !walkBtn || !walkContent || !walkText || !walkIcon) return;

    let killed = false;

    import('gsap').then(({ gsap }) => {
      if (killed) return;

      // Collapse the pill horizontally down to a circle matching the back
      // button's footprint (h-11 / 44px) — GSAP's default auto->0 needs an
      // explicit start width, and the padding must shrink in step with the
      // width or the icon clips against the button's edge instead of
      // staying centred in the resulting circle.
      const fullWidth = walkBtn.getBoundingClientRect().width;
      const collapsedWidth = walkBtn.getBoundingClientRect().height;
      const textWidth = walkText.getBoundingClientRect().width;
      const iconWidth = walkIcon.getBoundingClientRect().width;
      const collapsedPaddingX = Math.max((collapsedWidth - iconWidth) / 2, 0);

      gsap.set(walkBtn, { width: fullWidth });
      gsap.set(walkText, { width: textWidth, overflow: 'hidden', display: 'inline-block' });

      const tl = gsap.timeline({ paused: true });

      tl.to(backBtn, { width: 0, opacity: 0, duration: 0.45, ease: 'power2.inOut' }, 0)
        .to(leftGroup, { gap: 0, duration: 0.45, ease: 'power2.inOut' }, 0)
        .to(walkContent, { gap: 0, duration: 0.45, ease: 'power2.inOut' }, 0)
        .to(walkText, { width: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0)
        .to(
          walkBtn,
          {
            width: collapsedWidth,
            paddingLeft: collapsedPaddingX,
            paddingRight: collapsedPaddingX,
            duration: 0.45,
            ease: 'power2.inOut',
          },
          0,
        );

      tlRef.current = tl;
    });

    return () => {
      killed = true;
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  // Play / reverse when the flag changes.
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (isWalkthroughActive) tl.play();
    else tl.reverse();
  }, [isWalkthroughActive]);

  return (
    <div ref={leftGroupRef} className="flex items-start justify-between w-full gap-element">
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

      <button
        ref={walkBtnRef}
        type="button"
        onClick={() => (isWalkthroughActive ? onExitWalkthrough?.() : onWalkthrough?.())}
        aria-label={isWalkthroughActive ? 'Exit walkthrough' : 'Start walkthrough'}
        className="
          pointer-events-auto flex items-center justify-center h-11 px-element overflow-hidden shrink-0
          rounded-pill
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
          text-neutral-50 hover:text-white hover:bg-white/10
          transition-colors duration-200 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        "
      >
        <div ref={walkContentRef} className="flex items-center gap-tight">
          <span ref={walkIconRef} className="relative w-4 h-4 shrink-0">
            <img
              src="/assets/icons/walkthrough.svg"
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-4 h-4 transition-opacity duration-200 ${
                isWalkthroughActive ? 'opacity-0' : 'opacity-80'
              }`}
            />
            <img
              src="/assets/icons/close.svg"
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-4 h-4 transition-opacity duration-200 ${
                isWalkthroughActive ? 'opacity-90' : 'opacity-0'
              }`}
            />
          </span>
          <span ref={walkTextRef} className="whitespace-nowrap">
            <Typography variant="bodySmall" weight="semiBold" colorClass="text-inherit">
              Room Tour
            </Typography>
          </span>
        </div>
      </button>
    </div>
  );
};
