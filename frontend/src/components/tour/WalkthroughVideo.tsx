'use client';

import React, { useEffect, useRef } from 'react';

export interface WalkthroughVideoProps {
  videoUrl: string;
  isActive: boolean;
  onExit: () => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onProgress?: (progress: { currentTime: number; duration: number }) => void;
}

export const WalkthroughVideo: React.FC<WalkthroughVideoProps> = ({
  videoUrl,
  isActive,
  onExit,
  videoRef: externalVideoRef,
  onProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;

  // Crossfade in/out using dynamically imported GSAP (keeps it out of the server bundle).
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    if (isActive) {
      video.currentTime = 0;
      video.playbackRate = 1;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
      import('gsap').then(({ gsap }) => {
        gsap.to(container, { autoAlpha: 1, duration: 0.8, ease: 'power2.inOut' });
      });
    } else {
      import('gsap').then(({ gsap }) => {
        gsap.to(container, {
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => { video.pause(); },
        });
      });
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, onExit]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[5] bg-black opacity-0 invisible pointer-events-auto"
      aria-hidden={!isActive}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        onEnded={onExit}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          onProgress?.({ currentTime: v.currentTime, duration: v.duration || 0 });
        }}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          onProgress?.({ currentTime: v.currentTime, duration: v.duration || 0 });
        }}
      />
    </div>
  );
};
