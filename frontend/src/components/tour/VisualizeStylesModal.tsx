'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Typography } from '../UI';
import type { RoomVariant } from '../../types';

export interface VisualizeStylesModalProps {
  roomName: string;
  variants: RoomVariant[];
  activeVariantSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

function thumbnailFor(variant: RoomVariant): string | undefined {
  return variant.gallery?.[0]?.url ?? variant.panorama.lowUrl ?? variant.panorama.url;
}

/**
 * Browse-only style lookbook — level 1 shows every real variant of the
 * current room as a style card, level 2 shows that variant's own gallery,
 * and any gallery shot can be zoomed. It never switches the live panorama;
 * that's a separate decision the product hasn't asked for yet.
 */
export const VisualizeStylesModal: React.FC<VisualizeStylesModalProps> = ({
  roomName,
  variants,
  activeVariantSlug,
  isOpen,
  onClose,
}) => {
  const [level, setLevel] = useState<1 | 2>(1);
  const [viewingSlug, setViewingSlug] = useState<string | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLevel(1);
      setViewingSlug(null);
      setZoomedIndex(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (zoomedIndex !== null) setZoomedIndex(null);
      else if (level === 2) setLevel(1);
      else onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, level, zoomedIndex, onClose]);

  const viewingVariant = useMemo(
    () => variants.find((v) => v.slug === viewingSlug) ?? null,
    [variants, viewingSlug],
  );
  const gallery = viewingVariant?.gallery ?? [];
  const zoomedImage = zoomedIndex !== null ? gallery[zoomedIndex] : null;

