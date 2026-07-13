'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { TourScreen } from '@shared/screens/TourScreen';
import { AppFrame } from '@shared/components/AppFrame';

export default function TourRoutePage() {
  const router = useRouter();
  const { city, project, room } = useParams<{ city: string; project: string; room: string }>();
  const searchParams = useSearchParams();

  const roomFilters = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    return entries.length ? Object.fromEntries(entries) : undefined;
  }, [searchParams]);

  return (
    <AppFrame>
      <TourScreen
        citySlug={city}
        projectSlug={project}
        roomSlug={room}
        roomFilters={roomFilters}
        onBack={() => router.back()}
        onOpenEstimate={() => router.push('/estimate')}
      />
    </AppFrame>
  );
}
