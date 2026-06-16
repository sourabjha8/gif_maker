import React from 'react';
import { IconProps } from './types';

export const Door: React.FC<IconProps> = ({ size = 24, ...props }) => (
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
    <path d="M19 21V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v17" />
    <line x1="3" y1="21" x2="21" y2="21" />
    <circle cx="15" cy="13" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);
