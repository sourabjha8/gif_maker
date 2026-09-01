'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '../UI';
import { Button } from '../Button';
import { GlassIconButton } from '../GlassIconButton';
import type { RoomVariant } from '../../types';

/**
 * The original step-based "visualize in your room" flow (Figma node
 * 1025:7262: Upload your room → About this style → Your AI render), kept
 * alive as flow "2" alongside the newer single-screen split layout
 * (flow "1") in `VisualizeOverlay`. Embedded inside that overlay's own
 * shell/backdrop — this component only renders the header, stepper, body
 * and footer, not its own modal chrome.
 */
export interface VisualizeUploadWizardProps {
  roomName: string;
  /** The style this flow is generating into — picked before entering this flow. */
  variant: RoomVariant | null;
  /** Header back arrow — returns to the style picker (flow 1's "styles" layer). */
  onBack: () => void;
  /** Header close (X) — dismisses the whole overlay, matching the Figma source exactly. */
  onClose: () => void;
  /** Optional content rendered in the header, between the title and the close button — e.g. the 1/2 flow switch. */
  headerExtra?: React.ReactNode;
}

type StepNumber = 1 | 2 | 3;

const STEPS: { n: StepNumber; label: string }[] = [
  { n: 1, label: 'Upload your room' },
  { n: 2, label: 'About this style' },
  { n: 3, label: 'Your AI render' },
];

/** Same thumbnail-selection logic used elsewhere — no new asset, just reused. */
function thumbnailFor(variant: RoomVariant): string | undefined {
  return variant.gallery?.[0]?.url ?? variant.panorama.lowUrl ?? variant.panorama.url;
}

interface UploadedPhoto {
  file: File;
  previewUrl: string;
  sizeMb: string;
}

/**
 * A real (not fabricated) suitability check computed from the photo's own
 * aspect ratio. There's no vision model behind this, so it only flags what
 * pixel geometry alone can support.
 */
function checkPhotoSuitability(img: HTMLImageElement): string | null {
  const ratio = img.naturalWidth / img.naturalHeight;
  if (ratio > 2.0) return "This photo's a bit too wide-angle for a clean result. Try a straighter shot.";
  if (ratio < 0.6) return 'This crop looks narrow — try to fit both side walls and the floor in frame.';
  return null;
}

