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

/** Max asset names listed before collapsing the rest into a "+N more" line. */
const MAX_VISIBLE_ASSETS = 4;

/** Placeholder asset names shown until real per-room asset data is wired up. */
const DEMO_ASSETS = ['Sofa Set', 'Coffee Table', 'Wall Panel', 'Floor Lamp', 'TV Unit'];

/**
 * RoomCard: A selectable card showing a room preview image and name.
 * Used in RoomSelection screen to pick an area of a project to explore.
 * On hover, the heading slides up beside the icon and the room's assets appear as a bullet list.
 */
export const RoomCard: React.FC<RoomCardProps> = ({ room, isSelected, onClick }) => {
  const assets = room.assets && room.assets.length > 0 ? room.assets : DEMO_ASSETS;
  const visibleAssets = assets.slice(0, MAX_VISIBLE_ASSETS);
  const remainingCount = assets.length - visibleAssets.length;

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

      {/* Gradient Overlay for text readability — darkens further on hover for a more obvious transition */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-colors duration-300 group-hover:from-black/90 group-hover:via-black/70 group-hover:to-black/30 pointer-events-none" />

      {/* Top Left Icon + Heading + Asset list (rises up beside the icon on hover) */}
      <div className="hidden md:flex flex-col absolute top-element left-element right-element">
        <div className="flex items-center gap-tight">
          <div className="flex-shrink-0 w-8 h-8 rounded-element bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <img src={room.icon} alt="" className="w-4 h-4 opacity-70" />
          </div>
          <Typography
            variant="titleMedium"
            className="font-bold text-white drop-shadow-md truncate opacity-0 translate-y-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0"
          >
            {room.name}
          </Typography>
        </div>

        {/* Asset list — 16px below the icon/heading row, revealed on hover */}
        {assets.length > 0 && (
          <div className="mt-4 opacity-0 translate-y-4 transition-all duration-300 ease-out delay-75 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
            <ul className="flex flex-col gap-0.5">
              {visibleAssets.map((asset) => (
                <li key={asset} className="flex items-center gap-1.5 text-neutral-200">
                  <span className="w-1 h-1 rounded-full bg-primary-400 flex-shrink-0" />
                  <span className="text-[12px] leading-[18px] font-normal truncate">{asset}</span>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <span className="block text-[12px] leading-[18px] font-medium text-primary-300 mt-0.5">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Text — fades out on hover as the heading rises to the top */}
      <div className="absolute bottom-1 left-2 right-2 md:bottom-element md:left-element md:right-element transition-all duration-300 ease-out md:group-hover:opacity-0 md:group-hover:-translate-y-3">
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
