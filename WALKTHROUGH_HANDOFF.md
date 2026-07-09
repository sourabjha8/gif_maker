# 360 → Walkthrough Video Transition — Developer Handoff

This document specifies the "Room Tour" feature built in the Virtual XP Lite prototype: a
button that crossfades the active 360° panorama into a straight walkthrough video, with
its own playback chrome, then crossfades back. It was built and smoothed out in this
prototype and needs to be re-implemented against the **real product's own data layer,
video assets, and design system** — nothing here should be copy-pasted verbatim if the
target codebase's component/state conventions differ. Treat this as a spec + reference
implementation, not a drop-in package.

---

## 1. What it does (user-visible behavior)

1. A room that has a walkthrough video shows a **"Room Tour" pill** in the top bar. Rooms
   without one show no button at all — this is a per-room-variant, optional feature.
2. Tapping it:
   - Hides all hotspot markers on the panorama.
   - Crossfades from the live 360° panorama into a full-screen video.
   - Swaps the bottom room-navigator and the right-side icon dock out for a **video seek
     bar** (play/pause, scrubber, mute, playback-speed cycle).
   - The "Room Tour" button itself morphs from a pill into a circle and its icon swaps
     from a play glyph to a close (×) — it is now the *exit* control.
3. After **3 seconds of no input** (no mouse move, touch, click, or key press), all chrome
   (top bar, seek bar) fades to invisible so the video has the full screen. Any input
   instantly restores it — no ease-in delay on the way back.
4. Exiting (via the button or Escape) crossfades back to the panorama, restores hotspots,
   and pauses the video.
5. Re-opening the same room's tour always restarts the video from `00:00` at `1×` speed,
   regardless of where it was left off last time.

**Explicitly not supported / decisions made:**
- Clicking anywhere on the video does **not** close it (only the button/Escape). This was
  an explicit product decision — don't reintroduce click-to-dismiss without checking.
- One walkthrough video per room *variant* (not per room, not per hotspot). If a room has
  multiple selectable variants (materials/layouts), each variant can have its own video or
  none.
- No resume/save-position — always restarts at 0.
- No analytics/completion tracking hooks exist yet (add if the real product needs them —
  `onProgress` already surfaces `{currentTime, duration}` on every frame, so this is cheap
  to bolt on).

---

## 2. Data contract

One optional field on the room-variant content shape:

```ts
interface RoomVariant {
  // ...existing fields (panorama, hotspots, gallery, materials, etc.)
  /** Optional walkthrough video, crossfaded over the panorama on demand. */
  walkthroughVideoUrl?: string;
}
```

In this prototype the content is static typed JSON validated with Zod
(`src/lib/validation/schemas.ts`):

```ts
walkthroughVideoUrl: z.string().optional(),
```

**For the real product**: map this to wherever room/variant data actually comes from (CMS
field, API response, etc.) — it's just a URL string to an MP4. No other metadata (duration,
thumbnail, captions) is read by the feature as built; add those to the contract only if the
real product's UI needs them.

---

## 3. Component breakdown

Five pieces, in dependency order. React + TypeScript + Tailwind + GSAP (already a project
dependency — `gsap@^3`) is the stack this was built on; adapt patterns (not necessarily
literal code) if the real product uses different primitives.

### 3.1 `WalkthroughVideo` — the crossfading video layer

Owns the `<video>` element and the panorama↔video crossfade. Mounted once per room
(conditionally, only if `walkthroughVideoUrl` exists), sitting in its own absolutely
positioned layer between the 360 viewer and the UI chrome (`z-index` between them).

```tsx
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

  // Crossfade in/out. Dynamically imported so gsap doesn't bloat the initial bundle.
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    if (isActive) {
      video.currentTime = 0;
      video.playbackRate = 1;

      // IMPORTANT: don't start the crossfade until the video is actually
      // rendering frames. Fading in immediately after calling .play() means
      // the fade plays over a still-buffering/black frame — that stutter is
      // what reads as "lag" on the transition. Wait for readiness instead.
      const startFade = () => {
        import('gsap').then(({ gsap }) => {
          gsap.to(container, {
            autoAlpha: 1,
            duration: 0.8,
            ease: 'power2.inOut',
            force3D: true,
          });
        });
      };

      if (video.readyState >= 3) {
        startFade();
      } else {
        video.addEventListener('playing', startFade, { once: true });
      }

      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay-with-sound can be blocked; retry muted.
          video.muted = true;
          video.play().catch(() => {});
        });
      }

      return () => video.removeEventListener('playing', startFade);
    } else {
      import('gsap').then(({ gsap }) => {
        gsap.to(container, {
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          force3D: true,
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
      // will-change + translateZ(0) promote this to its own compositor layer
      // so the opacity crossfade doesn't force a repaint of the WebGL
      // panorama underneath it — also part of the anti-jank fix.
      className="absolute inset-0 z-[5] bg-black opacity-0 invisible pointer-events-auto will-change-[opacity] [transform:translateZ(0)]"
      aria-hidden={!isActive}
      // Deliberately NO onClick={onExit} here — clicking the video must not
      // close it. Only the toggle button / Escape does.
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
```

