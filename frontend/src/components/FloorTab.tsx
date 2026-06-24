import React from 'react';
import { Typography } from './UI';
const ChevronDownIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 12.9463L16.073 8.87301C16.2115 8.73468 16.3856 8.66385 16.5952 8.66051C16.8047 8.65735 16.982 8.72818 17.127 8.87301C17.2718 9.01801 17.3442 9.19368 17.3442 9.40001C17.3442 9.60635 17.2718 9.78201 17.127 9.92701L12.6327 14.4213C12.5391 14.5148 12.4403 14.5808 12.3365 14.6193C12.2327 14.6578 12.1205 14.677 12 14.677C11.8795 14.677 11.7673 14.6578 11.6635 14.6193C11.5597 14.5808 11.4609 14.5148 11.3672 14.4213L6.87299 9.92701C6.73465 9.78851 6.66382 9.61443 6.66049 9.40476C6.65732 9.19526 6.72815 9.01801 6.87299 8.87301C7.01799 8.72818 7.19365 8.65576 7.39999 8.65576C7.60632 8.65576 7.78199 8.72818 7.92699 8.87301L12 12.9463Z" fill="currentColor" />
  </svg>
);

const ChevronUpIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 11.0537L7.92701 15.127C7.78851 15.2653 7.61443 15.3362 7.40476 15.3395C7.19526 15.3427 7.01801 15.2718 6.87301 15.127C6.72818 14.982 6.65576 14.8063 6.65576 14.6C6.65576 14.3937 6.72818 14.218 6.87301 14.073L11.3673 9.57874C11.4609 9.48524 11.5597 9.41924 11.6635 9.38074C11.7673 9.34224 11.8795 9.32299 12 9.32299C12.1205 9.32299 12.2327 9.34224 12.3365 9.38074C12.4403 9.41924 12.5391 9.48524 12.6328 9.57874L17.127 14.073C17.2653 14.2115 17.3362 14.3856 17.3395 14.5952C17.3427 14.8047 17.2718 14.982 17.127 15.127C16.982 15.2718 16.8063 15.3442 16.6 15.3442C16.3937 15.3442 16.218 15.2718 16.073 15.127L12 11.0537Z" fill="currentColor" />
  </svg>
);

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
        <ChevronDownIcon className="text-neutral-300 rotate-90 md:rotate-0" />
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
        <ChevronUpIcon className="text-neutral-300 rotate-90 md:rotate-0" />
      </button>

    </div>
  );
};
