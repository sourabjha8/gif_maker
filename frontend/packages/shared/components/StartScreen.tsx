import React from 'react';
import { tokens } from '../tokens';
import { Button } from './Button';
import { Stack, Typography } from './UI';

/**
 * Start Experience Screen
 * 
 * Landing frame component extracted from Virtual XP Figma (45:800).
 * Implements a responsive viewport covering the browser, incorporating
 * layered backgrounds, typography tokens, and the precise CTA button.
 */
export const StartScreen: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: tokens.colors.spatial.bgBase,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: tokens.typography.fontFamily,
      }}
    >
      {/* Background Image Layer */}
      <img
        src="/assets/images/background.png"
        alt="Luxury Interior Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Dark Ambient Overlay (Glassmorphism inspired base cover) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to top, rgba(10, 10, 15, 0.85) 0%, rgba(18, 18, 18, 0.4) 60%, rgba(10, 10, 15, 0.8) 100%)',
          zIndex: 1,
        }}
      />

      {/* Main Content Container Layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '680px',
          width: '100%',
          padding: `0 ${tokens.spacing.container}px`, // Responsive side padding
        }}
      >
        {/* Logo Container */}
        <div style={{ marginBottom: '64px' }}>
          <img
            src="/assets/icons/logo.svg"
            alt="Interior Company Logo"
            style={{
              width: '160px',
              height: 'auto',
              objectFit: 'contain',
              // Fallback styling just in case the SVG is missing or black
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))'
            }}
          />
        </div>

        {/* Content Box */}
        <Stack gap="group" align="center" style={{ width: '100%' }}>

          <Stack gap="tight" align="center">
            <Typography variant="h1" weight="bold" color="#FFFFFF" style={{ letterSpacing: '-0.5px' }}>
              Welcome to Interior Company
            </Typography>
            <Typography variant="titleLarge" weight="medium" color={tokens.colors.primary.blue[300]}>
              by Square Yards
            </Typography>
          </Stack>

          <Typography
            variant="bodyLarge"
            weight="regular"
            color={tokens.colors.neutral.greys[200]}
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: '1.6',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)'
            }}
          >
            Step into a cinematic walkthrough of India's most exquisite interiors.
            Explore luxury residences, handpicked materials, and world-class design — all in immersive 3D.
          </Typography>

          <div style={{ marginTop: `${tokens.spacing.group}px` }}>
            {/* Incorporating the strictly built Button with the rightIcon trigger */}
            <Button
              label="Begin Experience"
              size="medium"
              variant="primary"
              rightIcon
              style={{ padding: `0 32px` }}
            />
          </div>

        </Stack>
      </div>
    </div>
  );
};
