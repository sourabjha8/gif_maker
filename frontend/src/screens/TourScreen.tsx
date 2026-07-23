'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// @ts-ignore - next/dynamic is available at runtime in the Next.js app
import dynamic from 'next/dynamic';
import {
  LoadingOverlay,
  AlertBox,
  HotspotSnippet,
  VideoModal,
  EstimateSidebar,
  ViewerIconDock,
  GalleryModal,
  VisualizeStylesModal,
  RoomsMenu,
  RoomInfoPanel,
  RoomNavigator,
  RoomMinimap,
  TourTopBar,
  RoomBrowserPanel,
  WalkthroughVideo,
  WalkthroughSeekBar,
} from '../components';
import {
  loadContent,
  findCity,
  findProject,
  findRoom,
  findBestVariant,
} from '../lib/content';
import type {
  ContentProject,
  ContentRoom,
  Hotspot,
  MediaAsset,
  PricingResponse,
  RoomVariant,
} from '../types';
import type { Viewer } from '@photo-sphere-viewer/core';
import { useEstimateStore } from '../lib/estimate';
import { getPricingAdapter } from '../lib/pricing/factory';
import { normalizeFromResponse } from '../lib/pricing/format';
import { useForcedLandscape, usePanoramaPointerRemap } from '../components/tour/useForcedLandscape';

// Photo Sphere Viewer needs window/WebGL — only load on the client.
const TourViewer = dynamic(
  () => import('../components/tour/TourViewer').then((mod) => mod.TourViewer),
  {
    ssr: false,
    loading: () => <LoadingOverlay isVisible={true} message="Loading Viewer..." />,
  },
);

export interface TourScreenProps {
  onBack?: () => void;
  onOpenEstimate?: () => void;
  citySlug?: string;
  projectSlug?: string;
  roomSlug?: string;
  roomFilters?: Record<string, string>;
}

interface ResolvedTour {
  project: ContentProject;
  room: ContentRoom;
  variant: RoomVariant;
}

