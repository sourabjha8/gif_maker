import React from 'react';
import { Button, Stack, Typography } from '../components';

/**
 * Start Experience Screen
 * 
 * Landing frame component extracted from Virtual XP Figma (45:800).
 */
export interface StartScreenProps {
  onBegin?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onBegin }) => {
  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-spatial-bg flex items-center justify-center font-sans">

      {/* Background Image Layer */}
      <img
        src="/assets/images/background.png"
        alt="Luxury Interior Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Dark Ambient Overlay (Glassmorphism inspired base cover) */}
      <div className="absolute inset-0 w-full h-full z-10 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.15)_0%,_rgba(0,0,0,0.55)_100%)] animate-ambient-blur" />

      {/* Cinematic Linear Overlay */}
      <div className="absolute inset-0 w-full h-full z-11 bg-[linear-gradient(180deg,_rgba(0,0,10,0.7)_0%,_transparent_30%,_transparent_70%,_rgba(0,0,10,0.9)_100%)] animate-fade-in" />

      {/* Main Content Container Layer */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-[680px] w-full px-6 md:px-container">

        {/* Logo Container */}
        <div className="mb-8 md:mb-16 animate-reveal">
          <img
            src="/assets/icons/logo.svg"
            alt="Interior Company Logo"
            className="w-[120px] md:w-[160px] h-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Content Box */}
        <Stack gap="group" align="center" className="w-full">
          <Stack gap="tight" align="center">
            <Typography variant="h1" className="font-bold text-white tracking-[-0.5px] animate-reveal opacity-0 [animation-delay:150ms]">
              Welcome to Interior Company
            </Typography>
            <Typography variant="titleLarge" className="font-medium text-primary-300 animate-reveal opacity-0 [animation-delay:250ms]">
              by Square Yards
            </Typography>
          </Stack>

          <Typography
            variant="bodyLarge"
            className="font-normal text-neutral-200 max-w-[520px] mx-auto opacity-0 drop-shadow-md animate-reveal [animation-delay:400ms]"
          >
            Step into a cinematic walkthrough of India's most exquisite interiors.
            Explore luxury residences, handpicked materials, and world-class design — all in immersive 3D.
          </Typography>

          <div className="animate-reveal opacity-0 [animation-delay:550ms]">
            <Button
              label="Begin Experience"
              onClick={onBegin}
              size="medium"
              variant="primary"
              rightIcon
              rightIconSrc="/assets/icons/arrow_forward.svg"
              className="px-8 shadow-card hover:shadow-modal"
            />
          </div>
        </Stack>
      </div>
    </div>
  );
};
