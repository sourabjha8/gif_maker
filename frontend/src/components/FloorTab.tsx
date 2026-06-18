import React from 'react';
import { Typography } from './UI';
import { ChevronUp, ChevronDown } from '../assets/icons';

export interface FloorTabProps {
  floors?: string[];
  activeFloor?: string;
  onFloorSelect?: (floor: string) => void;
  onUpClick?: () => void;
  onDownClick?: () => void;
  className?: string;
}

/**
 * FloorTab Component
 * 
 * Vertical tab navigation for switching between floors (e.g. 4F, 3F, 2F, 1F).
 * Based on Figma node 60:888. Features up/down navigation arrows and a glassmorphic
 * active state system.
 */
export const FloorTab: React.FC<FloorTabProps> = ({
  floors = ['4F', '3F', '2F', '1F'],
  activeFloor = '1F',
  onFloorSelect,
  onUpClick,
  onDownClick,
  className = ''
}) => {
  return (
    <div className={`flex flex-row md:flex-col-reverse items-center gap-2 ${className}`}>

      {/* Down Arrow Button (Left on Mobile, Bottom on Desktop) */}
      <button
        onClick={onDownClick}
        className="order-1 md:order-1 hidden md:flex w-12 h-12 items-center justify-center bg-spatial-glass backdrop-blur-3xl rounded-element border border-spatial-border transition-all hover:bg-spatial-glass-elevated hover:border-spatial-border-elevated active:scale-95"
      >
        <ChevronDown className="text-neutral-300 rotate-90 md:rotate-0" />
      </button>

      {/* Floors Pill Container */}
      <div className="order-2 bg-spatial-glass backdrop-blur-3xl border border-spatial-border rounded-[16px] px-2 py-2 md:py-4 md:px-2 flex flex-row md:flex-col-reverse items-center gap-2 shadow-card w-full md:w-auto">
        {floors.map((floor) => {
          const isActive = floor === activeFloor;

          return (
            <button
              key={floor}
              onClick={() => onFloorSelect?.(floor)}
              className={`
                flex-1 md:flex-none h-8 md:h-12 md:w-12 flex items-center justify-center rounded-pill md:rounded-element transition-all
                ${isActive
                  ? 'border border-primary-300 bg-[linear-gradient(180deg,rgba(130,211,247,0.2)_0%,rgba(130,211,247,0.08)_100%)] shadow-[0_0_8px_rgba(130,211,247,0.3)]'
                  : 'border border-transparent text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                }
              `}
            >
              <Typography
                variant={isActive ? "titleSmall" : "bodyMedium"}
                weight={isActive ? 'semiBold' : 'medium'}
                colorClass={isActive ? 'text-primary-300' : ''} // If not active, button text color cascades
              >
                {floor}
              </Typography>
            </button>
          );
        })}
      </div>

      {/* Up Arrow Button (Right on Mobile, Top on Desktop) */}
      <button
        onClick={onUpClick}
        className="order-3 hidden md:flex w-12 h-12 items-center justify-center bg-spatial-glass backdrop-blur-3xl rounded-element border border-spatial-border transition-all hover:bg-spatial-glass-elevated hover:border-spatial-border-elevated active:scale-95"
      >
        <ChevronUp className="text-neutral-300 rotate-90 md:rotate-0" />
      </button>

    </div>
  );
};
