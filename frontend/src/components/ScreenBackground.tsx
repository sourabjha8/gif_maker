import React from 'react';

export const ScreenBackground: React.FC = () => (
  <>
    {/* Background Image Layer */}
    <img
      src="/assets/images/background.png"
      alt="Interior Background"
      className="absolute inset-0 w-full h-full object-cover z-0"
    />

    {/* Dark Ambient Overlay */}
    <div className="absolute inset-0 w-full h-full z-10 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.15)_0%,_rgba(0,0,0,0.55)_100%)]" />

    {/* Cinematic Linear Overlay */}
    <div className="absolute inset-0 w-full h-full z-[11] bg-[linear-gradient(180deg,_rgba(0,0,10,0.7)_0%,_transparent_30%,_transparent_70%,_rgba(0,0,10,0.9)_100%)]" />
  </>
);
