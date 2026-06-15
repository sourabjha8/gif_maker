import React from 'react';
import { IconProps } from './types';

export const ChevronUp: React.FC<IconProps> = ({ size = 24, ...props }) => (
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
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);
