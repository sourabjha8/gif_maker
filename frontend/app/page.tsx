'use client';

import { useRouter } from 'next/navigation';
import { StartScreen } from '@shared/screens/StartScreen';
import { AppFrame } from '@shared/components/AppFrame';

export default function StartPage() {
  const router = useRouter();
  return (
    <AppFrame>
      <StartScreen onBegin={() => router.push('/login')} />
    </AppFrame>
  );
}
