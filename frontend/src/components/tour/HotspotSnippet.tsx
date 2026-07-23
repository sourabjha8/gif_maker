'use client';

import React, { useEffect, useRef } from 'react';
import type { Viewer } from '@photo-sphere-viewer/core';
import { Typography } from '../UI';
import type { Hotspot, MediaAsset, PricingResponse } from '../../types';
import { formatINR } from '../../lib/pricing';

const DEG2RAD = Math.PI / 180;
const TAIL = 7; // pointer triangle size (px)
const GAP = 12; // gap between the marker and the card edge
const EDGE = 10; // minimum viewport margin before clamping
// Matches --color-spatial-glass (design_system.md: spatial/bg/glass-base) so
// the tail reads as part of the same glass surface as the card.
const TAIL_COLOR = 'rgba(18, 18, 18, 0.6)';

export interface HotspotSnippetProps {
  /** Live Photo Sphere Viewer instance, used to anchor the card to the marker. */
  viewerRef: React.MutableRefObject<Viewer | null>;
  hotspot: Hotspot | null;
  pricing?: PricingResponse | null;
  pricingLoading?: boolean;
  isInEstimate?: boolean;
  videoMedia?: MediaAsset;
  onClose: () => void;
  onAddToEstimate?: (hotspot: Hotspot, pricing: PricingResponse | null) => void;
  onRemoveFromEstimate?: (hotspot: Hotspot) => void;
  onPlayVideo?: (media: MediaAsset) => void;
}

/**
 * Compact product snippet that pops over the panorama when a hotspot is
 * tapped — a small card (thumbnail · name · meta · price · Add) anchored to
 * the marker with a pointer tail, following it as the user looks around.
 */