**Why `autoAlpha` (GSAP) instead of a plain CSS opacity transition:** it also toggles
`visibility`, so the invisible video layer doesn't eat pointer events or sit in the
accessibility tree when hidden — cheaper than juggling `pointer-events`/`display` by hand.

**Why the ref is externally injectable (`videoRef` prop):** the seek bar (below) needs
direct imperative access to the same `<video>` element (`.currentTime`, `.playbackRate`,
`.muted`, `.paused`) without re-rendering this component. The parent screen owns the ref
and threads it into both children.

### 3.2 `WalkthroughSeekBar` — playback controls

A self-contained control bar: play/pause toggle, scrubber, mute toggle, and a
tap-to-cycle speed control (1× → 1.5× → 2× → 1×). It reads video state via native
`<video>` events (`play`/`pause`/`ratechange`/`volumechange`) so it stays correct even if
something else changes playback state (autoplay retry, `onEnded`, etc.) — it never assumes
its own last action is the source of truth.

```tsx
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
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleRateChange = () => setPlaybackRate(video.playbackRate);
    const handleVolumeChange = () => setIsMuted(video.muted);

    setIsPlaying(!video.paused);
    setPlaybackRate(video.playbackRate);
    setIsMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ratechange', handleRateChange);
    video.addEventListener('volumechange', handleVolumeChange);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ratechange', handleRateChange);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoRef]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = (Number(e.target.value) / 100) * duration;
  }, [videoRef, duration]);

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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, [videoRef]);

  // Render: play/pause button — scrubber <input type="range"> — mute button
  // — speed-cycle button showing "{playbackRate}x", fixed-width so the bar
  // doesn't resize when the label changes length (1x vs 1.5x vs 2x).
  // See src/components/tour/WalkthroughSeekBar.tsx in this repo for the JSX.
};
```

The scrubber is a plain `<input type="range">` with its filled-track drawn via an inline
`background: linear-gradient(...)` computed from `progress` — the one legitimate inline
style in this feature, since it's a per-frame computed value, not static theming.

### 3.3 Toggle button (in this prototype: `TourTopBar`)

The one control that both **starts** and **exits** the walkthrough. Two things worth
carrying over regardless of where this button actually lives in the real product's chrome:

1. **Icon swap on activation.** Two icons occupy the same absolutely-positioned square,
   cross-fading opacity based on active state, so the button doesn't resize when the icon
   changes:
   ```tsx
   <span className="relative w-4 h-4 shrink-0">
     <img src="/* play/tour icon */" className={isActive ? 'opacity-0' : 'opacity-80'} />
     <img src="/* close icon */"     className={isActive ? 'opacity-90' : 'opacity-0'} />
   </span>
   ```
2. **Pill → circle collapse via GSAP**, so the button becomes a plain circular icon button
   while active instead of staying a full pill with hidden text. The key trick: GSAP can't
   animate `width` from `auto`, so read the actual pixel widths with
   `getBoundingClientRect()` first, `gsap.set()` those as explicit starting values, *then*
   tween to the collapsed width (which should equal the button's own height, so
   `border-radius: 9999px` renders it as a perfect circle) — and shrink left/right padding
   in the same tween so the icon stays centered instead of clipping against the edge:
   ```ts
   const fullWidth = btn.getBoundingClientRect().width;
   const collapsedWidth = btn.getBoundingClientRect().height; // square → circle
   const iconWidth = icon.getBoundingClientRect().width;
   const collapsedPaddingX = Math.max((collapsedWidth - iconWidth) / 2, 0);

   gsap.set(btn, { width: fullWidth });
   gsap.set(label, { width: label.getBoundingClientRect().width, overflow: 'hidden' });

   tl.to(label, { width: 0, opacity: 0 }, 0)
     .to(btn, { width: collapsedWidth, paddingLeft: collapsedPaddingX, paddingRight: collapsedPaddingX }, 0);
   ```
   The label's text also fades/collapses in the same timeline so it reads as one motion,
   not two separate animations.

Wiring: the button's `onClick` must branch on active state — call the *start* handler when
inactive, the *exit* handler when active. Don't reuse a single toggle callback for both;
keep them as two distinct props (`onWalkthrough` / `onExitWalkthrough` in this prototype) so
the parent screen can attach different side effects to each (e.g. clearing an open hotspot
panel only on *start*).

