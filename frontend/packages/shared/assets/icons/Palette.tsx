import React from 'react';
import { IconProps } from './types';

export const Palette: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10c0-1.1-.9-2-2-2h-2a2 2 0 0 1 0-4 2 2 0 0 0 2-2 8 8 0 0 0-8-2z" />
    <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="11" r="1" fill="currentColor" stroke="none" />
  </svg>
);
