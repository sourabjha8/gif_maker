'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
// @ts-ignore - next/dynamic is available at runtime in the Next.js app
import dynamic from 'next/dynamic';
import {
  LoadingOverlay,
  AlertBox,
  HotspotPanel,
  VideoModal,
  VariantSwitcher,
  EstimateSidebar,
  ViewerIconDock,
  GalleryModal,
  RoomsMenu,
  RoomInfoPanel,
  RoomNavigator,
  TourTopBar,
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
import { useEstimateStore } from '../lib/estimate';
import { getPricingAdapter } from '../lib/pricing/factory';
import { normalizeFromResponse } from '../lib/pricing/format';

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
  const [isRoomsMenuOpen, setIsRoomsMenuOpen] = useState(false);
  const [isStyleSheetOpen, setIsStyleSheetOpen] = useState(true); // variant switcher visible by default
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  // Estimate store hooks.
  const addItem = useEstimateStore((s) => s.addItem);
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

  // First video on the variant — used by the dock's Play button.
  const primaryVideo: MediaAsset | undefined = useMemo(
    () => resolved?.variant.media?.find((m) => m.type === 'video'),
    [resolved],
  );

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
  }, []);

  const handleVariantSelect = useCallback((variant: RoomVariant) => {
    setResolved((prev) => (prev ? { ...prev, variant } : prev));
    setActiveHotspotId(null);
    setIsViewerReady(false);
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

  const handleToggleStyle = useCallback(() => {
    setIsStyleSheetOpen((v) => !v);
  }, []);

  const handlePlayPrimaryVideo = useCallback(() => {
    if (primaryVideo) setActiveVideo(primaryVideo);
  }, [primaryVideo]);

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
  const hasGallery = galleryImages.length > 0;
  const hasVideo = !!primaryVideo;
  const hasMultipleVariants = (resolved?.room.variants.length ?? 0) > 1;
  const hasMultipleRooms = (resolved?.project.rooms.length ?? 0) > 1;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {variant && variant.panorama.url && (
        <TourViewer
          panoramaUrl={variant.panorama.url}
          roomSlug={resolved?.room.slug}
          hotspots={variant.hotspots}
          onReady={() => setIsViewerReady(true)}
          onError={(err) => setError(err)}
          onHotspotSelect={handleHotspotSelect}
        />
      )}

      <LoadingOverlay isVisible={isLoading} message="Loading Environment..." />

      {/* Spatial UI overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6 pb-safe">
        {/* Top bar */}
        <TourTopBar
          roomName={resolved?.room.name ?? 'Loading...'}
          estimateCount={itemCount}
          onBack={onBack}
          onOpenEstimate={openEstimate}
        />

        {/* Mid: variant switcher (toggle via Palette icon) */}
        {resolved && isStyleSheetOpen && (
          <div className="flex justify-center w-full">
            <VariantSwitcher
              variants={resolved.room.variants}
              activeVariantSlug={resolved.variant.slug}
              onSelect={handleVariantSelect}
            />
          </div>
        )}

        {/* Bottom row: room navigator — prev · room name · next */}
        <div className="flex justify-center w-full pointer-events-auto">
          {variant ? (
            <RoomNavigator
              roomName={resolved?.room.name ?? 'Room'}
              onPrev={handlePrevRoom}
              onNext={() => handleNavigateRoom('living-room')}
              onOpenInfo={() => setIsInfoOpen(true)}
              isPrevDisabled={!hasMultipleRooms}
              isInfoOpen={isInfoOpen}
            />
          ) : null}
        </div>
      </div>

      {/* Right-rail icon dock — items 1, 2, 4, 5, 6, 7 */}
      {resolved && (
        <ViewerIconDock
          hasVideo={hasVideo}
          hasGallery={hasGallery}
          hasMultipleVariants={hasMultipleVariants}
          hasMultipleRooms={hasMultipleRooms}
          isMuted={isMuted}
          onPlayVideo={handlePlayPrimaryVideo}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onToggleStyle={handleToggleStyle}
          onPrevRoom={handlePrevRoom}
          onNextRoom={handleNextRoom}
          onOpenRoomsMenu={() => setIsRoomsMenuOpen(true)}
          onToggleMute={() => setIsMuted((m) => !m)}
        />
      )}

      {/* Hotspot detail panel */}
      <HotspotPanel
        hotspot={activeHotspot}
        pricing={activeHotspot ? pricingByHotspot[activeHotspot.id] : undefined}
        pricingLoading={activeHotspot ? !!pricingLoading[activeHotspot.id] : false}
        isInEstimate={activeHotspot ? isInEstimate(activeHotspot.id) : false}
        videoMedia={activeVideoMedia}
        onClose={() => setActiveHotspotId(null)}
        onAddToEstimate={handleAddToEstimate}
        onPlayVideo={(media) => setActiveVideo(media)}
        onNavigateRoom={handleNavigateRoom}
      />

      {/* Estimate sidebar */}
      <EstimateSidebar onViewSummary={onOpenEstimate} />

      {/* Video modal (used by dock + hotspot panel) */}
      <VideoModal media={activeVideo} onClose={() => setActiveVideo(null)} />

      {/* Gallery modal */}
      <GalleryModal
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

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

      {/* Elongated room info panel — behind the bottom hamburger button */}
      {resolved && (
        <RoomInfoPanel
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          room={resolved.room}
          variant={resolved.variant}
          pricingByHotspot={pricingByHotspot}
          onSelectHotspot={(id) => {
            setActiveHotspotId(id);
            setIsInfoOpen(false);
          }}
        />
      )}
    </div>
  );
};