### 3.4 Hotspot suppression (in this prototype: `TourViewer`)

Whatever renders hotspot markers on the panorama needs an escape hatch to render *zero*
markers while the walkthrough is active — pass an empty array/list instead of the real
hotspot data when `isActive` is true:

```tsx
<PanoramaViewer hotspots={isWalkthrough ? [] : variant.hotspots} ... />
```

If the real product has more than one visual layer of markers (this prototype originally
had two — real product hotspots *and* decorative scatter markers — before they were
unified into one system), make sure **all** of them respect this, not just the primary one.
A half-hidden marker layer is worse than none.

### 3.5 Screen-level orchestration (in this prototype: `TourScreen`)

The screen that hosts the panorama owns:

- `isWalkthrough: boolean` — the single source of truth for active/inactive.
- `walkthroughVideoRef: RefObject<HTMLVideoElement>` — created once, passed into both
  `WalkthroughVideo` (which attaches it to the `<video>` element) and `WalkthroughSeekBar`
  (which reads/writes through it). This is *the* piece of plumbing that lets two sibling
  components share one imperative video handle without prop-drilling every control action
  through the screen.
- `walkthroughProgress: {currentTime, duration}` — updated via `WalkthroughVideo`'s
  `onProgress` callback on every `timeupdate`/`loadedmetadata`, fed into the seek bar for
  its scrubber position. Kept as plain state here (not inside the seek bar) because the
  video element is the source of truth and multiple things could theoretically want it.
- **Idle-fade timer** — a single `useEffect` keyed on `isWalkthrough`:
  ```ts
  useEffect(() => {
    if (!isWalkthrough) { setIsChromeIdle(false); return; }

    let idleTimer: ReturnType<typeof setTimeout>;
    const reset = () => {
      setIsChromeIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsChromeIdle(true), 3000);
    };

    reset();
    window.addEventListener('mousemove', reset);
    window.addEventListener('mousedown', reset);
    window.addEventListener('touchstart', reset);
    window.addEventListener('touchmove', reset);
    window.addEventListener('keydown', reset);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('mousedown', reset);
      window.removeEventListener('touchstart', reset);
      window.removeEventListener('touchmove', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [isWalkthrough]);
  ```
  `isChromeIdle` then just adds `opacity-0 pointer-events-none` (via a Tailwind
  transition) to the top bar and seek bar wrappers. It resets to `false` immediately
  whenever `isWalkthrough` goes false, so exiting never leaves the UI stuck faded.
- **Swap-in-place, not stack**: the bottom UI slot uses two absolutely-positioned children
  in the same relatively-positioned container (room navigator + seek bar), each
  opacity/translate-toggled opposite to the other based on `isWalkthrough`, so one visually
  slides/fades out exactly as the other fades/slides in, rather than the layout jumping.

---

## 4. Integration checklist for the real product

- [ ] Add `walkthroughVideoUrl?: string` (or equivalent) to the room/variant data model.
- [ ] Confirm video hosting/CDN and format (`.mp4`, H.264, is what this was built/tested
      against — re-validate against whatever the real product's asset pipeline produces).
- [ ] Re-implement the 5 pieces above against the real product's component/state
      conventions (this may not be React+GSAP — treat the *behavior spec* in §1 and the
      *sequencing logic* in each snippet's comments as the source of truth, not the exact
      code).
- [ ] Re-skin all chrome (button, seek bar) to the real product's design system — colors,
      radii, icons here are this prototype's, not canon.
- [ ] Decide whether the real product wants the "always restart at 0" behavior, or should
      resume progress — this prototype has an explicit instruction to reset
      `currentTime`/`playbackRate` on every activation; that's a product decision, not a
      technical constraint.
- [ ] If the real product needs analytics (e.g. "% of walkthrough watched"), hook into
      `onProgress` — it already fires `{currentTime, duration}` every frame; no additional
      video event wiring needed.
- [ ] QA the crossfade specifically on a throttled/slow connection — the whole point of the
      `readyState`/`playing`-gated fade-in (§3.1) is to avoid stutter when the video hasn't
      buffered yet. If re-implemented without that gate, the stutter will likely reappear.

---

## 5. Known limitations (carry over the decision, or explicitly revisit it)

- Single video per room variant — no per-hotspot or multi-clip walkthrough support.
- No captions/subtitles track.
- No "resume where I left off."
- Autoplay-blocked browsers fall back to a muted autoplay retry, not a play button —
  if the real product's browser support matrix cares about this, test it explicitly.
