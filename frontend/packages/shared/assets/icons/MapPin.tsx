import React from 'react';
import { IconProps } from './types';

export const MapPin: React.FC<IconProps> = ({ size = 12, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="currentColor"
    {...props}
  >
    <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5C2.5 7.25 6 11 6 11C6 11 9.5 7.25 9.5 4.5C9.5 2.57 7.93 1 6 1ZM6 5.75C5.31 5.75 4.75 5.19 4.75 4.5C4.75 3.81 5.31 3.25 6 3.25C6.69 3.25 7.25 3.81 7.25 4.5C7.25 5.19 6.69 5.75 6 5.75Z" />
  </svg>
);
