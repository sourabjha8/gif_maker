'use client';

import { useRouter } from 'next/navigation';
import { ExperienceSelection } from '@shared/screens/ExperienceSelection';
import { AppFrame } from '@shared/components/AppFrame';
import type { ExperienceMode } from '@shared/types';

export default function ChoosePage() {
  const router = useRouter();
  return (
    <AppFrame withNavbar>
      <ExperienceSelection
        onContinue={(mode: ExperienceMode) =>
          router.push(mode === 'walk-around' ? '/room-type' : '/location')
        }
      />
    </AppFrame>
  );
}
