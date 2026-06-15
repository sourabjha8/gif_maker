'use client';

import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import type { Marker } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import type { Hotspot } from '../../types';

interface TourViewerProps {
  panoramaUrl: string;
  roomSlug?: string;
  hotspots?: Hotspot[];
  onReady?: () => void;
  onError?: (err: Error) => void;
  onHotspotSelect?: (hotspotId: string) => void;
}


function hotspotsToMarkers(hotspots: Hotspot[]) {
  return hotspots.map((h) => ({
    id: h.id,
    position: { yaw: (h.yaw * Math.PI) / 180, pitch: (h.pitch * Math.PI) / 180 },
    html: `
      <button
        type="button"
        aria-label="${h.label.replace(/"/g, '&quot;')}"
        class="psv-hotspot psv-hotspot-${h.type} psv-marker-hotspot"
        style="
          width: 48px; height: 48px; min-width: 44px; min-height: 44px;
          border-radius: 9999px;
          background: rgba(23,168,229,0.18);
          border: 1.5px solid rgba(23,168,229,0.85);
          backdrop-filter: blur(8px);
          color: white; font-size: 12px; font-weight: 600;
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 0 0 6px rgba(23,168,229,0.12), 0 6px 16px rgba(0,0,0,0.32);
          cursor: pointer;
          animation: ambient-pulse 2.4s ease-in-out infinite;
        "
      >
        <span style="width:10px;height:10px;border-radius:9999px;background:#17A8E5;display:block;"></span>
      </button>
    `,
    anchor: 'center center',
    tooltip: { content: h.label, position: 'top' },
    data: { hotspotId: h.id },
  }));
}

/** Bullseye markers scattered around the room for layout preview. */
const BULLSEYE_MARKER_HTML = `
  <button
    type="button"
    aria-label="Element marker"
    class="psv-marker-hotspot"
    style="
      width: 44px; height: 44px;
      border-radius: 9999px;
      background: rgba(23, 168, 229, 0.22);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      border: none; padding: 0;
      animation: scatter-pulse 2.6s ease-in-out infinite;
    "
  >
    <span style="
      width: 10px; height: 10px;
      border-radius: 9999px;
      background: #17A8E5;
      display: block;
      animation: scatter-dot-pulse 2.6s ease-in-out infinite;
    "></span>
  </button>
`;

const SCATTER_POSITIONS = [
  { yaw:   0,   pitch:  0   },
  { yaw:  45,   pitch: -10  },
  { yaw: -60,   pitch:   5  },
  { yaw: 120,   pitch: -15  },
  { yaw: -150,  pitch:  10  },
  { yaw: 200,   pitch:  -5  },
  { yaw: -90,   pitch:   0  },
];

function makeScatterMarkers(roomSlug: string) {
  return SCATTER_POSITIONS.map((pos, i) => ({
    id: `${roomSlug}__element_${i + 1}`,
    position: { yaw: (pos.yaw * Math.PI) / 180, pitch: (pos.pitch * Math.PI) / 180 },
    html: BULLSEYE_MARKER_HTML,
    anchor: 'center center',
    data: { isScatter: true, roomSlug },
  }));
}

const BEDROOM_TV_LAYER = {
  id: 'bedroom__tv-layer',
  imageLayer: '/assets/images/background.png',
  position: { yaw: (-112 * Math.PI) / 180, pitch: (5 * Math.PI) / 180 },
  size: { width: 320, height: 190 },
};

function makeRoomLayers(roomSlug: string) {
  if (roomSlug === 'bedroom') return [BEDROOM_TV_LAYER];
  return [];
}

export function TourViewer({
  panoramaUrl,
  roomSlug = 'room',
  hotspots = [],
  onReady,
  onError,
  onHotspotSelect,
}: TourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersPluginRef = useRef<MarkersPlugin | null>(null);
  const hotspotSelectRef = useRef(onHotspotSelect);
  hotspotSelectRef.current = onHotspotSelect;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  // Track which panorama the viewer was instantiated with so the
  // panorama-swap effect doesn't redundantly call setPanorama on mount
  // (which cancels the original in-flight texture load — visible as a
  // perpetual "Loading Environment..." overlay in dev / strict mode).
  const initialPanoramaRef = useRef<string>(panoramaUrl);

  // Initialize viewer once. Subsequent panorama or hotspot changes are handled in separate effects.
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    try {
      const viewer = new Viewer({
        container: containerRef.current,
        panorama: panoramaUrl,
        navbar: false,
        defaultYaw: 0,
        defaultPitch: 0,
        defaultTransition: { speed: '2rpm', rotation: true, effect: 'fade' },
        plugins: [[MarkersPlugin, { markers: [...hotspotsToMarkers(hotspots), ...makeScatterMarkers(roomSlug), ...makeRoomLayers(roomSlug)] }]],
      });
      viewerRef.current = viewer;
      markersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;

      viewer.addEventListener('ready', () => {
        if (!destroyed) onReady?.();
      }, { once: true });

      markersPluginRef.current?.addEventListener('select-marker', ({ marker }: { marker: Marker }) => {
        const id = (marker.data as { hotspotId?: string } | undefined)?.hotspotId ?? marker.id;
        hotspotSelectRef.current?.(id);
      });
    } catch (err) {
      if (err instanceof Error) onError?.(err);
    }

    return () => {
      destroyed = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      markersPluginRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap panorama without rebuilding viewer. Skip the call if the URL is the
  // same one the viewer was created with — calling setPanorama with the same
  // URL during the initial texture load cancels it.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (panoramaUrl === initialPanoramaRef.current) return;
    initialPanoramaRef.current = panoramaUrl;
    viewer.setPanorama(panoramaUrl, { transition: true, showLoader: false })
      .then(() => { onReadyRef.current?.(); })
      .catch((err: unknown) => {
        if (err instanceof Error) onError?.(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panoramaUrl]);

  // Keyboard pan: arrow keys rotate the viewer smoothly via a rAF loop.
  useEffect(() => {
    const SPEED = 0.01; // radians per frame (~0.57° at 60 fps)
    const held = new Set<string>();
    let rafId: number;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        held.add(e.key);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => held.delete(e.key);

    const tick = () => {
      const viewer = viewerRef.current;
      if (viewer && held.size > 0) {
        const { yaw, pitch } = viewer.getPosition();
        viewer.rotate({
          yaw: yaw + (held.has('ArrowRight') ? SPEED : 0) - (held.has('ArrowLeft') ? SPEED : 0),
          pitch: pitch + (held.has('ArrowUp') ? SPEED : 0) - (held.has('ArrowDown') ? SPEED : 0),
        });
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Update markers when hotspot list changes.
  useEffect(() => {
    const plugin = markersPluginRef.current;
    if (!plugin) return;
    plugin.setMarkers([...hotspotsToMarkers(hotspots), ...makeScatterMarkers(roomSlug)]);
  }, [hotspots]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
    />
  );
}
