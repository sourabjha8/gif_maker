import React from 'react';
import { Typography } from './UI';
import type { Society } from '../types';

/** @deprecated Use `Society` from `types/` instead. */
export type SocietyData = Society;

export interface SocietyCardProps {
  society: Society;
  isSelected: boolean;
  onClick: () => void;
  /** When provided, a "View on Map" link is shown on hover. */
  onViewOnMap?: () => void;
}

/**
 * SocietyCard: A selectable row showing a society/project with logo, name, BHK badge, and address.
 * Reusable across any list-based selection screen.
 */
export const SocietyCard: React.FC<SocietyCardProps> = ({ society, isSelected, onClick, onViewOnMap }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group w-full flex items-center gap-element p-tight rounded-element transition-all duration-200 cursor-pointer text-left
        ${isSelected
          ? 'bg-[rgba(130,211,247,0.08)] border border-primary-400/40'
          : 'bg-spatial-glass-elevated border border-spatial-border hover:border-spatial-border-elevated hover:bg-[rgba(255,255,255,0.06)]'
        }
      `}
    >
      {/* Society Logo */}
      <div className="w-12 h-12 rounded-element bg-neutral-800 border border-spatial-border flex items-center justify-center overflow-hidden flex-shrink-0">
        <img
          src={society.logo}
          alt={`${society.name} logo`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Society Info */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        {/* Name + BHK badge */}
        <div className="flex items-center gap-tight">
          <Typography variant="titleMedium" className="font-bold text-white truncate">
            {society.name}
          </Typography>
          <span className="px-tight py-0.5 rounded-pill bg-primary-500/20 border border-primary-400/30 text-primary-300 text-sm md:text-bodySmall font-medium whitespace-nowrap">
            {society.bhk}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1">
          <img
            src="/assets/icons/default_icon.svg"
            alt="location"
            className="w-4 h-4 opacity-50"
          />
          <Typography variant="bodySmall" className="font-normal text-neutral-400 truncate">
            {society.address}
          </Typography>
        </div>
      </div>

      {/* View on Map — visible on hover, only when handler is provided */}
      {onViewOnMap && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewOnMap();
          }}
          className="ml-auto flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-primary-300 hover:text-primary-200"
          aria-label="View on map"
        >
          <img
            src="/assets/icons/map.svg"
            alt=""
            className="w-4 h-4"
          />
          <span className="text-xs font-medium whitespace-nowrap">View on Map</span>
        </a>
      )}
    </button>
  );
};
