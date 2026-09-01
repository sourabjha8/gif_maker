'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Typography } from '../UI';
import { Button } from '../Button';
import { GlassIconButton } from '../GlassIconButton';
import { VisualizeUploadWizard } from './VisualizeUploadWizard';
import type { RoomVariant } from '../../types';

/**
 * `'styles'` — the browse-only lookbook (grid of every real variant, each
 * openable into its own gallery). `'upload'` — pick a style and upload a
 * room photo to have it generated in that style. One continuous panel
 * grows/shrinks and cross-fades content between the two, the same technique
 * `RoomBrowserPanel` uses for its drawer → catalog transition, so switching
 * between them reads as one overlay resizing rather than a different modal
 * opening on top.
 */
export type VisualizeOverlayMode = 'closed' | 'styles' | 'upload';

export interface VisualizeOverlayProps {
  roomName: string;
  variants: RoomVariant[];
  /** The variant slug currently live in the 360 viewer — rings that tile in the styles grid. */
  activeVariantSlug: string;
  mode: VisualizeOverlayMode;
  /** Fully dismisses the overlay (both layers), from either layer's own close (X). */
  onClose: () => void;
  /** A style tile's "Try in your room" trigger — the caller should switch `mode` to `'upload'` and remember this variant as the preselection. */
  onEnterUpload: (variant: RoomVariant) => void;
  /** The upload layer's back arrow — the caller should switch `mode` back to `'styles'`. */
  onBackToStyles: () => void;
  /** Pre-selected slug for the upload layer, e.g. from a style tile's own trigger. Falls back to the first variant. */
  initialUploadVariantSlug?: string | null;
  /** Fired by "Design {roomName}" once both a style and a photo are set. Not wired to a follow-on screen yet. */
  onSubmit?: (variant: RoomVariant, file: File) => void;
}

function thumbnailFor(variant: RoomVariant): string | undefined {
  return variant.gallery?.[0]?.url ?? variant.panorama.lowUrl ?? variant.panorama.url;
}

/** How long the simulated "generating" state plays before handing off to `onSubmit` — long enough for the scan-sweep animation to read as more than a flash. */
const GENERATE_DURATION_MS = 2400;

/**
 * The default/current variant is often just named after the room itself
 * (e.g. "Bedroom 2") since it's not really "a style" — it's what's already
 * there. Displaying that literally reads as a category error next to real
 * style names, so it gets a proper label here instead.
 */
function styleLabelFor(variant: RoomVariant): string {
  return variant.isDefault ? 'Current style' : variant.name;
}

interface UploadedPhoto {
  file: File;
  previewUrl: string;
  sizeMb: string;
}

/**
 * A real (not fabricated) suitability check computed from the photo's own
 * aspect ratio — the two shapes a corner shot can't plausibly be. There's no
 * vision model behind this yet, so it only flags what pixel geometry alone
 * can support; it never claims to detect content (e.g. "multiple rooms").
 */
function checkPhotoSuitability(img: HTMLImageElement): string | null {
  const ratio = img.naturalWidth / img.naturalHeight;
  if (ratio > 2.0) return "This photo's a bit too wide-angle for a clean result. Try a straighter shot.";
  if (ratio < 0.6) return 'This crop looks narrow — try to fit both side walls and the floor in frame.';
  return null;
}

/**
 * The upload dropzone — a single trigger (the native file picker already
 * offers "take a photo" vs "choose from library"; the app doesn't fork on
 * that itself), a permanent one-line caption, and — once a photo is set — a
 * compact result row plus a non-blocking suitability warning if the photo's
 * geometry looks off. Deliberately minimal: no sample-photo fallback, no
 * tips panel, no persistent instructional chrome.
 */

/**
 * A compact circular icon control layered on the uploaded photo — 32x32
 * touch target, 24x24 icon. Deliberately smaller than `GlassIconButton`'s
 * 44px accessibility floor: these sit clustered close together over a small
 * area of the image, where a 44px target each would crowd the photo and
 * overlap one another. Used only here.
 */
