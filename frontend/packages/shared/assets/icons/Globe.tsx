import React from 'react';
import { IconProps } from './types';

export const Globe: React.FC<IconProps> = ({ size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="8" cy="8" r="6.5" />
    <path d="M1.5 8h13" />
    <path d="M8 1.5c1.66 1.72 2.6 4 2.6 6.5s-.94 4.78-2.6 6.5c-1.66-1.72-2.6-4-2.6-6.5s.94-4.78 2.6-6.5z" />
  </svg>
);
