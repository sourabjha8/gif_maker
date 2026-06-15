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
    <div className={`relative w-screen h-screen overflow-hidden bg-spatial-bg font-sans flex items-center justify-center ${className}`}>
      <ScreenBackground />

      {/* Main Glass Container */}
      <div className="relative z-20 w-full h-full max-w-[1080px] mx-auto p-4 md:px-container md:py-container flex flex-col justify-center">
        <GlassContainer
          radius="container"
          className={`w-full max-h-full flex flex-col animate-reveal p-4 md:p-container overflow-hidden ${containerClassName}`}
        >
          {children}
        </GlassContainer>
      </div>
    </div>
  );
};
