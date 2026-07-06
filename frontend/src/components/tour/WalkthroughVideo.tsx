'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface WalkthroughVideoProps {
  /** Video source, e.g. "/assets/bangalore/rooms/bedroom_2_video.mp4". */
  videoUrl: string;
  /** When true, the video crossfades in over the panorama and plays. */
  isActive: boolean;
  /** Called when the walkthrough should end (video ended, Escape, or tap). */
  onExit: () => void;
}

/**
 * A full-bleed video layer that crossfades over the 360 panorama during a
 * walkthrough. It sits above the viewer but below the floating chrome, so the
 * top bar can be seen animating away over it.
 */
export const WalkthroughVideo: React.FC<WalkthroughVideoProps> = ({
  videoUrl,
  isActive,
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Crossfade the video in / out and control playback.
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    if (isActive) {
      video.currentTime = 0;
      // Click is a user gesture, so try with sound; fall back to muted if blocked.
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
      gsap.to(container, { autoAlpha: 1, duration: 0.8, ease: 'power2.inOut' });
    } else {
      gsap.to(container, {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          video.pause();
        },
      });
    }
  }, [isActive]);

  // Escape exits the walkthrough.
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, onExit]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[5] bg-black opacity-0 invisible pointer-events-auto cursor-pointer"
      onClick={onExit}
      aria-hidden={!isActive}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        onEnded={onExit}
      />
    </div>
  );
};