const Step1Upload: React.FC<{
  photo: UploadedPhoto | null;
  warning: string | null;
  onFileSelected: (file: File | undefined) => void;
  onRemovePhoto: () => void;
}> = ({ photo, warning, onFileSelected, onRemovePhoto }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-full">
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
              w-full flex flex-col items-center justify-center gap-element text-center
              border-[1.6px] border-dashed rounded-card px-group py-32
              transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              ${isDragOver
                ? 'border-primary-400 bg-primary-500/5'
                : 'border-spatial-border-elevated hover:border-primary-400/60 bg-spatial-glass-elevated'
              }
            `}
          >
            <img src="/assets/icons/upload_photo.svg" alt="" aria-hidden className="w-14 h-14 shrink-0" />
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
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-full space-y-element">
            <div className="relative w-full aspect-[2/1] rounded-card overflow-hidden border-[1.6px] border-spatial-border-elevated bg-spatial-glass-elevated">
              <img
                src={photo.previewUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
              />
              <img src={photo.previewUrl} alt="" className="relative w-full h-full object-contain" />

              {/* GlassIconButton's own wrapper is only `position: relative`,
                  not absolute — without this wrapper it sits in normal flow
                  below the full-height image above and gets clipped by
                  `overflow-hidden`, invisible. */}
              <div className="absolute top-2 right-2 z-10">
                <GlassIconButton label="Clear photo" shape="rounded" onClick={onRemovePhoto}>
                  <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5" />
                </GlassIconButton>
              </div>
            </div>

            <div className="text-center space-y-tight">
              <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100">
                Your photo
              </Typography>
              <Typography variant="bodySmall" colorClass="text-neutral-400">
                {photo.sizeMb} MB · Ready
              </Typography>
            </div>

            {warning && (
              <div className="flex items-start gap-tight px-element py-tight rounded-element border border-spatial-border-elevated bg-white/5">
                <span
                  aria-hidden
                  className="shrink-0 w-5 h-5 rounded-pill mt-0.5 border border-spatial-border-elevated flex items-center justify-center font-sans text-[11px] font-bold text-neutral-300"
                >
                  !
                </span>
                <Typography variant="bodySmall" colorClass="text-neutral-300">
                  {warning}
                </Typography>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Matches Figma node 1031:7869 exactly: a room reference photo on the left,
 * a color palette grid on the right — no intro sentence, no "what this
 * style changes" list, no bordered card wrapping either side.
 */
const Step2AboutStyle: React.FC<{ variant: RoomVariant | null | undefined }> = ({ variant }) => {
  if (!variant) return null;

  const thumbnail = thumbnailFor(variant);
  const swatches = (variant.materials ?? []).filter((m) => m.swatch);

  return (
    <div className="flex gap-group items-start">
      {/* Fixed width matching Figma's own 425px image, not flex-1 — a
          variant with no material swatches (the palette column then
          doesn't render at all) would otherwise let this expand to fill
          the whole row, making it disproportionately tall and overflowing
          the fixed step-body height. */}
      <div className="w-full max-w-[480px] shrink-0">
        <Typography variant="titleLarge" weight="semiBold" colorClass="text-neutral-50" className="mb-element">
          Room reference
        </Typography>
        <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-spatial-glass-elevated">
          {thumbnail
            ? <img src={thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
            : <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-8 h-8 m-auto mt-[calc(50%-16px)] opacity-30" />
          }
          <div aria-hidden className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      {swatches.length > 0 && (
        <div className="flex-1 min-w-0">
          <Typography variant="titleMedium" weight="bold" colorClass="text-neutral-50" className="mb-element">
            Color palette
          </Typography>
          {/* Gives the section a purpose beyond an unlabeled swatch set,
              and — alongside the generous spacing below — helps this
              column's content approach the reference image's height
              instead of trailing off into empty space beneath it. */}
          <Typography variant="bodyMedium" colorClass="text-neutral-400" className="mb-group">
            This is the palette {variant.name} will apply to your room.
          </Typography>
          <div className="grid grid-cols-3 gap-element">
            {swatches.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-tight">
                <span aria-hidden className="w-full h-[47.75px] rounded-[8px] shrink-0" style={{ background: m.swatch }} />
                <Typography variant="bodySmall" colorClass="text-neutral-50" className="text-center whitespace-nowrap">
                  {m.label}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** How long the "analyzing" reveal plays before the before/after slider appears — matches flow 1's blur + scan-sweep generating animation exactly. */
const REVEAL_DURATION_MS = 2500;

/**
 * Step 3 — matches Figma node 1032:8078: just the room, full-width, as a
 * before/after compare slider (no summary cards, no action row — those
 * belonged to an earlier draft of this screen). On arrival it first plays
 * the same blur + scan-sweep "analyzing" animation flow 1 uses on submit,
 * then reveals the slider — so the two flows read as the same underlying
 * "AI working" moment, not two different pieces of UI.
 */
const Step3Render: React.FC<{
  variant: RoomVariant | null | undefined;
  photo: { file: File; previewUrl: string } | null;
}> = ({ variant, photo }) => {
  const [split, setSplit] = useState(50);
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    setIsRevealing(true);
    const t = setTimeout(() => setIsRevealing(false), REVEAL_DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?.slug, photo?.previewUrl]);

  if (!variant || !photo) return null;

  const afterUrl = thumbnailFor(variant) ?? photo.previewUrl;

  const handlePointerDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const update = (clientX: number) => {
      setSplit(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    };
    update(e.clientX);
    const move = (ev: PointerEvent) => update(ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Fills the fixed step body exactly (no aspect-ratio box) — an
  // aspect-ratio-derived height could exceed the available space on a
  // shorter viewport and force the body to scroll; filling h-full instead
  // guarantees it always fits in one view.
  return (
      <div className="relative w-full h-full rounded-card overflow-hidden bg-black select-none">
      {isRevealing ? (
        // Same treatment as the blurred, scan-swept photo in flow 1's
        // RoomPhotoDropzone while `isGenerating` — reused here so both
        // flows' "AI is working" moment looks identical.
        <>
          <img src={photo.previewUrl} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover blur-md" />
          <div aria-hidden className="absolute inset-0 bg-black/35" />
          <div
            aria-hidden
            className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-primary-400/80 to-transparent blur-sm animate-scan-sweep"
          />
          <div role="status" aria-live="polite" className="absolute inset-0 flex items-center justify-center">
            <Typography variant="bodySmall" colorClass="text-neutral-100">Generating your room…</Typography>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 touch-none" onPointerDown={handlePointerDrag}>
          <img src={photo.previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
            <img src={afterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          </div>
          <span className="absolute bottom-3 left-2 px-element py-0.5 rounded-pill bg-black/60 backdrop-blur-sm border-[0.8px] border-spatial-border">
            <Typography variant="bodySmall" colorClass="text-neutral-200">Before</Typography>
          </span>
          <span className="absolute bottom-3 right-2 px-element py-0.5 rounded-pill bg-black/60 backdrop-blur-sm border-[0.8px] border-spatial-border">
            <Typography variant="bodySmall" colorClass="text-neutral-200">After</Typography>
          </span>
          <div aria-hidden className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize" style={{ left: `${split}%` }}>
            <span className="w-0.5 h-full bg-white/70 absolute" />
            <span className="w-8 h-8 rounded-pill bg-white text-neutral-900 flex items-center justify-center text-sm font-bold shadow-card">⇄</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const VisualizeUploadWizard: React.FC<VisualizeUploadWizardProps> = ({
  roomName,
  variant,
  onBack,
  onClose,
  headerExtra,
}) => {
  const [step, setStep] = useState<StepNumber>(1);
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    setStep(1);
    setPhoto(null);
    setWarning(null);
  }, [variant]);

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.previewUrl]);

  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setWarning(checkPhotoSuitability(img));
    img.src = previewUrl;
    setPhoto({ file, previewUrl, sizeMb: (file.size / (1024 * 1024)).toFixed(1) });
    setWarning(null);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setWarning(null);
  };

  const canContinue = step !== 1 || !!photo;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-element px-group py-element border-b border-spatial-border">
        <GlassIconButton label="Back to styles" tooltip shape="circle" onClick={onBack} className="shrink-0">
          <img src="/assets/icons/arrow_back.svg" alt="" aria-hidden className="w-6 h-6" />
        </GlassIconButton>
        <Typography variant="h3" weight="bold" colorClass="text-neutral-50" className="flex-1 min-w-0 truncate">
          {roomName} in different styles
        </Typography>
        {headerExtra}
        <GlassIconButton label="Close" tooltip shape="element" elevated onClick={onClose} className="shrink-0">
          <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
        </GlassIconButton>
      </header>

      {/* Stepper */}
      <div className="shrink-0 flex items-center gap-tight px-group py-element border-b border-spatial-border overflow-x-auto custom-scrollbar">
        {STEPS.map((s, idx) => {
          const isOn = s.n === step;
          const isDone = s.n < step;
          return (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-tight shrink-0">
                <span
                  className={`
                    w-6 h-6 rounded-pill flex items-center justify-center shrink-0
                    font-sans text-[11px] font-semibold border
                    transition-colors duration-200
                    ${isOn
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : isDone
                        ? 'bg-primary-500/15 border-primary-400/50 text-primary-300'
                        : 'bg-spatial-glass-elevated border-spatial-border text-neutral-500'
                    }
                  `}
                >
                  {s.n}
                </span>
                <Typography
                  variant="bodySmall"
                  weight={isOn ? 'semiBold' : 'regular'}
                  colorClass={isOn ? 'text-neutral-50' : isDone ? 'text-neutral-300' : 'text-neutral-500'}
                  className="whitespace-nowrap hidden sm:block"
                >
                  {s.label}
                </Typography>
              </div>
              {idx < STEPS.length - 1 && <span className="flex-1 h-px bg-spatial-border" aria-hidden />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Body — a fixed-height content area shared by all four steps, so
          switching steps never resizes the panel. Grown alongside the
          overlay's own larger footprint so the extra room doesn't just sit
          unused around Step 3's richer (slider + summary cards) content. */}
      <div className="relative shrink basis-[600px] grow-0 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar p-group">
          {step === 1 ? (
            <Step1Upload
              photo={photo}
              warning={warning}
              onFileSelected={handleFileSelected}
              onRemovePhoto={handleRemovePhoto}
            />
          ) : step === 2 ? (
            <Step2AboutStyle variant={variant} />
          ) : (
            <Step3Render variant={variant} photo={photo} />
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
      </div>

      {/* Footer */}
      <footer className="shrink-0 flex items-center gap-element px-group py-element border-t border-spatial-border">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as StepNumber)}
            className="
              flex items-center gap-tight
              text-neutral-300 hover:text-white transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element
            "
          >
            <img src="/assets/icons/chevron_previous.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
            <Typography variant="bodySmall" colorClass="text-inherit">Back</Typography>
          </button>
        )}
        <div className="flex-1" />
        {/* Matches Figma's footer, which keeps a Continue button on every
            step including the last — clicking it on step 3 is a no-op
            (nothing past step 3 yet) rather than hidden entirely. */}
        <Button
          type="button"
          variant="primary"
          size="medium"
          rightIcon
          rightIconSrc="/assets/icons/arrow_forward.svg"
          disabled={!canContinue}
          onClick={() => setStep((s) => (s < 3 ? ((s + 1) as StepNumber) : s))}
          className="shadow-card active:scale-[0.98]"
        >
          {step === 1 && warning ? 'Continue anyway' : 'Continue'}
        </Button>
      </footer>
    </div>
  );
};
