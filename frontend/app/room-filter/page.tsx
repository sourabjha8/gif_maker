'use client';

import { useRouter } from 'next/navigation';
import { RoomFilterSelection } from '@shared/screens/RoomFilterSelection';
import { AppFrame } from '@shared/components/AppFrame';

export default function RoomFilterPage() {
  const router = useRouter();
  return (
    <AppFrame withNavbar>
      <RoomFilterSelection
        onBack={() => router.push('/room-type')}
        onExplore={() => router.push('/mumbai/seabreeze-residences/living-room')}
      />
    </AppFrame>
  );
}
