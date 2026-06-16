'use client';

import { useRouter } from 'next/navigation';
import { LoginScreen } from '@shared/screens/LoginScreen';
import { AppFrame } from '@shared/components/AppFrame';

export default function LoginPage() {
  const router = useRouter();
  return (
    <AppFrame>
      <LoginScreen onContinue={() => router.push('/choose')} />
    </AppFrame>
  );
}
