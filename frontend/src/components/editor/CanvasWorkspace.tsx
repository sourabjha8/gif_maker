import type React from 'react';
import { useMemo } from 'react';
import type { Frame } from '../../types/frame';
import { isRectInViewport } from '../../lib/viewportCulling';
import { FrameCanvas } from './FrameCanvas';
import { ZoomControl } from './ZoomControl';

// Culling only pays off once there are enough frames that skipping their layout/paint
// actually saves work. Below this count, a single fast drag can still out-pace any
// viewport-relative margin (e.g. dragging across a wide monitor in one gesture), so we
// just render everything and skip the risk entirely.
const CULLING_FRAME_THRESHOLD = 40;

interface CanvasWorkspaceProps {
  frames: Frame[];
  selectedFrameId: string | null;
  activeTool: 'move' | 'frame';
  camera: { x: number; y: number };
  zoom: number;
  setZoom: (updater: (z: number) => number) => void;
  isPanning: boolean;
  isSpacePressed: boolean;
  viewportSize: { width: number; height: number };
  draggingFrameId: string | null;
  draggingSliderFrameId: string | null;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onFramePointerDown: (frame: Frame, e: React.PointerEvent) => void;
  onFocusFrame: (frameId: string) => void;
  onSliderPointerDown: (frameId: string, e: React.PointerEvent) => void;
}

export function CanvasWorkspace({
  frames,
  selectedFrameId,
  activeTool,
  camera,
  zoom,
  setZoom,
  isPanning,
  isSpacePressed,
  viewportSize,
  draggingFrameId,
  draggingSliderFrameId,
  workspaceRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onFramePointerDown,
  onFocusFrame,
  onSliderPointerDown,
}: CanvasWorkspaceProps) {
  // Only mount frames whose screen-space bounds could intersect the viewport —
  // skips layout/paint work for content panned far off-screen. Skipped entirely
  // below CULLING_FRAME_THRESHOLD (see comment above).
  const visibleFrames = useMemo(
    () =>
      frames.length <= CULLING_FRAME_THRESHOLD
        ? frames
        : frames.filter((frame) =>
            isRectInViewport(frame, camera, zoom, viewportSize.width, viewportSize.height)
          ),
    [frames, camera, zoom, viewportSize.width, viewportSize.height]
  );

  return (
    <div
      className={`flex-1 flex flex-col w-full h-full relative overflow-hidden text-sm ${isPanning ? 'cursor-grabbing' : isSpacePressed || activeTool === 'move' ? 'cursor-grab' : 'cursor-default'}`}
      style={{
        backgroundColor: '#090909',
        backgroundImage: 'radial-gradient(#262626 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${camera.x}px ${camera.y}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={workspaceRef} className="flex-1 w-full h-full relative z-0">
        {/* Transform Layer (Camera) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 150ms ease-out',
            // Hints the browser to promote this single layer to its own compositor
            // layer ahead of time, so the very first pan/zoom isn't the one that
            // pays for layer creation. Scoped to just this element (not per-frame)
            // to avoid over-promoting many layers, which costs GPU memory.
            willChange: 'transform',
          }}
        >
          <div className="absolute inset-0 pointer-events-auto">
            {/* Axis Guides (0,0 indicators) */}
            <div className="absolute top-0 bottom-0 left-0 w-px bg-[#0099ff]/10 z-0" />
            <div className="absolute left-0 right-0 top-0 h-px bg-[#0099ff]/10 z-0" />

            {visibleFrames.map((frame) => (
              <FrameCanvas
                key={frame.id}
                frame={frame}
                isSelected={selectedFrameId === frame.id}
                activeTool={activeTool}
                isDraggingFrame={draggingFrameId === frame.id}
                isDraggingSlider={draggingSliderFrameId === frame.id}
                onFramePointerDown={onFramePointerDown}
                onFocus={onFocusFrame}
                onSliderPointerDown={onSliderPointerDown}
              />
            ))}
          </div>
        </div>

        {/* Visual Zoom Indicator (HUD Layer) */}
        <ZoomControl zoom={zoom} setZoom={setZoom} />
      </div>
    </div>
  );
}
