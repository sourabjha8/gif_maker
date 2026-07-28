'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RoomFilterSelection } from '@shared/screens/RoomFilterSelection';
import { AppFrame } from '@shared/components/AppFrame';

export default function RoomFilterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Room-type ids (from the previous step) line up 1:1 with tour room slugs
  // for the pilot project — see virtual-xp-content.json.
  const roomSlug = searchParams.get('type') ?? 'living-room';

  return (
    <AppFrame withNavbar>
      <RoomFilterSelection
        roomTypeId={roomSlug}
        onBack={() => router.push('/room-type')}
        onExplore={(filters) => {
          const query = new URLSearchParams(filters).toString();
          router.push(`/mumbai/seabreeze-residences/${roomSlug}${query ? `?${query}` : ''}`);
        }}
      />
    </AppFrame>
  );
}