const PhotoIconButton: React.FC<{
  label: string;
  iconSrc: string;
  onClick: () => void;
}> = ({ label, iconSrc, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="
      w-8 h-8 rounded-full flex items-center justify-center shrink-0
      bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card
      text-neutral-100 hover:text-white hover:bg-white/10 hover:border-spatial-border-elevated
      transition-all duration-200 active:scale-95
      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
    "
  >
    <img src={iconSrc} alt="" aria-hidden className="w-6 h-6" />
  </button>
);
const RoomPhotoDropzone: React.FC<{
  photo: UploadedPhoto | null;
  warning: string | null;
  isGenerating: boolean;
  hasGenerated: boolean;
  onFileSelected: (file: File | undefined) => void;
  onRemovePhoto: () => void;
}> = ({ photo, warning, isGenerating, hasGenerated, onFileSelected, onRemovePhoto }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo.previewUrl;
    a.download = photo.file.name || 'room.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="relative h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0])}
      />

      {!photo ? (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              onFileSelected(e.dataTransfer.files?.[0]);
            }}
            className={`
              w-full h-[430px] flex flex-col items-center justify-center gap-element text-center
              border-[1.6px] border-dashed rounded-card px-group
              transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              ${isDragOver
                ? 'border-primary-400 bg-primary-500/5'
                : 'border-spatial-border-elevated hover:border-primary-400/60 bg-spatial-glass-elevated'
              }
            `}
          >
            <img
              src="/assets/icons/upload_photo.svg"
              alt=""
              aria-hidden
              className="w-14 h-14 shrink-0"
            />
            <div className="flex flex-col items-center gap-1">
              <Typography variant="bodyMedium" colorClass="text-neutral-100">
                Click to upload<span className="text-neutral-500"> or just drag and drop</span>
              </Typography>
              <Typography variant="bodySmall" colorClass="text-neutral-500">
                .png, .jpg or .jpeg
              </Typography>
            </div>
          </button>

          <div className="flex items-center gap-1 mt-tight px-group">
            <img src="/assets/icons/info.svg" alt="" aria-hidden className="w-5 h-5 shrink-0" />
            <Typography variant="bodySmall" colorClass="text-neutral-400">
              Please capture each room from a corner with full height visible, good lighting, and minimal clutter.
            </Typography>
          </div>
        </>
      ) : (
        // Top-aligned, same as the empty state above — not vertically
        // centered, so the box's own top edge sits at the same position
        // regardless of state instead of shifting when the surrounding
        // content (tip line vs. caption/warning) changes height.
        <div className="w-full space-y-element">
            {/* Same fixed height as the empty dropzone (430px) regardless of
                the photo's own aspect ratio, so the box never grows or
                shrinks when a photo lands — solid border instead of dashed
                once a photo is in place, since dashed reads as "drop
                something here", which no longer applies. The photo is fit
                (not cropped); any blank space that leaves on the sides or
                top/bottom is filled with a blurred, scaled-up copy of the
                same photo instead of bare bars. */}
            <div className="relative w-full h-[430px] rounded-card overflow-hidden border-[1.6px] border-spatial-border-elevated bg-spatial-glass-elevated">
              <img
                src={photo.previewUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
              />
              <img
                src={photo.previewUrl}
                alt=""
                className={`
                  relative w-full h-full object-contain
                  transition-[filter] duration-500
                  ${isGenerating ? 'blur-md' : ''}
                `}
              />

              {/* Generating — the photo itself blurs and a soft light band
                  sweeps down it on loop (`animate-scan-sweep`, defined in
                  globals.css) as the one visual cue for "this is working". */}
              {isGenerating && (
                <>
                  <div aria-hidden className="absolute inset-0 bg-black/35" />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-primary-400/80 to-transparent blur-sm animate-scan-sweep"
                  />
                </>
              )}

              {/* Uploaded but not generated yet — just a way to back out
                  and pick a different photo. */}
              {!isGenerating && !hasGenerated && (
                <div className="absolute top-2 right-2 z-10">
                  <PhotoIconButton label="Cancel photo" iconSrc="/assets/icons/close.svg" onClick={onRemovePhoto} />
                </div>
              )}

              {/* Only shows once there's an actual generated result to act
                  on — download/full screen/clear all target the finished
                  image, not the raw upload above. */}
              {hasGenerated && !isGenerating && (
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-tight">
                  <PhotoIconButton label="Download image" iconSrc="/assets/icons/default_icon.svg" onClick={handleDownload} />
                  <PhotoIconButton label="View full screen" iconSrc="/assets/icons/aspect_ratio_24dp_E8EAED_FILL0_wght300_GRAD0_opsz24.svg" onClick={() => setIsFullscreen(true)} />
                  <PhotoIconButton label="Clear image" iconSrc="/assets/icons/close.svg" onClick={onRemovePhoto} />
                </div>
              )}
            </div>

            <div className="text-center space-y-tight">
              {isGenerating ? (
                <div role="status" aria-live="polite">
                  <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100">
                    Generating your room…
                  </Typography>
                </div>
              ) : (
                <>
                  <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100">
                    Your photo
                  </Typography>
                  <Typography variant="bodySmall" colorClass="text-neutral-400">
                    {photo.sizeMb} MB · Ready
                  </Typography>
                </>
              )}
            </div>

            {warning && !isGenerating && (
              <div className="flex items-start gap-tight px-element py-tight rounded-element border border-spatial-border-elevated bg-white/5">
                <span
                  aria-hidden
                  className="
                    shrink-0 w-5 h-5 rounded-pill mt-0.5
                    border border-spatial-border-elevated
                    flex items-center justify-center
                    font-sans text-[11px] font-bold text-neutral-300
                  "
                >
                  !
                </span>
                <Typography variant="bodySmall" colorClass="text-neutral-300">
                  {warning}
                </Typography>
              </div>
            )}
        </div>
      )}

      {/* Full screen — fills this dropzone's own area (the right column)
          rather than the whole modal, so it stays a self-contained view
          without needing to reach outside this component. */}
      {photo && isFullscreen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 p-group rounded-card">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close full screen"
            className="
              absolute top-2 right-2 w-11 h-11 flex items-center justify-center shrink-0
              rounded-element border border-spatial-border
              bg-spatial-glass-elevated text-neutral-300
              hover:text-white hover:bg-white/10
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            "
          >
            <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
          </button>
          <img src={photo.previewUrl} alt="" className="max-w-full max-h-full object-contain rounded-card" />
        </div>
      )}
    </div>
  );
};

