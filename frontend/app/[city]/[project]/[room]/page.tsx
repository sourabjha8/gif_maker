'use client';

import { useParams, useRouter } from 'next/navigation';
import { TourScreen } from '@shared/screens/TourScreen';
import { AppFrame } from '@shared/components/AppFrame';

export default function TourRoutePage() {
  const router = useRouter();
  const { city, project, room } = useParams<{ city: string; project: string; room: string }>();

  return (
    <AppFrame withNavbar>
      <TourScreen
        citySlug={city}
        projectSlug={project}
        roomSlug={room}
        onBack={() => router.back()}
        onOpenEstimate={() => router.push('/estimate')}
      />
    </AppFrame>
  );
}
