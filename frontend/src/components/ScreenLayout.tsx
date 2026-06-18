import React from 'react';
import { GlassContainer } from './UI';
import { ScreenBackground } from './ScreenBackground';

interface ScreenLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * ScreenLayout: Provides the base structural wrap for all experience screens.
 * Includes background, centering logic, and the main GlassContainer.
 */
export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-spatial-bg font-sans flex items-center justify-center ${className}`}>
      <ScreenBackground />

      {/* Main Glass Container — top padding clears the fixed navbar on mobile */}
      <div className="relative z-20 w-full h-full max-w-[1080px] mx-auto pt-[86px] px-element pb-element md:pt-container md:px-container md:pb-container flex flex-col justify-center">
        <GlassContainer
          radius="container"
          className={`w-full max-h-full flex flex-col animate-reveal p-element md:p-container overflow-hidden ${containerClassName}`}
        >
          {children}
        </GlassContainer>
      </div>
    </div>
  );
};
