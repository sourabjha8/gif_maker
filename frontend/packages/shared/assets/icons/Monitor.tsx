import React from 'react';
import { IconProps } from './types';

export const Monitor: React.FC<IconProps> = ({ size = 28, ...props }) => (
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
    <rect x="3" y="4" width="22" height="15" rx="2" />
    <line x1="10" y1="22" x2="18" y2="22" />
    <line x1="14" y1="19" x2="14" y2="22" />
  </svg>
);
