'use client';

import React from 'react';
import { Button } from './Button';

export interface BackButtonProps {
  onClick?: () => void;
  /** Visible text. Defaults to "Back". */
  label?: string;
  className?: string;
}

/**
 * Secondary back-navigation button with a leading reversed chevron.
 * Used across navigation screens and the tour overlay.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
  className = '',
}) => (
  <Button
    variant="secondary"
    onClick={onClick}
    aria-label={label}
    className={`px-element py-tight flex items-center gap-tight ${className}`}
  >
    <img
      src="/assets/icons/default_icon.svg"
      alt=""
      aria-hidden="true"
      className="w-4 h-4 rotate-180 opacity-70"
    />
    <span>{label}</span>
  </Button>
);
