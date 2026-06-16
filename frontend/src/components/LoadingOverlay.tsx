import React from 'react';
import { Typography } from './UI';

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

/**
 * LoadingOverlay: A full-screen overlay for transitions.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Setting up your project...',
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-group">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        
        {/* Loading Text */}
        <Typography variant="titleLarge" className="text-white font-medium tracking-wide animate-pulse">
          {message}
        </Typography>
      </div>
    </div>
  );
};
