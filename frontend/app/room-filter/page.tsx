'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RoomFilterSelection } from '@shared/screens/RoomFilterSelection';
import { AppFrame } from '@shared/components/AppFrame';

// The pre-tour filter step uses a decorative taxonomy (design/module/luxury/
// size ids, Title-Case values) so it reads well before any project data is
// loaded. Real room variants tag themselves with a different, lowercase
// vocabulary (see RoomVariant in src/types/tour.ts). This maps one to the
// other so the filters chosen here actually influence which variant
// findBestVariant() picks once we land in the tour.
const DESIGN_STYLE_MAP: Record<string, string> = {
  Modern: 'modern',
  Classic: 'classic',
  Industrial: 'industrial',
  Minimalist: 'minimalist',
};
const MODULE_TYPE_MAP: Record<string, string> = {
  Standard: 'standard',
  Premium: 'modular',
  Custom: 'custom',
};
const LUXURY_LEVEL_MAP: Record<string, string> = {
  Gold: 'essential',
  Platinum: 'premium',
  Diamond: 'signature',
};
const ROOM_SIZE_MAP: Record<string, string> = {
  '10x12 ft': 'small',
  '12x14 ft': 'medium',
  '15x18 ft': 'large',
};

function toRoomFilters(selections: Record<string, string>): Record<string, string> {
  const filters: Record<string, string> = {};
  if (selections.design && DESIGN_STYLE_MAP[selections.design]) {
    filters.designStyle = DESIGN_STYLE_MAP[selections.design];
  }
  if (selections.module && MODULE_TYPE_MAP[selections.module]) {
    filters.moduleType = MODULE_TYPE_MAP[selections.module];
  }
  if (selections.luxury && LUXURY_LEVEL_MAP[selections.luxury]) {
    filters.luxuryLevel = LUXURY_LEVEL_MAP[selections.luxury];
  }
  if (selections.size && ROOM_SIZE_MAP[selections.size]) {
    filters.roomSize = ROOM_SIZE_MAP[selections.size];
  }
  return filters;
}

export default function RoomFilterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Room-type ids (from the previous step) line up 1:1 with tour room slugs
  // for the pilot project — see virtual-xp-content.json.
  const roomSlug = searchParams.get('type') ?? 'living-room';

  return (
    <AppFrame withNavbar>
      <RoomFilterSelection
        onBack={() => router.push('/room-type')}
        onExplore={(selections) => {
          const params = new URLSearchParams(toRoomFilters(selections));
          const query = params.toString();
          router.push(`/mumbai/seabreeze-residences/${roomSlug}${query ? `?${query}` : ''}`);
        }}
      />
    </AppFrame>
  );
}
