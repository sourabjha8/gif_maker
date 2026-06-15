import React from 'react';
import { Typography } from './UI';
import type { Room } from '../types';

/** @deprecated Use `Room` from `types/` instead. */
export type RoomData = Room;

export interface RoomCardProps {
  room: Room;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * RoomCard: A selectable card showing a room preview image and name.
 * Used in RoomSelection screen to pick an area of a project to explore.
 */
export const RoomCard: React.FC<RoomCardProps> = ({ room, isSelected, onClick }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`
        relative w-full h-0 pb-[70%] rounded-element overflow-hidden group border transition-all duration-300 cursor-pointer text-left
        ${isSelected
          ? 'border-primary-400 shadow-[0_0_16px_rgba(63,189,241,0.4)]'
          : 'border-transparent hover:border-spatial-border-elevated'
        }
      `}
    >
      {/* Background Image */}
      <img
        src={room.image}
        alt={room.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Top Left Icon Container */}
      <div className="absolute top-element left-element w-8 h-8 rounded-element bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center">
        <img src={room.icon} alt="icon" className="w-4 h-4 opacity-70" />
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-element left-element right-element">
        <Typography variant="titleMedium" className="font-bold text-white drop-shadow-md truncate">
          {room.name}
        </Typography>
      </div>

      {/* Selection Glow Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary-500/10 pointer-events-none animate-fade-in" />
      )}
    </div>
  );
};
