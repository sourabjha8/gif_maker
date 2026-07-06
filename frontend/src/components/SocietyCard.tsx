import React from 'react';
import { Typography } from './UI';
import type { Society } from '../types';

/** @deprecated Use `Society` from `types/` instead. */
export type SocietyData = Society;

export interface SocietyCardProps {
  society: Society;
  isSelected: boolean;
  onClick: () => void;
  /** When provided, the "View on Map" button is shown; otherwise it is omitted entirely. */
  onViewOnMap?: () => void;
  /** Opens a project-details view for this society. */
  onProjectDetails?: () => void;
}

/**
 * SocietyCard: A selectable card showing a society/project with logo, name, BHK badge,
 * address, and quick actions ("View on Map" / "Project details").
 * Reusable across any list-based selection screen.
 */
export const SocietyCard: React.FC<SocietyCardProps> = ({
  society,
  isSelected,
  onClick,
  onViewOnMap,
  onProjectDetails,
}) => {
  const hasMap = !!onViewOnMap;
  const hasDetails = !!onProjectDetails;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isSelected}
      className={`
        relative w-full flex flex-col gap-element p-element rounded-card transition-all duration-200 cursor-pointer text-left
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-spatial-bg
        ${isSelected
          ? 'bg-[rgba(130,211,247,0.08)] border border-primary-400 shadow-[0_0_0_1px_rgba(23,168,229,0.15),0_4px_20px_rgba(23,168,229,0.15)]'
          : 'bg-spatial-glass-elevated border border-spatial-border hover:border-spatial-border-elevated hover:bg-[rgba(255,255,255,0.06)]'
        }
      `}
    >
      {/* Society Info */}
      <div className="flex items-center gap-element">
        {/* Society Logo */}
        <div className="w-12 h-12 rounded-element bg-neutral-800 border border-spatial-border flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src={society.logo}
            alt={`${society.name} logo`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {/* Name + BHK badge */}
          <div className="flex items-center gap-tight">
            <Typography variant="titleMedium" className="font-bold text-white text-sm md:text-titleMedium md:truncate">
              {society.name}
            </Typography>
            <span className="px-tight py-0.5 rounded-pill bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs md:text-bodySmall font-medium whitespace-nowrap">
              {society.bhk}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1">
            <img
              src="/assets/icons/default_icon.svg"
              alt=""
              className="w-4 h-4 opacity-50"
            />
            <Typography variant="bodySmall" className="font-normal text-neutral-400 truncate">
              {society.address}
            </Typography>
          </div>
        </div>
      </div>

      {/* Actions — revealed once the card is selected, only for actions that actually work on this card */}
      {isSelected && (hasMap || hasDetails) && (
        <div className="flex items-center gap-tight">
          {hasMap && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewOnMap?.();
              }}
              className="flex flex-1 items-center justify-center gap-tight h-11 min-w-0 px-element rounded-pill font-sans font-bold text-bodyMedium transition-all duration-200 cursor-pointer bg-primary-500 text-white hover:bg-primary-400"
            >
              <img src="/assets/icons/default_icon.svg" alt="" className="w-4 h-4" />
              <span className="truncate">View on Map</span>
            </button>
          )}

          {hasDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onProjectDetails?.();
              }}
              className={`
                flex items-center justify-center h-11 px-element rounded-pill font-sans transition-all duration-200 cursor-pointer whitespace-nowrap
                ${hasMap
                  ? 'flex-shrink-0 border border-spatial-border bg-transparent text-neutral-300 font-medium text-bodyMedium hover:border-spatial-border-elevated hover:text-white'
                  : 'flex-1 bg-primary-500 text-white font-bold text-bodyMedium hover:bg-primary-400'
                }
              `}
            >
              Project details
            </button>
          )}
        </div>
      )}
    </div>
  );
};
