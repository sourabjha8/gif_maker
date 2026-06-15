import React from 'react';
import { IconProps } from './types';

export const ChevronDown: React.FC<IconProps> = ({ size = 24, ...props }) => (
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
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
