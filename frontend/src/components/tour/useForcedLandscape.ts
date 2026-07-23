'use client';

import { useEffect, useState } from 'react';

// Phones only: a portrait, phone-width, touch viewport. Tablets in portrait
// and narrow desktop windows are intentionally excluded, so the web view is
// unaffected.
const PHONE_PORTRAIT_MQ =
  '(orientation: portrait) and (max-width: 640px) and (pointer: coarse)';

/**
 * True when the tour should force itself into landscape — i.e. the device is a
 * phone held in portrait. The tour is then CSS-rotated 90° to fill the screen
 * in landscape without asking the user to physically rotate; native landscape
 * needs no rotation and returns false.
 */
export function useForcedLandscape(): boolean {
  const [rotated, setRotated] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_PORTRAIT_MQ);
    const update = () => setRotated(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return rotated;
}

/**
 * Maps a PHYSICAL viewport point to the viewer's LOCAL (un-rotated) frame —
 * the exact inverse of the tour's `rotate(-90deg)` transform (origin top-left,
 * container offset to `top: 100dvh`). Verified by direct corner-mapping: the
 * container's local top-right corner lands at the physical top-left, and its
 * local bottom-left corner lands at the physical bottom-right, which is what
 * this inverse reproduces.
 */
function toLocalPoint(clientX: number, clientY: number) {
  return { x: window.innerHeight - clientY, y: clientX };
}

const MOUSE_TYPES = ['mousedown', 'mousemove', 'mouseup'] as const;
const TOUCH_TYPES = ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const;

const REMAPPED_FLAG = '__vxpRemapped';

/**
 * Remaps pointer/touch coordinates for the Photo Sphere Viewer while the tour
 * is force-rotated on a portrait phone.
 *
 * The viewer pans and hit-tests from raw `clientX/clientY`, which are always
 * reported in the *physical* portrait frame — so under the rotation a
 * horizontal swipe would pan the panorama vertically and vice versa.
 *
 * Overriding `clientX/clientY` via `Object.defineProperty` on the original
 * event looks like the obvious fix, but native `Touch` instances are
 * non-configurable in several mobile browser engines, so that override
 * silently fails on real phones (the exact symptom reported: axes swapped,
 * as if no correction were applied at all). Instead, this intercepts the
 * event in a `window` capture listener — which always runs before PSV's own
 * listener on the container, since capture flows outside-in — stops it from
 * reaching PSV, and dispatches a *freshly constructed* replacement event with
 * the corrected coordinates baked in via the constructor. Building a new
 * event is always reliable (no property to redefine), unlike patching one.
 *
 * The replacement is tagged and re-checked so it isn't caught and remapped
 * again as it re-propagates from `dispatchEvent`. Only events aimed at the
 * viewer (`[data-psv-root]`) are touched, so the surrounding chrome (buttons,
 * sliders, sheets) keeps its native coordinates untouched.
 */
export function usePanoramaPointerRemap(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const isInViewer = (target: EventTarget | null): target is Element =>
      target instanceof Element && !!target.closest('[data-psv-root]');

    const onMouse = (e: MouseEvent) => {
      if (REMAPPED_FLAG in e) return;
      if (!isInViewer(e.target)) return;

      e.stopPropagation();
      e.preventDefault();
      const { x, y } = toLocalPoint(e.clientX, e.clientY);
      const clone = new MouseEvent(e.type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        button: e.button,
        buttons: e.buttons,
      });
      Object.defineProperty(clone, REMAPPED_FLAG, { value: true });
      e.target?.dispatchEvent(clone);
    };

    const remapTouchList = (list: TouchList) =>
      Array.from(list).map((t) => {
        const { x, y } = toLocalPoint(t.clientX, t.clientY);
        return new Touch({
          identifier: t.identifier,
          target: t.target,
          clientX: x,
          clientY: y,
          screenX: x,
          screenY: y,
          pageX: x,
          pageY: y,
          radiusX: t.radiusX,
          radiusY: t.radiusY,
          rotationAngle: t.rotationAngle,
          force: t.force,
        });
      });

    const onTouch = (e: TouchEvent) => {
      if (REMAPPED_FLAG in e) return;
      if (!isInViewer(e.target)) return;

      e.stopPropagation();
      e.preventDefault();
      const clone = new TouchEvent(e.type, {
        bubbles: true,
        cancelable: true,
        touches: remapTouchList(e.touches),
        targetTouches: remapTouchList(e.targetTouches),
        changedTouches: remapTouchList(e.changedTouches),
      });
      Object.defineProperty(clone, REMAPPED_FLAG, { value: true });
      e.target?.dispatchEvent(clone);
    };

    // Capture + non-passive: capture guarantees this fires before PSV's own
    // container-level listener; non-passive is required to call
    // preventDefault on the original (native scroll/zoom prevention still
    // comes from the viewer's own `touch-action: none`, independent of JS).
    const opts: AddEventListenerOptions = { capture: true, passive: false };
    for (const t of MOUSE_TYPES) window.addEventListener(t, onMouse as EventListener, opts);
    for (const t of TOUCH_TYPES) window.addEventListener(t, onTouch as EventListener, opts);
    return () => {
      for (const t of MOUSE_TYPES) window.removeEventListener(t, onMouse as EventListener, opts);
      for (const t of TOUCH_TYPES) window.removeEventListener(t, onTouch as EventListener, opts);
    };
  }, [active]);
}