export const HotspotSnippet: React.FC<HotspotSnippetProps> = ({
  viewerRef,
  hotspot,
  pricing,
  pricingLoading,
  isInEstimate,
  videoMedia,
  onClose,
  onAddToEstimate,
  onRemoveFromEstimate,
  onPlayVideo,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);

  const open = !!hotspot;

  // Follow the marker: recompute the on-screen anchor every frame while open,
  // mutating the DOM imperatively so the heavy TourScreen tree never
  // re-renders during a drag/zoom.
  useEffect(() => {
    if (!hotspot) return;
    let raf = 0;

    const tick = () => {
      const viewer = viewerRef.current;
      const root = rootRef.current;
      const card = cardRef.current;
      const tail = tailRef.current;
      if (viewer && root && card && tail) {
        const pos = { yaw: hotspot.yaw * DEG2RAD, pitch: hotspot.pitch * DEG2RAD };
        let visible = true;
        try {
          visible = viewer.dataHelper.isPointVisible(pos);
        } catch {
          visible = false;
        }

        if (visible) {
          const { x, y } = viewer.dataHelper.sphericalCoordsToViewerCoords(pos);
          // Clamp within the viewer's own box, not the window — under the
          // forced-landscape rotation the viewer's width is the screen height,
          // so window.innerWidth would clamp the card to the wrong extent.
          const vw = viewer.container.clientWidth || window.innerWidth;
          const w = card.offsetWidth;
          const h = card.offsetHeight;

          // Prefer above the marker; flip below if that would clip the top edge.
          const placeBelow = y - h - GAP - TAIL < EDGE;
          const left = Math.min(Math.max(x - w / 2, EDGE), vw - w - EDGE);
          const top = placeBelow ? y + GAP + TAIL : y - h - GAP - TAIL;

          root.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
          root.style.opacity = '1';
          root.style.pointerEvents = 'auto';

          // Keep the tail pinned under the marker even after horizontal clamping.
          const tailLeft = Math.min(Math.max(x - left, 16), w - 16);
          tail.style.left = `${tailLeft}px`;
          if (placeBelow) {
            tail.style.top = 'auto';
            tail.style.bottom = '100%';
            tail.style.borderColor = `transparent transparent ${TAIL_COLOR} transparent`;
          } else {
            tail.style.bottom = 'auto';
            tail.style.top = '100%';
            tail.style.borderColor = `${TAIL_COLOR} transparent transparent transparent`;
          }
        } else {
          root.style.opacity = '0';
          root.style.pointerEvents = 'none';
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hotspot, viewerRef]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Clicking the empty panorama (anywhere that isn't a marker) dismisses it.
  useEffect(() => {
    if (!open) return;
    const viewer = viewerRef.current;
    if (!viewer) return;
    const onClick = (e: { data?: { marker?: unknown } }) => {
      if (!e?.data?.marker) onClose();
    };
    // PSV's typed event map doesn't line up cleanly with this loose handler.
    const target = viewer as unknown as {
      addEventListener(t: string, l: (e: { data?: { marker?: unknown } }) => void): void;
      removeEventListener(t: string, l: (e: { data?: { marker?: unknown } }) => void): void;
    };
    target.addEventListener('click', onClick);
    return () => target.removeEventListener('click', onClick);
  }, [open, onClose, viewerRef]);

  if (!hotspot) return null;

  const priced = pricing && pricing.status === 'priced';
  const metaLine = hotspot.sku ?? hotspot.moduleCode;

  return (
    <div
      ref={rootRef}
      className="absolute top-0 left-0 z-40 will-change-transform"
      style={{ opacity: 0, transition: 'opacity .16s ease' }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-label={`${hotspot.label} details`}
        className="relative w-[240px] rounded-card bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal p-3 text-left"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-pill text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <img src="/assets/icons/close.svg" alt="" aria-hidden="true" className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Thumbnail — disabled for now, per request.
        <div className="w-full h-24 mb-2.5 rounded-element border border-spatial-border bg-spatial-glass-elevated overflow-hidden flex items-center justify-center">
          {hotspot.image ? (
            <img src={hotspot.image} alt={hotspot.label} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <img
              src="/assets/icons/default_icon.svg"
              alt=""
              aria-hidden="true"
              className="w-6 h-6 opacity-40"
            />
          )}
        </div>
        */}

        <Typography variant="bodyMedium" weight="semiBold" colorClass="text-neutral-50" className="pr-6 truncate">
          {hotspot.label}
        </Typography>
        {metaLine && (
          <Typography
            variant="bodySmall"
            colorClass="text-neutral-400"
            className="mt-0.5 uppercase tracking-wide truncate"
          >
            {metaLine}
          </Typography>
        )}

        <div className="flex items-center justify-between gap-2.5 mt-2.5">
          <Typography variant="titleSmall" weight="bold" colorClass="text-neutral-50" className="whitespace-nowrap">
            {pricingLoading ? '…' : priced ? formatINR(pricing!.totalMinor) : '—'}
          </Typography>

          {hotspot.pricingRef && onAddToEstimate && (
            <button
              type="button"
              disabled={pricingLoading}
              onClick={() =>
                isInEstimate
                  ? onRemoveFromEstimate?.(hotspot)
                  : onAddToEstimate(hotspot, pricing ?? null)
              }
              className={`h-8 px-3.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                isInEstimate
                  ? 'bg-transparent border border-spatial-border-elevated text-neutral-200 hover:bg-white/10'
                  : 'bg-primary-500 text-white hover:bg-primary-400'
              }`}
            >
              {isInEstimate ? 'Remove' : 'Add'}
            </button>
          )}
        </div>

        {hotspot.videoRef && videoMedia && onPlayVideo && (
          <button
            type="button"
            onClick={() => onPlayVideo(videoMedia)}
            className="mt-2.5 w-full h-8 flex items-center justify-center gap-1.5 rounded-pill border border-spatial-border text-neutral-200 text-xs font-semibold hover:bg-white/10 transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <img src="/assets/icons/walkthrough.svg" alt="" aria-hidden="true" className="w-3.5 h-3.5 opacity-80" />
            Play video
          </button>
        )}

        <span
          ref={tailRef}
          aria-hidden="true"
          className="absolute w-0 h-0"
          style={{
            top: '100%',
            borderWidth: `${TAIL}px`,
            borderStyle: 'solid',
            borderColor: `${TAIL_COLOR} transparent transparent transparent`,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  );
};
