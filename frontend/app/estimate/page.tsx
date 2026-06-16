'use client';

import { useRouter } from 'next/navigation';
import { EstimatePage } from '@shared/screens/EstimatePage';
import { AppFrame } from '@shared/components/AppFrame';

export default function EstimateRoutePage() {
  const router = useRouter();
  return (
    <AppFrame>
      <EstimatePage onBack={() => router.back()} />
    </AppFrame>
  );
}
