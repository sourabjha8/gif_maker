'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './Navbar';

export interface AppFrameProps {
  /** Show the global navbar (matches the former ScreenRouter showNavbar rule). */
  withNavbar?: boolean;
  children: React.ReactNode;
}

/**
 * Route-level chrome. Reproduces the wrapper the old single-page
 * ScreenRouter rendered around every screen: a full-viewport relative
 * container with the global Navbar shown on the appropriate screens.
 *
 * Sign-out returns to the start route (the former RESET + goTo('start')).
 * The estimate store persists independently, so it is intentionally left
 * untouched here — matching the previous behaviour.
 */
export const AppFrame: React.FC<AppFrameProps> = ({ withNavbar = false, children }) => {
  const router = useRouter();

  return (
    <div className="relative w-screen h-dvh overflow-hidden">
      {withNavbar && <Navbar onSignOut={() => router.push('/')} />}
      <div className="w-full h-full">{children}</div>
    </div>
  );
};
