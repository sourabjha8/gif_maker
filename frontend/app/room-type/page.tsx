'use client';

import { useRouter } from 'next/navigation';
import { RoomTypeSelection } from '@shared/screens/RoomTypeSelection';
import { AppFrame } from '@shared/components/AppFrame';

export default function RoomTypePage() {
  const router = useRouter();
  return (
    <AppFrame withNavbar>
      <RoomTypeSelection
        onBack={() => router.push('/choose')}
        onContinue={() => router.push('/room-filter')}
      />
    </AppFrame>
  );
}
