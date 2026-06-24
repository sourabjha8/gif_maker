/**
 * Tour content types.
 * Defines the data contract for 360 virtual tour content,
 * including panoramas, hotspots, media, and layer options.
 *
 * Reference: FEATURE_SPEC.md §3 - Content data contract
 */

import type { NavigationData } from './navigation-data';

// ─── Top-Level Content ───────────────────────────────────────────

export interface VirtualXpContent {
  version: string;
  updatedAt: string;
  floors: ContentFloor[];
  /** Selection-flow navigation catalog + design-flow config. */
  navigation: NavigationData;
}

// ─── Content Hierarchy ───────────────────────────────────────────
// These "Content*" types mirror the tour JSON structure and are
// separate from the existing City/Society/Room UI types.

export interface ContentFloor {
  id: string;
  slug: string;
  name: string;
  description?: string;
  heroImage?: string;
  cities: ContentCity[];
}

export interface ContentCity {
  id: string;
  slug: string;
  name: string;
  nameLocal?: string;
  region?: string;
  heroImage?: string;
  tags?: string[];
  projects: ContentProject[];
}

export interface ContentProject {
  id: string;
  slug: string;
  name: string;
  locality?: string;
  bhkType?: string;
  heroImage?: string;
  rooms: ContentRoom[];
}

export interface ContentRoom {
  id: string;
  slug: string;
  name: string;
  type: string;
  thumbnail?: string;
  variants: RoomVariant[];
}

// ─── Room Variant ────────────────────────────────────────────────

export interface RoomVariant {
  id: string;
  slug: string;
  name: string;
  designStyle?: string;
  moduleType?: string;
  luxuryLevel?: string;
  roomSize?: string;
  isDefault?: boolean;
  panorama: PanoramaAsset;
  hotspots: Hotspot[];
  media?: MediaAsset[];
  layerOptions?: LayerOption[];
  description?: string;
  /** Long-form (~100 word) room summary shown in the info panel. */
  longDescription?: string;
  /** Materials and finishes used in the room. */
  materials?: MaterialFinish[];
  gallery?: GalleryImage[];
}

export interface MaterialFinish {
  id: string;
  /** What the material is applied to (e.g. "Sofa upholstery", "Flooring"). */
  label: string;
  /** The material itself (e.g. "Italian leather", "Engineered wood"). */
  material: string;
  /** Finish or color descriptor (e.g. "Matte walnut", "Champagne satin"). */
  finish?: string;
  /** Optional CSS color swatch shown next to the row. */
  swatch?: string;
  /** Optional supplier or grade note. */
  note?: string;
}

// ─── Panorama ────────────────────────────────────────────────────

export interface PanoramaAsset {
  type: 'equirectangular' | 'equirectangular-tiles';
  url?: string;
  lowUrl?: string;
  midUrl?: string;
  highUrl?: string;
  width: number;
  height: number;
  tileConfig?: TileConfig;
}

export interface TileConfig {
  baseUrl: string;
  width: number;
  cols: number;
  rows: number;
  tileUrlPattern: string;
}

// ─── Hotspots ────────────────────────────────────────────────────

export interface Hotspot {
  id: string;
  label: string;
  type: 'product' | 'module' | 'info' | 'video';
  yaw: number;
  pitch: number;
  description?: string;
  image?: string;
  gallery?: GalleryImage[];
  sku?: string;
  moduleCode?: string;
  pricingRef?: PricingRef;
  videoRef?: string;
}

export interface PricingRef {
  type: 'sku' | 'module' | 'room-package';
  code: string;
  quantity?: number;
  metadata?: Record<string, string | number | boolean>;
}

// ─── Media ───────────────────────────────────────────────────────

export interface MediaAsset {
  id: string;
  type: 'video' | 'image';
  title: string;
  url: string;
  poster?: string;
  mimeType?: string;
  description?: string;
}

// ─── Layer Options ───────────────────────────────────────────────

export interface LayerOption {
  id: string;
  label: string;
  group: 'color' | 'material' | 'finish' | 'module';
  mode: 'full-panorama-variant' | 'overlay-patch';
  targetVariantSlug?: string;
  overlay?: OverlayPatch;
  pricingRef?: PricingRef;
}

export interface OverlayPatch {
  id: string;
  url: string;
  opacity?: number;
  panoData?: {
    fullWidth: number;
    fullHeight: number;
    croppedWidth: number;
    croppedHeight: number;
    croppedX: number;
    croppedY: number;
  };
}

// ─── Gallery ─────────────────────────────────────────────────────

export interface GalleryImage {
  id: string;
  title?: string;
  url: string;
  alt: string;
}
