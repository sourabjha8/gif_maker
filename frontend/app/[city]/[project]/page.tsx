'use client';

import { useParams, useRouter } from 'next/navigation';
import { RoomSelection } from '@shared/screens/RoomSelection';
import { AppFrame } from '@shared/components/AppFrame';
import { getNavSocietyBySlug, getDefaultSociety } from '@shared/lib/content';

export default function RoomSelectionPage() {
  const router = useRouter();
  const { city, project } = useParams<{ city: string; project: string }>();
  const society = getNavSocietyBySlug(city, project) ?? getDefaultSociety();

  return (
    <AppFrame withNavbar>
      <RoomSelection
        society={society}
        onBack={() => router.push(`/${city}`)}
        // Preserves prior behaviour: the city flow always opened the default
        // Mumbai tour (no tour slugs were ever set). Routing the selected nav
        // city instead would error for cities without tour content.
        onExplore={() => router.push('/mumbai/seabreeze-residences/living-room')}
      />
    </AppFrame>
  );
}
