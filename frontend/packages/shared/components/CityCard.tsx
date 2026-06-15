import React from 'react';
import { Typography } from './UI';
import { MapPin } from '../assets/icons';
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
        {/* Floor Badge */}
        <div className="absolute top-3 left-4 bg-primary-500/90 backdrop-blur-sm rounded-element px-3 py-1">
          <Typography variant="bodySmall" className="font-bold text-white uppercase tracking-wider text-[12px] md:text-bodySmall">
            {floorLabel}
          </Typography>
        </div>
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
      <div className="px-3 py-3 md:px-element md:py-element flex flex-col gap-2 md:gap-element flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Location + Project Count */}
        <div className="flex items-center gap-tight">
          <MapPin size={12} className="text-primary-400" />
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
          {city.tags.map((tag) => (
            <span
              key={tag}
              className="px-tight py-1 rounded-pill border border-spatial-border bg-spatial-glass-elevated text-sm md:text-bodySmall text-neutral-300 font-normal"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
