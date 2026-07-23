'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '../UI';
import type { GalleryImage } from '../../types';

export interface GalleryModalProps {
  images: GalleryImage[];
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ images, isOpen, onClose }) => {
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    prevFocusedRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    setIndex(0);

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      prevFocusedRef.current?.focus?.();
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];

  return (
    <div
      className="fixed inset-0 z-[170] flex flex-col bg-black/85 backdrop-blur-md py-4 sm:py-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
      onClick={onClose}
    >
      <header className="flex items-center justify-between gap-3 pb-3" onClick={(e) => e.stopPropagation()}>
        <Typography variant="titleMedium" weight="semiBold" colorClass="text-neutral-50">
          <span id="gallery-title">{current.title ?? 'Room gallery'}</span>
          <span className="ml-2 text-neutral-400 text-sm">
            {index + 1} / {images.length}
          </span>
        </Typography>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close gallery"
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-spatial-glass-elevated border border-spatial-border text-neutral-200 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
        >
          ×
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-spatial-glass border border-spatial-border text-neutral-100 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center"
        >
          ‹
        </button>
        <img
          src={current.url}
          alt={current.alt}
          className="max-w-full max-h-full object-contain rounded-card shadow-modal"
        />
        <button
          type="button"
          aria-label="Next image"
          onClick={() => setIndex((i) => Math.min(i + 1, images.length - 1))}
          disabled={index === images.length - 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-spatial-glass border border-spatial-border text-neutral-100 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center"
        >
          ›
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar pt-3" onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            aria-label={`View ${img.title ?? img.alt}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={`shrink-0 w-20 h-14 rounded-element overflow-hidden border transition-all ${
              i === index ? 'border-primary-400 ring-2 ring-primary-400/50' : 'border-spatial-border opacity-70 hover:opacity-100'
            }`}
          >
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
