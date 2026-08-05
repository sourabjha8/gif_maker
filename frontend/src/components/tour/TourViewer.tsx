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
  /** Receives the live Viewer instance on init (and null on teardown). */
  onViewerReady?: (viewer: Viewer | null) => void;
}


/** Bullseye marker visual — used for every product/module/info/video hotspot. */
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

/** Escapes text dropped into a marker's inner HTML string (content-sourced, but kept safe). */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Room-change portal — an upright labeled marker anchored at a doorway/opening.
 * Position says "exit here" before the label is read; the chevron says "through".
 */
function portalMarkerHtml(label: string): string {
  return `
    <button type="button" aria-label="Go to ${escapeHtml(label)}" class="psv-marker-portal">
      <span class="psv-marker-portal__plate">
        <span class="psv-marker-portal__label">${escapeHtml(label)}</span>
        <svg class="psv-marker-portal__chev" viewBox="0 0 24 24" width="14" height="14">
          <polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="psv-marker-portal__stem"></span>
      <span class="psv-marker-portal__base"></span>
    </button>
  `;
}

/**
 * Reposition node — a flat disc lying on the floor plane, rendered as a
 * perspective ellipse (not a camera-facing circle) so it reads as painted on
 * the floor rather than a floating UI dot. Jump-able only: clicking it pans
 * the camera toward its target angle, it never changes room/panorama.
 */
const REPOSITION_MARKER_HTML = `
  <button type="button" aria-label="Look this way" class="psv-marker-reposition">
    <span class="psv-marker-reposition__ring"></span>
    <span class="psv-marker-reposition__core"></span>
  </button>
`;

/**
 * View-angle marker — a solid numbered badge (same footprint as the bullseye
 * hotspot). Numbered rather than iconed so multiple view-angle points in the
 * same room stay distinguishable. Not wired to any behavior yet — purely a
 * visual placeholder for the eventual "change viewing angle" feature.
 */
function viewAngleMarkerHtml(number: number): string {
  return `
    <button type="button" aria-label="Change viewing angle ${number}" class="psv-marker-view-angle">
      <span class="psv-marker-view-angle__number">${number}</span>
    </button>
  `;
}

function makeHotspotMarkers(hotspots: Hotspot[]) {
  let viewAngleCount = 0;
  return hotspots.map((h) => {
    const position = { yaw: (h.yaw * Math.PI) / 180, pitch: (h.pitch * Math.PI) / 180 };
    const data = {
      hotspotId: h.id,
      hotspotType: h.type,
      targetRoomSlug: h.targetRoomSlug,
      targetYaw: h.targetYaw,
      targetPitch: h.targetPitch,
    };

    if (h.type === 'room-portal') {
      return {
        id: h.id,
        position,
        html: portalMarkerHtml(h.label),
        anchor: 'bottom center' as const,
        data,
      };
    }

    if (h.type === 'reposition') {
      return {
        id: h.id,
        position,
        html: REPOSITION_MARKER_HTML,
        anchor: 'center center' as const,
        tooltip: { content: h.label, position: 'top' as const },
        data,
      };
    }

    if (h.type === 'view-angle') {
      viewAngleCount += 1;
      return {
        id: h.id,
        position,
        html: viewAngleMarkerHtml(viewAngleCount),
        anchor: 'center center' as const,
        data,
      };
    }

    return {
      id: h.id,
      position,
      html: BULLSEYE_MARKER_HTML,
      anchor: 'center center' as const,
      tooltip: { content: h.label, position: 'top' as const },
      data,
    };
  });
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
  onViewerReady,
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
        plugins: [[MarkersPlugin, { markers: [...makeHotspotMarkers(hotspots), ...makeRoomLayers(roomSlug)] }]],
      });
      viewerRef.current = viewer;
      markersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;
      onViewerReady?.(viewer);

      viewer.addEventListener('ready', () => {
        if (!destroyed) onReady?.();
      }, { once: true });

      markersPluginRef.current?.addEventListener('select-marker', ({ marker }: { marker: Marker }) => {
        const data = marker.data as
          | { hotspotId?: string; hotspotType?: Hotspot['type']; targetYaw?: number; targetPitch?: number }
          | undefined;
        const id = data?.hotspotId ?? marker.id;
        // The hover tooltip otherwise lingers after a click, since the
        // cursor is still resting on the marker when the snippet opens.
        markersPluginRef.current?.hideMarkerTooltip(marker.id);

        // Reposition markers only change the camera angle — handled entirely
        // here, never bubbled up (no room/hotspot-panel state to update).
        if (data?.hotspotType === 'reposition' && typeof data.targetYaw === 'number' && typeof data.targetPitch === 'number') {
          viewerRef.current?.animate({
            yaw: (data.targetYaw * Math.PI) / 180,
            pitch: (data.targetPitch * Math.PI) / 180,
            speed: '600ms',
          });
          return;
        }

        // View-angle badges are a visual placeholder only — no behavior yet.
        if (data?.hotspotType === 'view-angle') return;

        hotspotSelectRef.current?.(id);
      });
    } catch (err) {
      if (err instanceof Error) onError?.(err);
    }

    return () => {
      destroyed = true;
      onViewerReady?.(null);
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
    plugin.setMarkers(makeHotspotMarkers(hotspots));
  }, [hotspots]);

  return (
    <div
      ref={containerRef}
      data-psv-root
      className="absolute inset-0 w-full h-full pointer-events-auto"
    />
  );
}
