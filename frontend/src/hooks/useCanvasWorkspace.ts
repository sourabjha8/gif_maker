import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Frame } from '../types/frame';
import { createRafBatcher } from '../lib/rafBatcher';

const BOUNDARY = 5000;

const getDampenedDelta = (current: number, delta: number, zoomValue: number, limit: number, dimension: number) => {
  const screenCenter = dimension / 2;
  const canvasPos = (screenCenter - current) / zoomValue;
  const isMovingOut = Math.abs((screenCenter - (current + delta)) / zoomValue) > Math.abs(canvasPos);

  if (Math.abs(canvasPos) > limit && isMovingOut) {
    const over = Math.abs(canvasPos) - limit;
    const factor = Math.max(0.05, 1 / (1 + over / 150));
    return delta * factor;
  }
  return delta;
};

export function useCanvasWorkspace(
  frames: Frame[],
  setFrames: React.Dispatch<React.SetStateAction<Frame[]>>,
  selectedFrameId: string | null,
  setSelectedFrameId: (id: string | null) => void,
  activeTool: 'move' | 'frame'
) {
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const [draggingFrameId, setDraggingFrameId] = useState<string | null>(null);
  const [draggingSliderFrameId, setDraggingSliderFrameId] = useState<string | null>(null);
  const frameStartPos = useRef({ x: 0, y: 0 });
  const lastPanPos = useRef({ x: 0, y: 0 });

  const workspaceRef = useRef<HTMLDivElement>(null);

  const beginFrameDrag = (frame: Frame, e: React.PointerEvent) => {
    e.stopPropagation();
    // Keep receiving pointermove/pointerup for this pointer even if the cursor
    // leaves the frame's bounds mid-drag (fast drags, dragging off-screen, etc.).
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedFrameId(frame.id);
    setDraggingFrameId(frame.id);
    lastPanPos.current = { x: e.clientX, y: e.clientY };
    frameStartPos.current = { x: frame.x, y: frame.y };
  };

  const beginSliderDrag = (frameId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingSliderFrameId(frameId);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle mouse button (button 1) OR Space + Left click OR plain Left click on empty canvas in the move tool
    if (e.button === 1 || (e.button === 0 && (isSpacePressed || activeTool === 'move'))) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      if (e.button === 0) {
        // Clicked outside frames (since frames stop propagation)
        setSelectedFrameId(null);
      }
    } else if (e.button === 0) {
      setSelectedFrameId(null);
    }
  };

  // The actual pan/frame-drag/slider-drag math, run at most once per animation frame
  // (see the batcher below) instead of once per native pointermove event.
  const processPointerMove = (clientX: number, clientY: number) => {
    if (isPanning) {
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!rect) return;

      const rawDx = clientX - lastPanPos.current.x;
      const rawDy = clientY - lastPanPos.current.y;

      const dx = getDampenedDelta(camera.x, rawDx, zoom, BOUNDARY, rect.width);
      const dy = getDampenedDelta(camera.y, rawDy, zoom, BOUNDARY, rect.height);

      setCamera((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPanPos.current = { x: clientX, y: clientY };
    } else if (draggingFrameId) {
      const dx = (clientX - lastPanPos.current.x) / zoom;
      const dy = (clientY - lastPanPos.current.y) / zoom;

      setFrames((prev) =>
        prev.map((f) =>
          f.id === draggingFrameId
            ? { ...f, x: frameStartPos.current.x + dx, y: frameStartPos.current.y + dy }
            : f
        )
      );
    } else if (draggingSliderFrameId) {
      const frame = frames.find((f) => f.id === draggingSliderFrameId);
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (frame && rect) {
        const direction = frame.sliderDirection || 'ltr';
        const isHorizontal = direction === 'ltr' || direction === 'rtl';

        let newPercentage = 50;

        if (isHorizontal) {
          const screenX = clientX - rect.left;
          const worldX = (screenX - camera.x) / zoom;
          const frameCursorX = worldX - frame.x;
          newPercentage = (frameCursorX / frame.width) * 100;
          if (direction === 'rtl') newPercentage = 100 - newPercentage;
        } else {
          const screenY = clientY - rect.top;
          const worldY = (screenY - camera.y) / zoom;
          const frameCursorY = worldY - frame.y;
          newPercentage = (frameCursorY / frame.height) * 100;
          if (direction === 'btt') newPercentage = 100 - newPercentage;
        }

        newPercentage = Math.max(0, Math.min(100, newPercentage));

        setFrames((prev) =>
          prev.map((f) => (f.id === draggingSliderFrameId ? { ...f, sliderPosition: newPercentage } : f))
        );
      }
    }
  };

  // Created once (lazy ref init); its process callback is kept in sync with the latest
  // render's closure via setProcess below, so the batcher itself never goes stale.
  const moveBatcherRef = useRef<ReturnType<typeof createRafBatcher<{ clientX: number; clientY: number }>> | null>(
    null
  );
  if (moveBatcherRef.current === null) {
    moveBatcherRef.current = createRafBatcher<{ clientX: number; clientY: number }>(() => {});
  }

  useEffect(() => {
    moveBatcherRef.current?.setProcess((pos) => processPointerMove(pos.clientX, pos.clientY));
  });

  useEffect(() => {
    return () => moveBatcherRef.current?.cancel();
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    moveBatcherRef.current?.schedule({ clientX: e.clientX, clientY: e.clientY });
  };

  // Shared by pointerup and pointercancel — a captured pointer always ends the drag,
  // whether released normally or interrupted by the OS/browser (palm rejection, etc.).
  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggingFrameId(null);
    setDraggingSliderFrameId(null);
  };

  const handleFocusFrame = (frameIdToFocus?: string) => {
    const targetId = frameIdToFocus || selectedFrameId;
    if (!targetId) return;

    const frame = frames.find((f) => f.id === targetId);
    if (!frame) return;

    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate frame center in world space
    const frameCenterX = frame.x + frame.width / 2;
    const frameCenterY = frame.y + frame.height / 2;

    // Target Zoom clamp 50-150% (fit within 80% of workspace)
    const scaleToFitWidth = (rect.width * 0.8) / frame.width;
    const scaleToFitHeight = (rect.height * 0.8) / frame.height;
    let targetZoom = Math.min(scaleToFitWidth, scaleToFitHeight);
    targetZoom = Math.min(Math.max(targetZoom, 0.5), 1.5);

    // Target Camera Offset
    const targetCameraX = -(frameCenterX * targetZoom) + rect.width / 2;
    const targetCameraY = -(frameCenterY * targetZoom) + rect.height / 2;

    // Animation via requestAnimationFrame
    const startZoom = zoom;
    const startCamera = { ...camera };
    const startTime = performance.now();
    const duration = 400; // ms

    const animate = (time: number) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;

      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);

      setZoom(startZoom + (targetZoom - startZoom) * ease);
      setCamera({
        x: startCamera.x + (targetCameraX - startCamera.x) * ease,
        y: startCamera.y + (targetCameraY - startCamera.y) * ease,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  // Center camera on mount
  useEffect(() => {
    if (workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect();
      // Center (0,0) exactly in the visible workspace
      setCamera({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }
  }, []);

  // Track viewport size for viewport culling (only render frames that could be visible).
  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: rect.width, height: rect.height });
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Wheel zoom / pan
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey) {
        // --- ZOOM (Centered on cursor) ---
        const zoomIntensity = 0.0015;
        const factor = Math.exp(-e.deltaY * zoomIntensity);

        const rect = workspaceRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        setZoom((prevZoom) => {
          const nextZoom = Math.min(Math.max(prevZoom * factor, 0.25), 3.0);

          // Calculate new offset to keep cursor point fixed
          // NewOffset = Cursor - (Cursor - OldOffset) * (NextZoom / OldZoom)
          setCamera((prevCam) => ({
            x: cursorX - (cursorX - prevCam.x) * (nextZoom / prevZoom),
            y: cursorY - (cursorY - prevCam.y) * (nextZoom / prevZoom),
          }));

          return nextZoom;
        });
      } else {
        // --- PANNING (Trackpad two-finger) ---
        const rect = workspaceRef.current?.getBoundingClientRect();
        if (!rect) return;

        const dx = getDampenedDelta(camera.x, -e.deltaX, zoom, BOUNDARY, rect.width);
        const dy = getDampenedDelta(camera.y, -e.deltaY, zoom, BOUNDARY, rect.height);

        setCamera((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      }
    };

    const container = workspaceRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoom, camera.x, camera.y]);

  // Space bar toggles pan cursor / enables left-click panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '') ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  return {
    camera,
    zoom,
    setZoom,
    isPanning,
    isSpacePressed,
    viewportSize,
    workspaceRef,
    draggingFrameId,
    draggingSliderFrameId,
    beginFrameDrag,
    beginSliderDrag,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleFocusFrame,
  };
}
