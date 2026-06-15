/**
 * Virtual XP Design Tokens
 * 
 * Scalable design tokens derived from the Virtual XP Design System.
 * These tokens are platform-agnostic where possible.
 */

export const tokens = {
  colors: {
    primary: {
      blue: {
        50: '#F1F9FE',
        100: '#E1F2FD',
        200: '#BDE6FA',
        300: '#82D3F7',
        400: '#3FBDF1',
        500: '#17A8E5',
        600: '#0A85BF',
        700: '#09699B',
        800: '#0C5A80',
        900: '#104A6A',
        950: '#0B2F46',
      },
    },
    neutral: {
      greys: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#f0f0f0',
        300: '#d9d9d9',
        400: '#bfbfbf',
        500: '#8c8c8c',
        600: '#595959',
        700: '#434343',
        800: '#3f434a',
        900: '#1f1f1f',
        950: '#16171a',
      },
    },
    spatial: {
      bgBase: '#1f1f1f',
      bgGlassBase: 'rgba(18, 18, 18, 0.6)',
      bgGlassElevated: 'rgba(255, 255, 255, 0.05)',
      borderGlass: 'rgba(255, 255, 255, 0.1)',
      borderElevated: 'rgba(255, 255, 255, 0.2)',
      borderActive: '#17A8E5', // primary blue 500
      glowGlass: 'rgba(255, 255, 255, 0.2)',
    },
  },
  
  spacing: {
    container: 40,
    group: 24,
    element: 16,
    tight: 8,
  },

  radius: {
    container: 32,
    card: 24,
    element: 12,
    pill: 100,
  },

  blur: {
    standard: 24,
  },

  typography: {
    fontFamily: 'Open Sans, sans-serif',
    size: {
      h1: 40,
      h2: 32,
      h3: 24,
      titleLarge: 18,
      titleMedium: 16,
      titleSmall: 14,
      bodyLarge: 16,
      bodyMedium: 14,
      bodySmall: 12,
      cta: 14,
    },
    weight: {
      bold: '700',
      semiBold: '600',
      medium: '500',
      regular: '400',
    },
    lineHeight: {
      h1: 48,
      h2: 38,
      h3: 29,
      titleLarge: 26,
      titleMedium: 24,
      titleSmall: 22,
      bodyLarge: 24,
      bodyMedium: 22,
      bodySmall: 18,
      cta: 22,
    },
  },

  shadows: {
    modal: '0 8px 32px rgba(0, 0, 0, 0.4)',
    card: '0 4px 16px rgba(0, 0, 0, 0.16)',
    element: '0 2px 4px rgba(0, 0, 0, 0.08)',
  },
};

export type Tokens = typeof tokens;
