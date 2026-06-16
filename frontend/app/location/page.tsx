'use client';

import { useRouter } from 'next/navigation';
import { LocationSelection } from '@shared/screens/LocationSelection';
import { AppFrame } from '@shared/components/AppFrame';
import { slugify } from '@shared/lib/content';

export default function LocationPage() {
  const router = useRouter();
  return (
    <AppFrame withNavbar>
      <LocationSelection
        onBack={() => router.push('/choose')}
        onExplore={(city) => router.push(`/${slugify(city)}`)}
      />
    </AppFrame>
  );
}