  const visibleVariants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return variants;
    return variants.filter((v) => v.name.toLowerCase().includes(query));
  }, [variants, searchQuery]);

  const openVariant = (variant: RoomVariant) => {
    setViewingSlug(variant.slug);
    setLevel(2);
  };

  return (
    <div
      className={`
        fixed inset-0 z-[170] flex items-center justify-center p-3 sm:p-6
        bg-black/60 transition-opacity duration-300
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Visualize styles"
        aria-hidden={!isOpen}
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full max-w-[960px] h-[min(640px,calc(min(100dvh,100vw)_-_48px))] flex flex-col overflow-hidden
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal rounded-card
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}
        `}
      >
        <div className="relative flex-1 min-h-0">
          {/* ── LEVEL 1: style picker ─────────────────────────────── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${level === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}
            `}
          >
            <header className="shrink-0 flex items-center justify-between gap-element px-group py-element border-b border-spatial-border">
              <Typography variant="h3" weight="bold" colorClass="text-neutral-50">
                {roomName} in different styles
              </Typography>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="
                  w-11 h-11 flex items-center justify-center shrink-0
                  rounded-element border border-spatial-border
                  bg-spatial-glass-elevated text-neutral-300
                  hover:text-white hover:bg-white/10
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                "
              >
                <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
              </button>
            </header>

            <div className="shrink-0 px-group pt-element">
              <div className="relative">
                <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="absolute left-element top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search styles…"
                  className="
                    w-full h-11 pl-11 pr-element rounded-pill
                    bg-spatial-glass-elevated border border-spatial-border
                    text-neutral-100 placeholder:text-neutral-500
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                  "
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-group">
              {visibleVariants.length === 0 ? (
                <Typography variant="bodyMedium" colorClass="text-neutral-400">
                  No styles match “{searchQuery}”.
                </Typography>
              ) : (
                <div className="grid grid-cols-3 gap-element">
                  {visibleVariants.map((variant) => {
                    const isApplied = variant.slug === activeVariantSlug;
                    const thumbnail = thumbnailFor(variant);
                    return (
                      <div
                        key={variant.id}
                        className={`
                          relative aspect-[4/3] rounded-card border overflow-hidden
                          bg-spatial-glass-elevated
                          transition-all duration-200
                          ${isApplied
                            ? 'border-primary-400'
                            : 'border-spatial-border hover:border-spatial-border-elevated'
                          }
                        `}
                      >
                        {/* Primary action — tapping anywhere on the tile opens this style. */}
                        <button
                          type="button"
                          onClick={() => openVariant(variant)}
                          className="absolute inset-0 text-left rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          {thumbnail
                            ? <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                            : <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="absolute inset-0 m-auto w-8 h-8 opacity-30" />
                          }
                          <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" aria-hidden />
                          <Typography
                            variant="titleSmall"
                            weight="semiBold"
                            colorClass="text-white"
                            className="absolute bottom-tight left-tight right-14 truncate"
                          >
                            {variant.name}
                          </Typography>
                        </button>

                        {/* Secondary, quiet trigger — a separate action (upload a room photo to
                            generate this style), never the tile's primary tap target. Visible at
                            low opacity by default (not hover-only) so it still works on touch. */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Upload/generation flow not implemented yet — trigger only.
                          }}
                          aria-label={`Try ${variant.name} in your room`}
                          className="
                            absolute bottom-tight right-tight z-10 max-w-[calc(100%-16px)]
                            flex items-center gap-1 h-7 px-1.5 sm:pr-2.5 rounded-pill
                            bg-white/10 backdrop-blur-sm border border-white/15
                            text-neutral-300
                            opacity-70 hover:opacity-100 hover:bg-white/15 hover:text-neutral-100
                            focus-visible:opacity-100
                            transition-all duration-200
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                          "
                        >
                          <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-80 shrink-0" />
                          <Typography
                            variant="bodySmall"
                            weight="medium"
                            colorClass="text-inherit"
                            className="hidden sm:block truncate"
                          >
                            Try in your room
                          </Typography>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── LEVEL 2: style gallery ──────────────────────────── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${level === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}
            `}
          >
            <header className="shrink-0 flex items-center gap-element px-group py-element border-b border-spatial-border">
              <button
                type="button"
                onClick={() => setLevel(1)}
                className="
                  flex items-center gap-tight shrink-0
                  text-neutral-300 hover:text-white transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element
                "
              >
                <img src="/assets/icons/chevron_previous.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
                <Typography variant="bodySmall" colorClass="text-inherit">
                  Styles
                </Typography>
              </button>
              <Typography variant="h3" weight="bold" colorClass="text-neutral-50" className="flex-1 min-w-0 truncate">
                {roomName} <span className="text-neutral-500">·</span> {viewingVariant?.name ?? ''}
              </Typography>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="
                  w-11 h-11 flex items-center justify-center shrink-0
                  rounded-element border border-spatial-border
                  bg-spatial-glass-elevated text-neutral-300
                  hover:text-white hover:bg-white/10
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                "
              >
                <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-group">
              {gallery.length === 0 ? (
                <Typography variant="bodyMedium" colorClass="text-neutral-400">
                  No gallery images yet for this style.
                </Typography>
              ) : (
                <div className="grid grid-cols-2 gap-element">
                  {gallery.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setZoomedIndex(index)}
                      className="
                        relative aspect-[16/10] rounded-card border overflow-hidden
                        bg-spatial-glass-elevated border-spatial-border
                        hover:border-spatial-border-elevated
                        transition-all duration-200
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                      "
                    >
                      <img src={image.url} alt={image.alt} className="w-full h-full object-cover" draggable={false} />
                      <span className="absolute bottom-2 right-2 w-8 h-8 rounded-element bg-black/50 border border-white/20 flex items-center justify-center">
                        <img src="/assets/icons/aspect_ratio_24dp_E8EAED_FILL0_wght300_GRAD0_opsz24.svg" alt="" aria-hidden className="w-4 h-4 opacity-80" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Enlarged image, over the gallery ────────────────── */}
          <div
            className={`
              absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-group
              transition-opacity duration-200
              ${zoomedImage ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
          >
            <button
              type="button"
              onClick={() => setZoomedIndex(null)}
              aria-label="Close image"
              className="
                absolute top-4 right-4 w-11 h-11 flex items-center justify-center shrink-0
                rounded-element border border-spatial-border
                bg-spatial-glass-elevated text-neutral-300
                hover:text-white hover:bg-white/10
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              "
            >
              <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
            </button>
            {zoomedImage && (
              <img
                src={zoomedImage.url}
                alt={zoomedImage.alt}
                className="max-w-full max-h-full object-contain rounded-card"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
