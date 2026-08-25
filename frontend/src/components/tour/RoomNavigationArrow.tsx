'use client';

import React, { useState } from 'react';

export interface RoomNavigationArrowProps {
  /** Name of the room this arrow leads to. Rendered as a permanent label — never a hover tooltip. */
  destinationName: string;
  /** Screen-space anchor point, in pixels, for the arrow's center. */
  position: { x: number; y: number };
  /** In-plane rotation, in degrees, orienting the arrow toward its doorway (0 = pointing away from camera). */
  rotation: number;
  onNavigate?: (destinationName: string) => void;
}

/**
 * A chevron-trail that reads as lying flat on the ground plane and receding
 * toward a doorway, built by tilting a stack of chevrons back with
 * `rotateX` rather than letting them face the camera like a normal marker.
 */
export const RoomNavigationArrow: React.FC<RoomNavigationArrowProps> = ({
  destinationName,
  position,
  rotation,
  onNavigate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleNavigate = () => {
    if (onNavigate) onNavigate(destinationName);
    else console.log(`RoomNavigationArrow: onNavigate("${destinationName}")`);
  };

  const emphasis = isActive ? 0.92 : isHovered ? 1.1 : 1;
  const baseOpacity = isActive ? 0.95 : isHovered ? 0.95 : 0.55;
  const glow = isHovered || isActive;

  return (
    <button
      type="button"
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onPointerDown={() => setIsActive(true)}
      onPointerUp={() => setIsActive(false)}
      aria-label={`Go to ${destinationName}`}
      className="absolute flex flex-col items-center border-none bg-transparent p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Rotated toward the doorway; perspective lives here so the tilt below reads as 3D. */}
      <div style={{ transform: `rotate(${rotation}deg)`, perspective: '480px' }}>
        <div
          className="flex flex-col items-center -space-y-3"
          style={{
            transform: `rotateX(58deg) scale(${emphasis})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          {[0, 1, 2].map((i) => (
            <img
              key={i}
              src="/assets/icons/chevron_up.svg"
              alt=""
              aria-hidden
              className="w-10 h-10"
              style={{
                opacity: Math.max(baseOpacity - i * 0.18, 0.08),
                filter: glow ? 'drop-shadow(0 0 6px rgba(23,168,229,0.65))' : 'none',
                transition: 'opacity 0.2s ease, filter 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Destination label — always visible, part of the hotspot, not a tooltip. */}
      <span
        className="mt-1 whitespace-nowrap font-sans text-xs font-semibold text-neutral-50"
        style={{
          textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)',
          opacity: glow ? 1 : 0.85,
          transition: 'opacity 0.2s ease',
        }}
      >
        {destinationName}
      </span>
    </button>
  );
};
