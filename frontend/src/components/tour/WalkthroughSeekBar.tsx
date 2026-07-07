'use client';

import React, { useCallback, useEffect, useState } from 'react';

export interface WalkthroughSeekBarProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentTime: number;
  duration: number;
}

const SPEED_CYCLE = [1, 1.5, 2] as const;

export const WalkthroughSeekBar: React.FC<WalkthroughSeekBarProps> = ({
  videoRef,
  currentTime,
  duration,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Mirror the video element's real play/pause/rate state, since it can
  // change from sources other than this bar (autoplay, onEnded, etc.).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleRateChange = () => setPlaybackRate(video.playbackRate);

    setIsPlaying(!video.paused);
    setPlaybackRate(video.playbackRate);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ratechange', handleRateChange);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ratechange', handleRateChange);
    };
  }, [videoRef]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video || !duration) return;
      video.currentTime = (Number(e.target.value) / 100) * duration;
    },
    [videoRef, duration],
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [videoRef]);

  const cycleSpeed = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const currentIndex = SPEED_CYCLE.indexOf(video.playbackRate as (typeof SPEED_CYCLE)[number]);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SPEED_CYCLE.length;
    video.playbackRate = SPEED_CYCLE[nextIndex];
  }, [videoRef]);

  return (
    <div
      className="
        h-12 w-[min(92vw,460px)] px-tight flex items-center gap-tight
        rounded-card bg-spatial-glass backdrop-blur-3xl
        border border-spatial-border shadow-card
      "
    >
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
        className="
          w-9 h-9 shrink-0 flex items-center justify-center rounded-pill
          text-neutral-50 hover:bg-white/10 transition-colors duration-200 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        "
      >
        {isPlaying ? (
          <img src="/assets/icons/default_icon.svg" alt="" aria-hidden="true" className="w-4 h-4 opacity-80" />
        ) : (
          <img src="/assets/icons/walkthrough.svg" alt="" aria-hidden="true" className="w-4 h-4 opacity-80" />
        )}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        onChange={handleSeek}
        aria-label="Walkthrough video progress"
        className="w-full h-1.5 rounded-pill appearance-none cursor-pointer bg-white/20 accent-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        style={{
          background: `linear-gradient(to right, rgba(255,255,255,0.85) ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
        }}
      />

      <button
        type="button"
        onClick={cycleSpeed}
        aria-label={`Change playback speed, currently ${playbackRate}x`}
        className="
          h-7 px-2 shrink-0 rounded-pill text-xs font-semibold
          text-neutral-300 hover:bg-white/10 hover:text-white
          transition-colors duration-200 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        "
      >
        {playbackRate}x
      </button>
    </div>
  );
};
