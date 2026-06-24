import React from 'react';
import { Typography } from './UI';
const LocationPinIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M480-291q98.62-83.08 149.31-160.54T680-596.69q0-89.23-56-146.27Q568-800 480-800t-144 57.04q-56 57.04-56 146.27 0 67.69 50.69 145.15Q381.38-374.08 480-291Zm-22.14 53.58q-10.92-3.81-20.01-11.43-108.77-91.3-163.31-178.69Q220-514.92 220-596.69q0-115.39 72.62-189.35Q365.23-860 480-860t187.38 73.96Q740-712.08 740-596.69q0 81.77-54.54 168.96-54.54 87.19-163.32 178.71-9.22 7.79-20.06 11.6-10.85 3.8-22.08 3.8-11.23 0-22.14-3.8Zm22.21-290.27q29.85 0 51.04-21.26 21.2-21.26 21.2-51.12 0-29.85-21.26-51.04-21.26-21.2-51.12-21.2-29.85 0-51.04 21.26-21.2 21.26-21.2 51.12 0 29.85 21.26 51.04 21.26 21.2 51.12 21.2ZM250-100q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q237.25-160 250-160h460q12.75 0 21.37 8.63 8.63 8.63 8.63 21.38 0 12.76-8.63 21.37Q722.75-100 710-100H250Zm230-500Z" />
  </svg>
);
import type { City } from '../types';

/** @deprecated Use `City` from `types/` instead. */
export type CityData = City;

export interface CityCardProps {
  city: City;
  floorLabel: string;
  className?: string;
}

export const CityCard: React.FC<CityCardProps> = ({ city, floorLabel, className = '' }) => {
  return (
    <div className={`rounded-card overflow-hidden border border-spatial-border bg-spatial-glass-elevated flex flex-col ${className}`}>
      {/* Image Header */}
      <div className="relative h-[110px] md:h-[148px] overflow-hidden flex-shrink-0">
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay on Image */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
        {/* City Name Overlay */}
        <div className="absolute bottom-3 left-4 flex items-baseline gap-tight">
          <Typography variant="h2" className="font-bold text-white drop-shadow-md">
            {city.name}
          </Typography>
          <Typography variant="bodyMedium" className="font-normal text-neutral-300/70">
            {city.nameHindi}
          </Typography>
        </div>
      </div>

      {/* Info Footer */}
      <div className="px-element py-element md:px-element md:py-element flex flex-col gap-tight md:gap-element flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Location + Project Count */}
        <div className="flex items-center gap-tight">
          <LocationPinIcon size={12} className="text-primary-400" />
          <Typography variant="bodySmall" className="font-normal text-neutral-300">
            {city.state} {city.country}
          </Typography>
          <span className="text-neutral-600 mx-1">·</span>
          <Typography variant="bodySmall" className="font-normal text-neutral-400">
            {city.projectCount} curated projects
          </Typography>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-tight flex-wrap">
          {city.tags.map((tag, index) => (
            <span
              key={tag}
              className={`px-tight py-1 rounded-pill border border-spatial-border bg-spatial-glass-elevated text-sm md:text-bodySmall text-neutral-300 font-normal ${index >= 2 ? 'hidden md:inline' : ''}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
