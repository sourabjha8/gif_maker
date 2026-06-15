# Virtual XP Web - Feature Specification for Claude Code

## 1. User journey

```txt
Landing
  -> Experience start
  -> Floor selection
  -> City selection
  -> Project selection
  -> Room selection
  -> Variant/configuration selection
  -> 360 tour
  -> Hotspot detail
  -> Add to estimate
  -> Estimate summary
```

For v1, this journey can be powered entirely by static JSON.

## 2. Core screens

### Landing/start

Purpose:

- Introduce the Virtual XP Web experience.
- Provide a clear start action.

Requirements:

- Premium visual treatment.
- Clear CTA.
- Works on laptop, tablet, mobile.

### Floor/city/project/room selection

Purpose:

- Let designer navigate to a relevant showroom room.

Requirements:

- Cards with hero image, title, short metadata.
- Empty state if no content.
- Back navigation.
- Breadcrumb or step indicator.

### Variant/configuration selection

Purpose:

- Choose style, module type, luxury level, size, or material option.

Requirements:

- Filter chips or cards.
- Show available variants.
- If no exact match, show nearest variants by matching dimensions.
- Do not block access if some metadata is missing. Show controlled fallback.

### Tour

Purpose:

- Main pitch experience.

Requirements:

- Full-screen 360 viewer.
- Hotspots visible and tappable.
- Floating panel for room info.
- Floating estimate/cart access.
- Room navigation.
- Video action.
- Layer/material switch action if variant/layer data exists.
- Clear loading state.
- Clear error state.

### Hotspot detail panel

Purpose:

- Explain product/module and show price.

Requirements:

- Product/module name.
- SKU/module code if available.
- Description.
- Image/gallery if available.
- Module-wise pricing rows.
- Add-to-estimate button.
- Pricing loading/unavailable state.

### Estimate summary

Purpose:

- Show pitch cost summary.

Requirements:

- Group by room.
- Show line items.
- Quantity controls.
- Subtotals.
- Grand total.
- Items with missing price clearly marked.
- No PDF/export in v1.

## 3. Content data contract

Use this conceptual shape. Claude Code should implement TypeScript types and Zod schemas.

```ts
export interface VirtualXpContent {
  version: string;
  updatedAt: string;
  floors: Floor[];
}

export interface Floor {
  id: string;
  slug: string;
  name: string;
  description?: string;
  heroImage?: string;
  cities: City[];
}

export interface City {
  id: string;
  slug: string;
  name: string;
  nameLocal?: string;
  region?: string;
  heroImage?: string;
  tags?: string[];
  projects: Project[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  locality?: string;
  bhkType?: string;
  heroImage?: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  type: string;
  thumbnail?: string;
  variants: RoomVariant[];
}

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
  gallery?: GalleryImage[];
}

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

export interface Hotspot {
  id: string;
  label: string;
  type: 'product' | 'module' | 'info' | 'navigation' | 'video';
  yaw: number;
  pitch: number;
  description?: string;
  image?: string;
  gallery?: GalleryImage[];
  sku?: string;
  moduleCode?: string;
  pricingRef?: PricingRef;
  targetRoomSlug?: string;
  targetVariantSlug?: string;
  videoRef?: string;
}

export interface PricingRef {
  type: 'sku' | 'module' | 'room-package';
  code: string;
  quantity?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface MediaAsset {
  id: string;
  type: 'video' | 'image';
  title: string;
  url: string;
  poster?: string;
  mimeType?: string;
  description?: string;
}

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

export interface GalleryImage {
  id: string;
  title?: string;
  url: string;
  alt: string;
}
```

## 4. Pricing response contract

Normalize any existing API response into this shape.

```ts
export interface PricingRequest {
  pricingRef: PricingRef;
  citySlug?: string;
  projectSlug?: string;
  roomSlug?: string;
  variantSlug?: string;
}

export interface PricingResponse {
  status: 'priced' | 'unavailable' | 'error';
  currency: 'INR';
  label: string;
  rows: PricingRow[];
  subtotalMinor: number;
  taxMinor?: number;
  discountMinor?: number;
  totalMinor: number;
  source?: string;
  updatedAt?: string;
  message?: string;
}

export interface PricingRow {
  id: string;
  label: string;
  code?: string;
  quantity: number;
  unitAmountMinor: number;
  totalAmountMinor: number;
}
```

Rules:

- Use integer minor units for money, for example paise.
- Format INR in UI.
- Never calculate with floating point rupee values.
- Do not render raw API objects directly.

## 5. Variant fallback algorithm

When exact filters are unavailable:

1. Score every variant in the same room.
2. Add 1 point for each matching dimension:
   - designStyle
   - moduleType
   - luxuryLevel
   - roomSize
3. Sort by score descending.
4. Use `isDefault` as final fallback.
5. Show a clear message when exact match is missing.

## 6. Layer swap decision matrix

| Requirement | v1 implementation |
|---|---|
| Same sofa, only fabric color changes, exact same camera | Try overlay patch or full panorama variant |
| Sofa shape/cushion count changes | Full panorama variant only |
| Modular wardrobe finish change | Overlay patch possible if alignment is locked |
| Moving/removing modules | Full panorama variant only |
| Metallic/glossy/reflection-heavy material | Full panorama variant preferred |
| Dynamic AI recolor inside tour | Out of scope |

## 7. Error states

Build all of these:

- Content validation failed.
- Panorama missing.
- Panorama failed to load.
- WebGL/viewer init failed.
- Hotspot has no pricing ref.
- Pricing API unavailable.
- Video unavailable.
- No variants found.
- Estimate is empty.

## 8. Performance rules

- Do not load Photo Sphere Viewer on non-tour pages.
- Do not import heavy viewer code in server components.
- Use low-resolution panorama first where possible.
- Use image dimensions in content to avoid layout shift.
- Avoid unnecessary rerenders of the viewer.
- Recreate viewer only when panorama changes, not on every panel interaction.

## 9. Security rules

- No secrets in client code.
- No API keys in `NEXT_PUBLIC_*` variables.
- `.env.local` must not be committed.
- If using `/api/pricing`, validate input before forwarding.
- Do not allow arbitrary external URLs from query params to be loaded into video/image/panorama sources.
- Only render content URLs from validated content config.

## 10. Design rules

- Premium, dark, immersive UI.
- Do not clutter the viewer.
- Hotspots must feel precise but touchable.
- Panels should not block the main product unless opened intentionally.
- Estimate should be always reachable but not dominant.
- Use progressive disclosure.
