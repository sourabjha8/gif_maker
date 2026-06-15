import React from 'react';

/** Shared props interface for all SVG icon components. */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}
