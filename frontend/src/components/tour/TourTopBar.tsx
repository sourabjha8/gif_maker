'use client';

import React, { useEffect, useRef } from 'react';
import { Typography } from '../UI';
import { GlassIconButton } from '../GlassIconButton';
import { CountBadge } from '../CountBadge';

const CartIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor">
    <path d="M236.58-118.12q-20.42-20.42-20.42-49.57 0-29.16 20.42-49.58 20.42-20.42 49.57-20.42 29.16 0 49.58 20.42 20.42 20.42 20.42 49.58 0 29.15-20.42 49.57-20.42 20.43-49.58 20.43-29.15 0-49.57-20.43Zm387.69 0q-20.42-20.42-20.42-49.57 0-29.16 20.42-49.58 20.42-20.42 49.58-20.42 29.15 0 49.57 20.42t20.42 49.58q0 29.15-20.42 49.57Q703-97.69 673.85-97.69q-29.16 0-49.58-20.43ZM240.61-730 342-517.69h272.69q3.46 0 6.16-1.73 2.69-1.73 4.61-4.81l107.31-195q2.31-4.23.38-7.5-1.92-3.27-6.54-3.27h-486Zm-28.76-60h555.38q24.54 0 37.11 20.89 12.58 20.88 1.2 42.65L677.38-494.31q-9.84 17.31-26.03 26.96-16.2 9.66-35.5 9.66H324l-46.31 84.61q-3.08 4.62-.19 10 2.88 5.39 8.65 5.39h427.7q12.76 0 21.38 8.61 8.61 8.62 8.61 21.39 0 12.77-8.61 21.38-8.62 8.62-21.38 8.62h-427.7q-40 0-60.11-34.5-20.12-34.5-1.42-68.89l57.07-102.61L136.16-810H90q-12.77 0-21.38-8.62Q60-827.23 60-840t8.62-21.38Q77.23-870 90-870h61.15q10.24 0 19.08 5.42 8.85 5.43 13.46 15.27L211.85-790ZM342-517.69h280-280Z" />
  </svg>
);

export interface TourTopBarProps {
  roomName: string;
  projectName: string;
  projectBhkType?: string;
  onBack?: () => void;
  onOpenRooms?: () => void;
  onWalkthrough?: () => void;
  onExitWalkthrough?: () => void;
  isWalkthroughActive?: boolean;
  isRoomListOpen?: boolean;
  estimateCount?: number;
  onOpenEstimate?: () => void;
  /** Shared idle-dim state — lifted to TourScreen so every chrome group
   * dims/restores together instead of independently. */
  dimmed: boolean;
  onRestore: () => void;
  onScheduleDim: () => void;
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
  isRoomListOpen = false,
  estimateCount = 0,
  onOpenEstimate,
  dimmed,
  onRestore,
  onScheduleDim,
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
      <div
        className={`
          flex items-center gap-tight
          transition-all duration-300 ease-out
          ${isRoomListOpen
            ? '-translate-x-6 opacity-0 pointer-events-none'
            : 'translate-x-0 opacity-100 pointer-events-auto'
          }
        `}
      >
        <button
          ref={backBtnRef}
          type="button"
          onClick={onBack}
          onMouseEnter={onRestore}
          onMouseLeave={onScheduleDim}
          onTouchStart={onRestore}
          onTouchEnd={onScheduleDim}
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
          onMouseEnter={onRestore}
          onMouseLeave={onScheduleDim}
          onTouchStart={onRestore}
          onTouchEnd={onScheduleDim}
          aria-label={`Open room list for ${projectLabel}`}
          className={`
            flex items-center h-11 px-element rounded-pill
            bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
            hover:bg-white/10 transition-all duration-200 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            ${dimmed ? 'opacity-[0.45]' : 'opacity-100'}
          `}
        >
          <Typography variant="bodySmall" weight="semiBold" colorClass="text-neutral-100" className="whitespace-nowrap">
            {projectLabel}
          </Typography>
        </button>
      </div>

      <div
        className={`flex items-center gap-tight shrink-0 transition-opacity duration-500 ${
          dimmed ? 'opacity-[0.45]' : 'opacity-100'
        }`}
        onMouseEnter={onRestore}
        onMouseLeave={onScheduleDim}
        onTouchStart={onRestore}
        onTouchEnd={onScheduleDim}
      >
        <button
          ref={walkBtnRef}
          type="button"
          onClick={() => (isWalkthroughActive ? onExitWalkthrough?.() : onWalkthrough?.())}
          aria-label={isWalkthroughActive ? 'Exit walkthrough' : 'Start walkthrough'}
          className="
            pointer-events-auto flex items-center justify-center overflow-hidden shrink-0
            w-12 h-12 p-0 md:w-auto md:h-11 md:px-element
            rounded-pill
            bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
            text-neutral-50 hover:text-white hover:bg-white/10
            transition-colors duration-200 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          "
        >
          <div ref={walkContentRef} className="flex items-center gap-0 md:gap-tight">
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
            <span
              ref={walkTextRef}
              className="whitespace-nowrap overflow-hidden max-w-0 opacity-0 md:max-w-none md:opacity-100"
            >
              <Typography variant="bodySmall" weight="semiBold" colorClass="text-inherit">
                Room Tour
              </Typography>
            </span>
          </div>
        </button>

        {onOpenEstimate && (
          <span className="relative pointer-events-auto">
            <GlassIconButton
              label={`Cart${estimateCount > 0 ? ` (${estimateCount})` : ''}`}
              tooltip
              tooltipPosition="bottom"
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
        )}
      </div>
    </div>
  );
};
