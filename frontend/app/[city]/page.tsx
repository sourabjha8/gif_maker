'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProjectSelection } from '@shared/screens/ProjectSelection';
import { AppFrame } from '@shared/components/AppFrame';
import { getNavCityBySlug, getDefaultCityName, slugify } from '@shared/lib/content';
import type { Society } from '@shared/types';

export default function ProjectPage() {
  const router = useRouter();
  const { city } = useParams<{ city: string }>();
  const cityName = getNavCityBySlug(city)?.name ?? getDefaultCityName();

  return (
    <AppFrame withNavbar>
      <ProjectSelection
        cityName={cityName}
        onBack={() => router.push('/location')}
        onContinue={(society: Society) => router.push(`/${city}/${slugify(society.name)}`)}
        onViewOnMap={(society: Society) => router.push(`/${city}/${slugify(society.name)}/dolly`)}
      />
    </AppFrame>
  );
}