export const TourScreen: React.FC<TourScreenProps> = ({
  onBack,
  onOpenEstimate,
  citySlug = 'mumbai',
  projectSlug = 'seabreeze-residences',
  roomSlug: initialRoomSlug = 'living-room',
  roomFilters,
}) => {
  const [roomSlug, setRoomSlug] = useState(initialRoomSlug);
  // On a portrait phone the whole tour is CSS-rotated into landscape; the
  // pointer remap keeps the panorama's drag/hit-testing correct under it.
  const isForcedLandscape = useForcedLandscape();
  usePanoramaPointerRemap(isForcedLandscape);
  // Live Photo Sphere Viewer instance — used to anchor the hotspot snippet to
  // its marker on screen.
  const psvViewerRef = useRef<Viewer | null>(null);
  const [resolved, setResolved] = useState<ResolvedTour | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isViewerReady, setIsViewerReady] = useState(false);

  // Hotspot panel
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [pricingByHotspot, setPricingByHotspot] = useState<Record<string, PricingResponse>>({});
  const [pricingLoading, setPricingLoading] = useState<Record<string, boolean>>({});

  // Video modal
  const [activeVideo, setActiveVideo] = useState<MediaAsset | null>(null);

  // New on-screen feature state.
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isVisualizeOpen, setIsVisualizeOpen] = useState(false);
  const [isRoomsMenuOpen, setIsRoomsMenuOpen] = useState(false);
  const [roomBrowserMode, setRoomBrowserMode] = useState<'closed' | 'list' | 'catalog'>('closed');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // Walkthrough video transition.
  const [isWalkthrough, setIsWalkthrough] = useState(false);
  const walkthroughVideoRef = useRef<HTMLVideoElement>(null);
  const [walkthroughProgress, setWalkthroughProgress] = useState({ currentTime: 0, duration: 0 });
  // Chrome auto-hides 3s into an idle walkthrough so the video gets full focus,
  // and returns instantly on the next cursor/touch/key movement.
  const [isChromeIdle, setIsChromeIdle] = useState(false);
  // Estimate store hooks.
  const addItem = useEstimateStore((s) => s.addItem);
  const removeItem = useEstimateStore((s) => s.removeItem);
  const openEstimate = useEstimateStore((s) => s.open);
  const items = useEstimateStore((s) => s.items);
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const itemIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  // Resolve tour content from slugs.
  useEffect(() => {
    try {
      const content = loadContent();
      const floor = content.floors[0];
      if (!floor) throw new Error('No floor found in content');

      const city = findCity(floor, citySlug);
      if (!city) throw new Error(`City '${citySlug}' not found`);

      const project = findProject(city, projectSlug);
      if (!project) throw new Error(`Project '${projectSlug}' not found`);

      const room = findRoom(project, roomSlug);
      if (!room) throw new Error(`Room '${roomSlug}' not found`);

      const variant = findBestVariant(room, roomFilters);
      if (!variant) throw new Error(`No variant available for room '${roomSlug}'`);

      setResolved({ project, room, variant });
      setError(null);
      setActiveHotspotId(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown tour error'));
      setResolved(null);
    }
  }, [citySlug, projectSlug, roomSlug, roomFilters]);

  // Active hotspot resolution.
  const activeHotspot: Hotspot | null = useMemo(() => {
    if (!resolved || !activeHotspotId) return null;
    return resolved.variant.hotspots.find((h) => h.id === activeHotspotId) ?? null;
  }, [resolved, activeHotspotId]);

  const activeVideoMedia: MediaAsset | undefined = useMemo(() => {
    if (!resolved || !activeHotspot?.videoRef) return undefined;
    return resolved.variant.media?.find((m) => m.id === activeHotspot.videoRef);
  }, [resolved, activeHotspot]);

  // Fetch pricing for a hotspot lazily.
  const fetchPricingFor = useCallback(
    async (hotspot: Hotspot) => {
      if (!hotspot.pricingRef) return;
      if (pricingByHotspot[hotspot.id]) return;
      if (pricingLoading[hotspot.id]) return;

      setPricingLoading((prev) => ({ ...prev, [hotspot.id]: true }));
      try {
        const adapter = getPricingAdapter();
        const response = await adapter.getModulePricing({
          pricingRef: hotspot.pricingRef,
          citySlug,
          projectSlug,
          roomSlug,
          variantSlug: resolved?.variant.slug,
        });
        setPricingByHotspot((prev) => ({ ...prev, [hotspot.id]: response }));
      } catch (err) {
        // Pricing outage must never crash the tour.
        setPricingByHotspot((prev) => ({
          ...prev,
          [hotspot.id]: {
            status: 'unavailable',
            currency: 'INR',
            label: hotspot.pricingRef!.code,
            rows: [],
            subtotalMinor: 0,
            totalMinor: 0,
            message: err instanceof Error ? err.message : 'Pricing unavailable',
          },
        }));
      } finally {
        setPricingLoading((prev) => ({ ...prev, [hotspot.id]: false }));
      }
    },
    [pricingByHotspot, pricingLoading, citySlug, projectSlug, roomSlug, resolved],
  );

  useEffect(() => {
    if (activeHotspot && activeHotspot.pricingRef) {
      fetchPricingFor(activeHotspot);
    }
  }, [activeHotspot, fetchPricingFor]);

  // Prefetch pricing for every priced hotspot in the current variant so the
  // bottom description card can show element pricing without forcing the user
  // to tap each one first.
  useEffect(() => {
    if (!resolved) return;
    for (const h of resolved.variant.hotspots) {
      if (h.pricingRef) fetchPricingFor(h);
    }
  }, [resolved, fetchPricingFor]);

  // Hotspot select callback (stable identity for TourViewer).
  const handleHotspotSelect = useCallback((hotspotId: string) => {
    setActiveHotspotId(hotspotId);
  }, []);

  const handleAddToEstimate = useCallback(
    (hotspot: Hotspot, pricing: PricingResponse | null) => {
      if (!resolved) return;
      const snapshot = pricing ? normalizeFromResponse(pricing) : null;
      addItem({
        id: `${resolved.room.slug}:${hotspot.id}`,
        source: 'hotspot',
        projectSlug: resolved.project.slug,
        roomSlug: resolved.room.slug,
        variantSlug: resolved.variant.slug,
        label: hotspot.label,
        moduleCode: hotspot.moduleCode,
        sku: hotspot.sku,
        quantity: 1,
        priceSnapshot: snapshot ?? undefined,
        addedAt: new Date().toISOString(),
      });
    },
    [resolved, addItem],
  );

  const handleNavigateRoom = useCallback((targetRoomSlug: string) => {
    setRoomSlug(targetRoomSlug);
    setActiveHotspotId(null);
    setIsViewerReady(false);
    setIsWalkthrough(false);
  }, []);


  const handlePrevRoom = useCallback(() => {
    if (!resolved) return;
    const rooms = resolved.project.rooms;
    const idx = rooms.findIndex((r) => r.slug === resolved.room.slug);
    if (idx <= 0) return;
    handleNavigateRoom(rooms[idx - 1].slug);
  }, [resolved, handleNavigateRoom]);

  const handleNextRoom = useCallback(() => {
    if (!resolved) return;
    const rooms = resolved.project.rooms;
    const idx = rooms.findIndex((r) => r.slug === resolved.room.slug);
    if (idx === -1 || idx >= rooms.length - 1) return;
    handleNavigateRoom(rooms[idx + 1].slug);
  }, [resolved, handleNavigateRoom]);

  // Fade the chrome out 3s into an idle walkthrough, and snap it back on the
  // very next cursor/touch/key movement.
  useEffect(() => {
    if (!isWalkthrough) {
      setIsChromeIdle(false);
      return;
    }

    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdleTimer = () => {
      setIsChromeIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsChromeIdle(true), 3000);
    };

    resetIdleTimer();
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('touchmove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('touchmove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [isWalkthrough]);

  if (error) {
    return (
      <div className="w-full h-full bg-spatial-bg flex items-center justify-center p-4 relative">
        <div className="max-w-md w-full relative z-10">
          <AlertBox
            isOpen={true}
            title="Failed to Load Experience"
            description={error.message}
            actions={[
              { label: 'Go Back', onClick: onBack || (() => {}), variant: 'primary' },
            ]}
          />
        </div>
      </div>
    );
  }

  const variant = resolved?.variant;
  const isLoading = !variant || !isViewerReady;
  const isInEstimate = (id: string) =>
    itemIds.has(`${resolved?.room.slug}:${id}`);

  const galleryImages = variant?.gallery ?? [];
  const hasMultipleRooms = (resolved?.project.rooms.length ?? 0) > 1;
  const walkthroughVideoUrl = variant?.walkthroughVideoUrl;

  return (
    <div
      className={
        isForcedLandscape
          ? // Force landscape on portrait phones: rotate the whole tour 90°
            // to fill the screen. The `transform` also makes this element the
            // containing block for the fixed modals inside, so they rotate too.
            'fixed left-0 top-[100dvh] w-[100dvh] h-[100vw] origin-top-left [transform:rotate(-90deg)] overflow-hidden'
          : 'w-full h-full'
      }
    >
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {variant && variant.panorama.url && (
        <TourViewer
          panoramaUrl={variant.panorama.url}
          roomSlug={resolved?.room.slug}
          hotspots={isWalkthrough ? [] : variant.hotspots}
          onReady={() => setIsViewerReady(true)}
          onError={(err) => setError(err)}
          onHotspotSelect={handleHotspotSelect}
          onViewerReady={(v) => { psvViewerRef.current = v; }}
        />
      )}

      <LoadingOverlay isVisible={isLoading} message="Loading Environment..." />

      {/* Walkthrough video — crossfades over the panorama, under the chrome */}
      {walkthroughVideoUrl && (
        <WalkthroughVideo
          videoUrl={walkthroughVideoUrl}
          isActive={isWalkthrough}
          onExit={() => setIsWalkthrough(false)}
          videoRef={walkthroughVideoRef}
          onProgress={setWalkthroughProgress}
        />
      )}

      {/* Spatial UI overlay — padding tracks the notch/home-indicator safe
          areas and tightens on short landscape phones so the chrome never
          eats into the room. */}
      <div
        className="
          absolute inset-0 z-10 pointer-events-none flex flex-col justify-between
          pt-[max(0.75rem,env(safe-area-inset-top))]
          pb-[max(0.75rem,env(safe-area-inset-bottom))]
          pl-[max(0.75rem,env(safe-area-inset-left))]
          pr-[max(0.75rem,env(safe-area-inset-right))]
          md:pt-[max(1.5rem,env(safe-area-inset-top))]
          md:pb-[max(1.5rem,env(safe-area-inset-bottom))]
          md:pl-[max(1.5rem,env(safe-area-inset-left))]
          md:pr-[max(1.5rem,env(safe-area-inset-right))]
        "
      >
        {/* Top bar — fades out 3s into an idle walkthrough */}
        <div
          className={`transition-opacity duration-500 ease-in-out ${
            isChromeIdle ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <TourTopBar
            roomName={resolved?.room.name ?? 'Loading...'}
            projectName={resolved?.project.name ?? ''}
            projectBhkType={resolved?.project.bhkType}
            onBack={onBack}
            onOpenRooms={() => setRoomBrowserMode('list')}
            onWalkthrough={
              walkthroughVideoUrl
                ? () => {
                    setActiveHotspotId(null);
                    setIsWalkthrough(true);
                  }
                : undefined
            }
            onExitWalkthrough={() => setIsWalkthrough(false)}
            isWalkthroughActive={isWalkthrough}
            isRoomListOpen={roomBrowserMode !== 'closed'}
          />
        </div>



        {/* Bottom row: room navigator, swapped for a seek bar during the walkthrough */}
        <div className="relative flex justify-center w-full min-h-[48px]">
          <div
            className={`absolute inset-x-0 flex justify-center pointer-events-auto transition-all duration-500 ease-in-out ${
              isWalkthrough
                ? 'opacity-0 translate-y-6 pointer-events-none'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {variant ? (
              <RoomNavigator
                roomName={resolved?.room.name ?? 'Room'}
                onPrev={handlePrevRoom}
                onNext={handleNextRoom}
                onOpenInfo={() => setIsInfoOpen(true)}
                isPrevDisabled={!hasMultipleRooms}
                isInfoOpen={isInfoOpen}
              />
            ) : null}
          </div>

          {walkthroughVideoUrl && (
            <div
              className={`absolute inset-x-0 flex justify-center pointer-events-auto transition-all duration-500 ease-in-out ${
                isWalkthrough && !isChromeIdle
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6 pointer-events-none'
              }`}
            >
              <WalkthroughSeekBar
                videoRef={walkthroughVideoRef}
                currentTime={walkthroughProgress.currentTime}
                duration={walkthroughProgress.duration}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right-rail icon dock — items 1, 2, 4, 5, 6, 7 */}
      {resolved && (
        <ViewerIconDock
          isMuted={isMuted}
          estimateCount={itemCount}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenRoomsMenu={() => setIsRoomsMenuOpen(true)}
          onOpenEstimate={openEstimate}
          onToggleMute={() => setIsMuted((m) => !m)}
          onVisualize={() => setIsVisualizeOpen(true)}
          isWalkthrough={isWalkthrough}
        />
      )}

      {/* Floor-plan minimap — game-style orientation aid, bottom-left */}
      {resolved && (
        <RoomMinimap
          rooms={resolved.project.rooms.map((r) => ({ slug: r.slug, name: r.name }))}
          activeRoomSlug={resolved.room.slug}
          viewerRef={psvViewerRef}
          hidden={isWalkthrough}
        />
      )}

      {/* Hotspot product snippet — pops over the panorama, anchored to the marker */}
      <HotspotSnippet
        viewerRef={psvViewerRef}
        hotspot={activeHotspot}
        pricing={activeHotspot ? pricingByHotspot[activeHotspot.id] : undefined}
        pricingLoading={activeHotspot ? !!pricingLoading[activeHotspot.id] : false}
        isInEstimate={activeHotspot ? isInEstimate(activeHotspot.id) : false}
        videoMedia={activeVideoMedia}
        onClose={() => setActiveHotspotId(null)}
        onAddToEstimate={handleAddToEstimate}
        onRemoveFromEstimate={(hotspot) =>
          resolved && removeItem(`${resolved.room.slug}:${hotspot.id}`)
        }
        onPlayVideo={(media) => setActiveVideo(media)}
      />

      {/* Estimate sidebar */}
      <EstimateSidebar />

      {/* Video modal (used by dock + hotspot panel) */}
      <VideoModal media={activeVideo} onClose={() => setActiveVideo(null)} />

      {/* Gallery modal */}
      <GalleryModal
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Visualize — browse the current room's other styles + their galleries */}
      {resolved && (
        <VisualizeStylesModal
          roomName={resolved.room.name}
          variants={resolved.room.variants}
          activeVariantSlug={resolved.variant.slug}
          isOpen={isVisualizeOpen}
          onClose={() => setIsVisualizeOpen(false)}
        />
      )}

      {/* Room browser — a single panel that opens as a floating drawer from
          the project pill, then grows to fill the screen for the full
          catalog + filters view. */}
      {resolved && (
        <RoomBrowserPanel
          projectName={resolved.project.name}
          projectBhkType={resolved.project.bhkType}
          rooms={resolved.project.rooms}
          activeRoomSlug={resolved.room.slug}
          mode={roomBrowserMode}
          onClose={() => setRoomBrowserMode('closed')}
          onSelect={handleNavigateRoom}
          onBrowseCatalog={() => setRoomBrowserMode('catalog')}
        />
      )}

      {/* Rooms menu (left sheet) */}
      {resolved && (
        <RoomsMenu
          rooms={resolved.project.rooms}
          activeRoomSlug={resolved.room.slug}
          isOpen={isRoomsMenuOpen}
          onClose={() => setIsRoomsMenuOpen(false)}
          onSelect={handleNavigateRoom}
        />
      )}

      {/* Room info bottom sheet — opens when user taps the room name pill */}
      {resolved && (
        <RoomInfoPanel
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          room={resolved.room}
          variant={resolved.variant}
          projectName={resolved.project.name}
          projectBhkType={resolved.project.bhkType}
          roomIndex={resolved.project.rooms.findIndex((r) => r.slug === resolved.room.slug) + 1}
          totalRooms={resolved.project.rooms.length}
          pricingByHotspot={pricingByHotspot}
          onAddHotspot={handleAddToEstimate}
          onRemoveHotspot={(hotspotId) => removeItem(`${resolved.room.slug}:${hotspotId}`)}
          isInEstimate={isInEstimate}
        />
      )}
    </div>
    </div>
  );
};
