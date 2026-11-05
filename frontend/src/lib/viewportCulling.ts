export interface WorldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Camera {
  x: number;
  y: number;
}

/**
 * Whether a world-space rect projects into the visible viewport (screen space),
 * given the current camera pan/zoom. `marginX`/`marginY` extend the viewport
 * bounds so content just outside view is still rendered — avoids frames
 * vanishing mid-pan (a single continuous drag gesture is bounded by physical
 * monitor width, not viewport width, so a narrower viewport next to wide side
 * panels needs more than 1x overscan on a wide monitor). Default is two full
 * viewports' worth of overscan in each direction.
 */
export function isRectInViewport(
  worldRect: WorldRect,
  camera: Camera,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
  marginX: number = viewportWidth * 2,
  marginY: number = viewportHeight * 2
): boolean {
  const screenX = worldRect.x * zoom + camera.x;
  const screenY = worldRect.y * zoom + camera.y;
  const screenWidth = worldRect.width * zoom;
  const screenHeight = worldRect.height * zoom;

  return (
    screenX + screenWidth >= -marginX &&
    screenX <= viewportWidth + marginX &&
    screenY + screenHeight >= -marginY &&
    screenY <= viewportHeight + marginY
  );
}
