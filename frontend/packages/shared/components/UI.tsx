import React from 'react';

/**
 * UI Components for Virtual XP
 * 
 * A collection of global, scalable UI primitives that adhere to the 
 * spatial design system, now powered by Tailwind CSS.
 */

// --- Types ---

type Spacing = 'container' | 'group' | 'element' | 'tight' | 'tiny';
type Radius = 'container' | 'card' | 'element' | 'pill';

interface BaseProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // Optional fallback styling
}

// Map spacing tokens to our Tailwind gap classes
const gapClassMap: Record<Spacing, string> = {
  container: 'gap-container',
  group: 'gap-group',
  element: 'gap-element',
  tight: 'gap-tight',
  tiny: 'gap-1', // 4px
};

// --- Layout Components ---

/**
 * Stack: A primitive for vertical and horizontal layouts.
 */
export const Stack: React.FC<BaseProps & {
  direction?: 'row' | 'column';
  gap?: Spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}> = ({ direction = 'column', gap = 'element', align, justify, children, className = '', style }) => {
  const flexDir = direction === 'row' ? 'flex-row' : 'flex-col';
  const flexGap = gapClassMap[gap as Spacing] || 'gap-element';

  // Basic alignment mappings for Tailwind
  const alignMap: Record<string, string> = {
    'flex-start': 'items-start',
    'center': 'items-center',
    'flex-end': 'items-end',
    'stretch': 'items-stretch'
  };

  const justifyMap: Record<string, string> = {
    'flex-start': 'justify-start',
    'center': 'justify-center',
    'flex-end': 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around'
  };

  const alignClass = align ? alignMap[align] : '';
  const justifyClass = justify ? justifyMap[justify] : '';

  return (
    <div
      className={`flex ${flexDir} ${flexGap} ${alignClass} ${justifyClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Radius map 
const radiusMap: Record<Radius, string> = {
  container: 'rounded-container',
  card: 'rounded-card',
  element: 'rounded-element',
  pill: 'rounded-pill',
};

/**
 * GlassContainer: The core spatial UI element with glassmorphism effects.
 */
export const GlassContainer: React.FC<BaseProps & {
  variant?: 'base' | 'elevated';
  radius?: Radius;
}> = ({ variant = 'base', radius = 'container', children, className = '', style }) => {
  const bgClass = variant === 'base' ? 'bg-spatial-glass' : 'bg-spatial-glass-elevated';
  const borderClass = variant === 'base' ? 'border-spatial-border' : 'border-spatial-border-elevated';
  const shadowClass = variant === 'base' ? 'shadow-card' : 'shadow-modal';
  const radiusClass = radiusMap[radius as Radius] || 'rounded-container';

  return (
    <div
      className={`${bgClass} backdrop-blur-3xl border ${borderClass} ${radiusClass} ${shadowClass} text-neutral-50 ${className.match(/\bp-\d+/) || className.match(/\bp-\[/) ? '' : 'p-container'} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

// --- Typography ---

type TextVariant = 'h1' | 'h2' | 'h3' | 'titleLarge' | 'titleMedium' | 'titleSmall' | 'bodyLarge' | 'bodyMedium' | 'bodySmall' | 'cta';
type TextWeight = 'bold' | 'semiBold' | 'medium' | 'regular';

// Ensure consistent mapping
const variantMap: Record<TextVariant, string> = {
  h1: 'text-h2 md:text-h1 leading-tight',
  h2: 'text-2xl md:text-h2 leading-tight',
  h3: 'text-xl md:text-h3 leading-snug',
  titleLarge: 'text-base md:text-titleLarge leading-snug',
  titleMedium: 'text-sm md:text-titleMedium leading-snug',
  titleSmall: 'text-[13px] md:text-titleSmall leading-snug',
  bodyLarge: 'text-sm md:text-bodyLarge leading-relaxed',
  bodyMedium: 'text-sm md:text-bodyMedium leading-relaxed',
  bodySmall: 'text-sm md:text-bodySmall leading-normal',
  cta: 'text-sm md:text-cta leading-tight',
};

const weightMap: Record<TextWeight, string> = {
  bold: 'font-bold',
  semiBold: 'font-semibold',
  medium: 'font-medium',
  regular: 'font-normal',
};

export const Typography: React.FC<BaseProps & {
  variant?: TextVariant;
  weight?: TextWeight;
  colorClass?: string; // e.g. text-neutral-200
  color?: string; // Fallback inline color
}> = ({ variant = 'bodyMedium', weight = 'regular', colorClass, color, children, className = '', style }) => {

  const vClass = variantMap[variant as TextVariant] || variantMap.bodyMedium;
  const wClass = weightMap[weight as TextWeight] || weightMap.regular;
  const cClass = colorClass || (color ? '' : 'text-neutral-200');

  return (
    <div
      className={`font-sans ${vClass} ${wClass} ${cClass} ${className}`}
      style={{
        ...style,
        ...(color && { color }) // apply inline color if colorClass isn't provided
      }}
    >
      {children}
    </div>
  );
};
