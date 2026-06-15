'use client';

import React, { useEffect, useRef } from 'react';
import { Typography } from '../UI';
import type { MediaAsset } from '../../types';

export interface VideoModalProps {
  media: MediaAsset | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ media, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!media) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      const video = videoRef.current;
      if (video) {
        try { video.pause(); } catch { /* noop */ }
      }
      previouslyFocusedRef.current?.focus?.();
    };
  }, [media, onClose]);

  if (!media) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-spatial-glass-elevated border border-spatial-border rounded-card shadow-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-spatial-border">
          <Typography variant="titleMedium" weight="semiBold" colorClass="text-neutral-50">
            <span id="video-title">{media.title}</span>
          </Typography>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="w-11 h-11 rounded-full bg-spatial-glass border border-spatial-border text-neutral-200 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
          >
            ×
          </button>
        </header>
        <div className="bg-black aspect-video">
          <video
            ref={videoRef}
            src={media.url}
            poster={media.poster}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full"
          >
            {media.mimeType && <source src={media.url} type={media.mimeType} />}
          </video>
        </div>
        {media.description && (
          <div className="p-4">
            <Typography variant="bodySmall" colorClass="text-neutral-300">
              {media.description}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
