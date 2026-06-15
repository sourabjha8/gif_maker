import React from 'react';
import { IconProps } from './types';

export const Headphones: React.FC<IconProps> = ({ size = 28, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 18v-4a10 10 0 1 1 20 0v4" />
    <rect x="2" y="18" width="4" height="7" rx="1" />
    <rect x="22" y="18" width="4" height="7" rx="1" />
  </svg>
);
