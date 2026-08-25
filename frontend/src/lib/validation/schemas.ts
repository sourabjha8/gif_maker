/**
 * Zod validation schemas for tour content.
 * Validates static JSON content before rendering to catch data issues early.
 *
 * Reference: BUILD_PLAN.md §6 - Data and content approach
 * Rule: The app must not render invalid content silently.
 */

import { z } from 'zod';

// ─── Gallery ─────────────────────────────────────────────────────

export const GalleryImageSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  url: z.string(),
  alt: z.string(),
});

// ─── Pricing Reference ──────────────────────────────────────────

export const PricingRefSchema = z.object({
  type: z.enum(['sku', 'module', 'room-package']),
  code: z.string(),
  quantity: z.number().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

// ─── Hotspot ─────────────────────────────────────────────────────

export const HotspotSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['product', 'module', 'info', 'video', 'room-portal', 'reposition', 'view-angle']),
  yaw: z.number(),
  pitch: z.number(),
  description: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(GalleryImageSchema).optional(),
  sku: z.string().optional(),
  moduleCode: z.string().optional(),
  pricingRef: PricingRefSchema.optional(),
  videoRef: z.string().optional(),
  targetRoomSlug: z.string().optional(),
  targetYaw: z.number().optional(),
  targetPitch: z.number().optional(),
  rotation: z.number().optional(),
});

// ─── Media ───────────────────────────────────────────────────────

export const MediaAssetSchema = z.object({
  id: z.string(),
  type: z.enum(['video', 'image']),
  title: z.string(),
  url: z.string(),
  poster: z.string().optional(),
  mimeType: z.string().optional(),
  description: z.string().optional(),
});

// ─── Overlay Patch ───────────────────────────────────────────────

export const OverlayPatchSchema = z.object({
  id: z.string(),
  url: z.string(),
  opacity: z.number().optional(),
  panoData: z.object({
    fullWidth: z.number(),
    fullHeight: z.number(),
    croppedWidth: z.number(),
    croppedHeight: z.number(),
    croppedX: z.number(),
    croppedY: z.number(),
  }).optional(),
});

// ─── Layer Option ────────────────────────────────────────────────

export const LayerOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  group: z.enum(['color', 'material', 'finish', 'module']),
  mode: z.enum(['full-panorama-variant', 'overlay-patch']),
  targetVariantSlug: z.string().optional(),
  overlay: OverlayPatchSchema.optional(),
  pricingRef: PricingRefSchema.optional(),
});

// ─── Tile Config ─────────────────────────────────────────────────

export const TileConfigSchema = z.object({
  baseUrl: z.string(),
  width: z.number(),
  cols: z.number(),
  rows: z.number(),
  tileUrlPattern: z.string(),
});

// ─── Panorama Asset ──────────────────────────────────────────────

export const PanoramaAssetSchema = z.object({
  type: z.enum(['equirectangular', 'equirectangular-tiles']),
  url: z.string().optional(),
  lowUrl: z.string().optional(),
  midUrl: z.string().optional(),
  highUrl: z.string().optional(),
  width: z.number(),
  height: z.number(),
  tileConfig: TileConfigSchema.optional(),
});

// ─── Material / Finish ──────────────────────────────────────────

export const MaterialFinishSchema = z.object({
  id: z.string(),
  label: z.string(),
  material: z.string(),
  finish: z.string().optional(),
  swatch: z.string().optional(),
  note: z.string().optional(),
});

// ─── Room Variant ────────────────────────────────────────────────

export const RoomVariantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  designStyle: z.string().optional(),
  moduleType: z.string().optional(),
  luxuryLevel: z.string().optional(),
  roomSize: z.string().optional(),
  isDefault: z.boolean().optional(),
  panorama: PanoramaAssetSchema,
  hotspots: z.array(HotspotSchema),
  media: z.array(MediaAssetSchema).optional(),
  layerOptions: z.array(LayerOptionSchema).optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  materials: z.array(MaterialFinishSchema).optional(),
  gallery: z.array(GalleryImageSchema).optional(),
  walkthroughVideoUrl: z.string().optional(),
});

// ─── Content Hierarchy ───────────────────────────────────────────

export const ContentRoomSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.string(),
  thumbnail: z.string().optional(),
  variants: z.array(RoomVariantSchema),
});

export const ContentProjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  locality: z.string().optional(),
  bhkType: z.string().optional(),
  heroImage: z.string().optional(),
  rooms: z.array(ContentRoomSchema),
});

export const ContentCitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nameLocal: z.string().optional(),
  region: z.string().optional(),
  heroImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  projects: z.array(ContentProjectSchema),
});

export const ContentFloorSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  cities: z.array(ContentCitySchema),
});

// ─── Navigation Catalog ──────────────────────────────────────────
// Validated data for the selection-flow screens (location / project /
// room / room-type / room-filter). This is the navigation catalog and
// design-flow config that previously lived in data/cities.ts,
// projects.ts and rooms.ts. It is intentionally a separate shape from
// the tour `floors` hierarchy above (different fields, different cardinality).

export const NavSocietySchema = z.object({
  name: z.string(),
  bhk: z.string(),
  address: z.string(),
  logo: z.string(),
});

export const NavCitySchema = z.object({
  name: z.string(),
  nameHindi: z.string(),
  state: z.string(),
  country: z.string(),
  projectCount: z.number(),
  tags: z.array(z.string()),
  image: z.string(),
  societies: z.array(NavSocietySchema),
});

export const NavFloorSchema = z.object({
  label: z.string(),
  city: NavCitySchema,
});

export const NavRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  icon: z.string(),
  assets: z.array(z.string()).optional(),
});

// Filter groups store data only; the icon component is mapped by id in the screen.
export const NavFilterGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  options: z.array(z.string()),
});

export const NavigationSchema = z.object({
  defaultCity: z.string(),
  floors: z.array(NavFloorSchema),
  rooms: z.array(NavRoomSchema),
  roomTypes: z.array(NavRoomSchema),
  filterGroups: z.array(NavFilterGroupSchema),
  defaultFilters: z.record(z.string(), z.string()),
  defaultSociety: NavSocietySchema,
});

// ─── Root Content Schema ─────────────────────────────────────────

export const VirtualXpContentSchema = z.object({
  version: z.string(),
  updatedAt: z.string(),
  floors: z.array(ContentFloorSchema),
  navigation: NavigationSchema,
});

// ─── Pricing Schemas ─────────────────────────────────────────────

export const PricingRowSchema = z.object({
  id: z.string(),
  label: z.string(),
  code: z.string().optional(),
  quantity: z.number(),
  unitAmountMinor: z.number(),
  totalAmountMinor: z.number(),
});

export const PricingResponseSchema = z.object({
  status: z.enum(['priced', 'unavailable', 'error']),
  currency: z.literal('INR'),
  label: z.string(),
  rows: z.array(PricingRowSchema),
  subtotalMinor: z.number(),
  taxMinor: z.number().optional(),
  discountMinor: z.number().optional(),
  totalMinor: z.number(),
  source: z.string().optional(),
  updatedAt: z.string().optional(),
  message: z.string().optional(),
});
