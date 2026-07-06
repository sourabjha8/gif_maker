import React, { useState } from 'react';
import { Button, Stack, GlassContainer, TextBox } from '../components';

export interface LoginScreenProps {
  onContinue?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinue }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-spatial-bg flex items-center justify-center font-sans">

      {/* Background Image Layer */}
      <img
        src="/assets/images/background.png"
        alt="Luxury Interior Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Dark Ambient Overlay */}
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

        {/* Login Form Box */}
        <GlassContainer className="w-full max-w-[400px] animate-reveal opacity-0 [animation-delay:50ms]">
          <Stack gap="group" className="w-full text-left">
            <Stack gap="element" className="w-full">
              <TextBox
                label="Email"
                type="email"
                placeholder="Type your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextBox
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
            </Stack>

            <div className="mt-2">
              <Button
                label="Continue"
                onClick={onContinue}
                size="medium"
                variant="primary"
                disabled={false}
                className="w-full shadow-card hover:shadow-modal"
              />
            </div>
          </Stack>
        </GlassContainer>
      </div>
    </div>
  );
};