export const VisualizeOverlay: React.FC<VisualizeOverlayProps> = ({
  roomName,
  variants,
  activeVariantSlug,
  mode,
  onClose,
  onEnterUpload,
  onBackToStyles,
  initialUploadVariantSlug,
  onSubmit,
}) => {
  const isOpen = mode !== 'closed';
  const isUpload = mode === 'upload';

  // ── Styles layer state (its own level 1 grid ↔ level 2 gallery) ──
  const [level, setLevel] = useState<1 | 2>(1);
  const [viewingSlug, setViewingSlug] = useState<string | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Upload layer state ──
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [styleQuery, setStyleQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const generateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Two parallel upload experiences, picked with the 1/2 switch: 1 is the
  // current split-screen layout, 2 is the original step-based wizard.
  const [flowVariant, setFlowVariant] = useState<1 | 2>(1);
  // The switch only appears once the shell's own resize (`duration-500`)
  // into upload mode has visually settled — not mid-transition.
  const [showFlowSwitch, setShowFlowSwitch] = useState(false);

  // Fresh session each time the whole overlay opens from closed — but
  // switching between the styles and upload layers within one open session
  // (mode !== 'closed' the whole time) intentionally leaves both layers'
  // state alone, since nothing actually closed.
  useEffect(() => {
    if (!isOpen) return;
    setLevel(1);
    setViewingSlug(null);
    setZoomedIndex(null);
    setSearchQuery('');
    setSelectedSlug(initialUploadVariantSlug ?? variants[0]?.slug ?? null);
    setPhoto(null);
    setWarning(null);
    setStyleQuery('');
    setIsGenerating(false);
    setHasGenerated(false);
    setFlowVariant(1);
    if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Belt-and-braces cleanup if the component itself ever unmounts mid-"generation".
  useEffect(() => {
    return () => {
      if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
    };
  }, []);

  // Reveal the 1/2 flow switch only once the shell's own grow/shrink
  // (`transition-all duration-500` on the shell) has visually settled —
  // hide it immediately on the way out so it doesn't linger through the
  // shrink back to the styles layer's footprint.
  useEffect(() => {
    if (!isUpload) {
      setShowFlowSwitch(false);
      return;
    }
    const t = setTimeout(() => setShowFlowSwitch(true), 550);
    return () => clearTimeout(t);
  }, [isUpload]);

  // A new "Try in your room" trigger (a different tile) should still update
  // which style is preselected even though the upload layer's own state
  // otherwise survives the styles↔upload switch.
  useEffect(() => {
    if (initialUploadVariantSlug) setSelectedSlug(initialUploadVariantSlug);
  }, [initialUploadVariantSlug]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (zoomedIndex !== null) setZoomedIndex(null);
      else if (isUpload) onBackToStyles();
      else if (level === 2) setLevel(1);
      else onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isUpload, level, zoomedIndex, onClose, onBackToStyles]);

  // Object URLs are only ever released here or on replacement below —
  // never left dangling across a photo swap.
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.previewUrl]);

  const viewingVariant = useMemo(
    () => variants.find((v) => v.slug === viewingSlug) ?? null,
    [variants, viewingSlug],
  );
  const gallery = viewingVariant?.gallery ?? [];
  const zoomedImage = zoomedIndex !== null ? gallery[zoomedIndex] : null;

  const visibleStylesGridVariants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return variants;
    return variants.filter((v) => v.name.toLowerCase().includes(query));
  }, [variants, searchQuery]);

  const openVariant = (variant: RoomVariant) => {
    setViewingSlug(variant.slug);
    setLevel(2);
  };

  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setWarning(checkPhotoSuitability(img));
    img.src = previewUrl;
    setPhoto({ file, previewUrl, sizeMb: (file.size / (1024 * 1024)).toFixed(1) });
    setWarning(null);
    setHasGenerated(false);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setWarning(null);
    setHasGenerated(false);
  };

  const selectedVariant = useMemo(
    () => variants.find((v) => v.slug === selectedSlug) ?? null,
    [variants, selectedSlug],
  );
  const canSubmit = !!selectedVariant && !!photo && !isGenerating;

  // Search only earns its keep once the grid is long enough to need it —
  // below that, scanning ~10-12 cards by eye is faster than typing.
  const showUploadStyleSearch = variants.length > 10;
  const visibleUploadVariants = useMemo(() => {
    if (!showUploadStyleSearch) return variants;
    const query = styleQuery.trim().toLowerCase();
    if (!query) return variants;
    return variants.filter((v) => styleLabelFor(v).toLowerCase().includes(query));
  }, [variants, styleQuery, showUploadStyleSearch]);

  const handleSubmit = () => {
    if (!selectedVariant || !photo || isGenerating) return;
    setIsGenerating(true);
    // No backend behind this yet — this simulates the wait so the "photo
    // blurs and something is happening" cue actually has time to read,
    // then hands off through the same onSubmit hook as before.
    generateTimeoutRef.current = setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
      onSubmit?.(selectedVariant, photo.file);
    }, GENERATE_DURATION_MS);
  };

  // Rendered inline in flow 1's own header and passed into flow 2's header
  // via `headerExtra` — one definition, so the two flows can't drift apart.
  const flowSwitch = showFlowSwitch ? (
    <div
      role="tablist"
      aria-label="Upload flow variant"
      className="flex items-center gap-0.5 bg-spatial-glass-elevated border border-spatial-border rounded-pill p-0.5 shrink-0"
    >
      {([1, 2] as const).map((n) => (
        <button
          key={n}
          type="button"
          role="tab"
          aria-selected={flowVariant === n}
          onClick={() => setFlowVariant(n)}
          className={`
            w-7 h-7 rounded-pill flex items-center justify-center
            font-sans text-[12px] font-semibold
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            ${flowVariant === n ? 'bg-primary-500 text-white' : 'text-neutral-400 hover:text-neutral-100'}
          `}
        >
          {n}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div
      className={`
        fixed inset-0 z-[170] flex items-center justify-center p-3 sm:p-6
        bg-black/60 transition-opacity duration-300
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
    >
      {/* Single shell — the same element resizes between the styles
          lookbook's footprint and the upload flow's larger one, so the
          change reads as one overlay resizing rather than a different
          modal opening on top. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isUpload ? 'Visualize in your room' : 'Visualize styles'}
        aria-hidden={!isOpen}
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full flex flex-col overflow-hidden
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal
          transition-all duration-500 ease-out
          ${isUpload
            ? flowVariant === 2
              ? 'max-w-[900px] h-[min(840px,calc(min(100dvh,100vw)_-_48px))] rounded-container'
              : 'max-w-[1120px] h-[min(840px,calc(min(100dvh,100vw)_-_48px))] rounded-container'
            : 'max-w-[1080px] h-[min(720px,calc(min(100dvh,100vw)_-_48px))] rounded-card'
          }
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}
        `}
      >
        <div className="relative flex-1 min-h-0">
          {/* ── STYLES layer (its own level 1 grid ↔ level 2 gallery) ── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${isUpload ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}
            `}
          >
            <div className="relative flex-1 min-h-0">
              {/* Level 1: style picker */}
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
                  {visibleStylesGridVariants.length === 0 ? (
                    <Typography variant="bodyMedium" colorClass="text-neutral-400">
                      No styles match “{searchQuery}”.
                    </Typography>
                  ) : (
                    <div className="grid grid-cols-3 gap-element">
                      {visibleStylesGridVariants.map((variant) => {
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
                                onEnterUpload(variant);
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

              {/* Level 2: style gallery */}
              <div
                className={`
                  absolute inset-0 flex flex-col
                  transition-opacity duration-300
                  ${level === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}
                `}
              >
                <header className="shrink-0 flex items-center gap-element px-group py-element border-b border-spatial-border">
                  <GlassIconButton label="Back to styles" tooltip shape="circle" onClick={() => setLevel(1)} className="shrink-0">
                    <img src="/assets/icons/arrow_back.svg" alt="" aria-hidden className="w-6 h-6" />
                  </GlassIconButton>
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

              {/* Enlarged image, over the gallery */}
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

          {/* ── UPLOAD layer ── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${isUpload ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}
            `}
          >
            {flowVariant === 2 ? (
              <VisualizeUploadWizard
                roomName={roomName}
                variant={selectedVariant}
                onBack={onBackToStyles}
                onClose={onClose}
                headerExtra={flowSwitch}
              />
            ) : (
              <>
                <header className="shrink-0 flex items-center gap-element px-container py-group border-b border-spatial-border">
                  <GlassIconButton label="Back to styles" tooltip shape="circle" onClick={onBackToStyles} className="shrink-0">
                    <img src="/assets/icons/arrow_back.svg" alt="" aria-hidden className="w-6 h-6" />
                  </GlassIconButton>
                  <Typography variant="h3" weight="bold" colorClass="text-neutral-50" className="flex-1 min-w-0 truncate">
                    Visualize {roomName} in your room
                  </Typography>
                  {flowSwitch}
                </header>

            {/* Body — style picker on the left (with the submit CTA
                anchored under it), the upload dropzone on the right. */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-container p-container">
                {/* Left — choose style */}
                <div className="flex flex-col min-h-0">
                  <Typography
                    variant="bodySmall"
                    colorClass="text-neutral-500"
                    className="uppercase tracking-widest mb-element shrink-0"
                  >
                    Choose style
                  </Typography>

                  {/* Only worth the chrome once there's enough styles that
                      scanning by eye stops being faster than typing — below
                      that threshold this stays hidden entirely. */}
                  {showUploadStyleSearch && (
                    <div className="shrink-0 mb-element space-y-tight">
                      <div className="relative">
                        <img
                          src="/assets/icons/default_icon.svg"
                          alt=""
                          aria-hidden
                          className="absolute left-element top-1/2 -translate-y-1/2 w-4 h-4 opacity-40"
                        />
                        <input
                          type="text"
                          value={styleQuery}
                          onChange={(e) => setStyleQuery(e.target.value)}
                          placeholder="Search styles…"
                          className="
                            w-full h-11 pl-11 pr-element rounded-pill
                            bg-spatial-glass-elevated border border-spatial-border
                            text-neutral-100 placeholder:text-neutral-500
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                          "
                        />
                      </div>
                      {/* The selected card can scroll out of view once the grid
                          is long enough to need search — this keeps the pick
                          visible regardless. */}
                      {selectedVariant && (
                        <Typography variant="bodySmall" colorClass="text-neutral-500" className="truncate">
                          Selected: <span className="text-neutral-300">{styleLabelFor(selectedVariant)}</span>
                        </Typography>
                      )}
                    </div>
                  )}

                  {/* Fixed ceiling, never grows past it — independent of the
                      right column's own scrolling. `flex-1 min-h-0` still lets
                      it shrink below that ceiling on a short viewport. */}
                  <div className="flex-1 min-h-0 max-h-[480px] overflow-y-auto custom-scrollbar -mx-1 px-1">
                    {variants.length === 0 ? (
                      <Typography variant="bodyMedium" colorClass="text-neutral-500">
                        No styles available for this room yet.
                      </Typography>
                    ) : visibleUploadVariants.length === 0 ? (
                      <Typography variant="bodyMedium" colorClass="text-neutral-500">
                        No styles match “{styleQuery}”.
                      </Typography>
                    ) : (
                      <div className="grid grid-cols-2 gap-element">
                        {visibleUploadVariants.map((variant) => {
                          const isSelected = variant.slug === selectedSlug;
                          const thumbnail = thumbnailFor(variant);
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => setSelectedSlug(variant.slug)}
                              aria-pressed={isSelected}
                              className={`
                                text-left rounded-card border overflow-hidden
                                transition-all duration-200
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                                ${isSelected
                                  ? 'border-primary-500 bg-primary-500/10'
                                  : 'border-spatial-border bg-spatial-glass-elevated hover:border-spatial-border-elevated'
                                }
                              `}
                            >
                              <div className="relative aspect-[4/3] bg-spatial-glass-elevated">
                                {thumbnail
                                  ? <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                                  : <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="absolute inset-0 m-auto w-6 h-6 opacity-30" />
                                }
                                {isSelected && (
                                  <span
                                    aria-hidden
                                    className="
                                      absolute top-2 right-2 w-5 h-5 rounded-pill shrink-0
                                      bg-primary-500 text-white
                                      flex items-center justify-center
                                      font-sans text-[11px] font-bold
                                    "
                                  >
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="p-element">
                                <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50">
                                  {styleLabelFor(variant)}
                                </Typography>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="medium"
                    rightIcon
                    rightIconSrc="/assets/icons/arrow_forward.svg"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className="!w-full mt-group shrink-0 shadow-card active:scale-[0.98]"
                  >
                    {isGenerating ? 'Generating…' : `Design ${roomName}`}
                  </Button>
                </div>

                {/* Right — upload your room */}
                <div className="flex flex-col min-h-0">
                  <Typography
                    variant="bodySmall"
                    colorClass="text-neutral-500"
                    className="uppercase tracking-widest mb-element shrink-0"
                  >
                    Upload your room
                  </Typography>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    <RoomPhotoDropzone
                      photo={photo}
                      warning={warning}
                      isGenerating={isGenerating}
                      hasGenerated={hasGenerated}
                      onFileSelected={handleFileSelected}
                      onRemovePhoto={handleRemovePhoto}
                    />
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
