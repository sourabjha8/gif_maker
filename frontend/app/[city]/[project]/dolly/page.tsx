'use client';

import { useParams, useRouter } from 'next/navigation';
import { DollyScreen } from '@shared/screens/DollyScreen';
import { AppFrame } from '@shared/components/AppFrame';
import { getNavSocietyBySlug } from '@shared/lib/content';

export default function DollyRoutePage() {
  const router = useRouter();
  const { city, project } = useParams<{ city: string; project: string }>();
  const society = getNavSocietyBySlug(city, project);

  return (
    <AppFrame>
      <DollyScreen
        societyName={society?.name}
        onBack={() => router.back()}
        onSelectRoom={(roomSlug) => router.push(`/${city}/${project}/${roomSlug}`)}
      />
    </AppFrame>
  );
}
