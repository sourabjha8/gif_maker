import React from 'react';
import { IconProps } from './types';

export const Images: React.FC<IconProps> = ({ size = 24, ...props }) => (
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
    <rect x="2" y="2" width="14" height="14" rx="2" ry="2" />
    <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    <path d="M2 12l3.5-3.5 4 4 3-3 3 3" />
    <rect x="6" y="6" width="16" height="16" rx="2" ry="2" opacity="0.4" />
  </svg>
);
