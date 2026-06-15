'use client';

import React, { useState } from 'react';
import { Typography, LoadingOverlay } from '../components';
import { MapPin } from '../assets/icons';

export interface DollyScreenProps {
  onBack?: () => void;
  onSelectRoom?: (roomSlug: string) => void;
  cityName?: string;
  societyName?: string;
}

interface RoomLabel {
  x: number;
  y: number;
  name: string;
  roomSlug?: string;
}

const ROOM_LABELS: RoomLabel[] = [
  { x: 26, y: 68, name: 'Living Room', roomSlug: 'living-room' },
  { x: 64, y: 30, name: 'Bedroom', roomSlug: 'bedroom' },
  { x: 41, y: 42, name: 'Kitchen' },
  { x: 20, y: 32, name: 'Bathroom' },
  { x: 53, y: 58, name: 'Dining' },
  { x: 78, y: 40, name: 'Guest Bedroom' },
  { x: 82, y: 72, name: 'Balcony' },
  { x: 48, y: 78, name: 'Foyer' },
];

export const DollyScreen: React.FC<DollyScreenProps> = ({
  onBack,
  onSelectRoom,
  societyName = 'Prestige Kingfisher Towers',
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleHotspotClick = (roomSlug: string) => {
    setSelected(roomSlug);
    setIsLoading(true);
    setTimeout(() => {
      onSelectRoom?.(roomSlug);
    }, 600);
  };

  return (
    <div className="absolute inset-0 bg-spatial-bg overflow-hidden">
      {/* Dollhouse image */}
      <img
        src="/assets/Bangalore/Dolly Image/image (4).png"
        alt={`${societyName} dollhouse`}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />

      {/* Room hotspot labels layer */}
      <div className="absolute inset-0">
        {ROOM_LABELS.map((label) => {
          const interactive = !!label.roomSlug;
          const isHovered = hovered === label.name;
          const isSelected = selected === label.roomSlug;

          return (
            <button
              key={label.name}
              type="button"
              onMouseEnter={() => setHovered(label.name)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(label.name)}
              onBlur={() => setHovered(null)}
              onClick={interactive ? () => handleHotspotClick(label.roomSlug!) : undefined}
              disabled={!interactive}
              aria-label={interactive ? `Enter ${label.name}` : `${label.name} (preview only)`}
              style={{ left: `${label.x}%`, top: `${label.y}%` }}
              className={`
                absolute -translate-x-1/2 -translate-y-1/2
                flex flex-col items-center gap-1
                transition-all duration-300
                ${interactive ? 'cursor-pointer' : 'cursor-default'}
                ${isHovered && interactive ? 'scale-110' : 'scale-100'}
              `}
            >
              {/* Pin icon */}
              {interactive ? (
                <span className="relative flex items-center justify-center">
                  {/* Pulse ring */}
                  <span
                    className={`
                      absolute w-10 h-10 rounded-full
                      bg-primary-500/30 animate-ping
                      ${isSelected ? 'opacity-100' : 'opacity-70'}
                    `}
                  />
                  {/* MapPin icon */}
                  <span
                    className={`
                      relative flex items-center justify-center
                      w-7 h-7 rounded-full
                      bg-primary-500 border-2 border-white
                      shadow-[0_0_12px_rgba(23,168,229,0.8)]
                      text-white
                    `}
                  >
                    <MapPin size={14} />
                  </span>
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-white/40 border border-white/30" />
              )}

              {/* Label chip */}
              <span
                className={`
                  px-2.5 py-1 rounded-pill whitespace-nowrap
                  backdrop-blur-3xl border
                  transition-colors duration-200
                  ${interactive
                    ? isHovered
                      ? 'bg-primary-500/90 border-primary-400 text-white shadow-card'
                      : 'bg-spatial-glass border-spatial-border-elevated text-neutral-50'
                    : 'bg-black/40 border-white/10 text-neutral-400'
                  }
                `}
              >
                <Typography
                  variant="bodySmall"
                  weight={interactive ? 'semiBold' : 'medium'}
                  colorClass={interactive ? (isHovered ? 'text-white' : 'text-neutral-50') : 'text-neutral-400'}
                  className="text-xs leading-none"
                >
                  {label.name}
                </Typography>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Floating chrome ─────────────────────────────────────── */}

      {/* Logo — top-left */}
      <div className="absolute top-5 left-5 md:top-container md:left-container z-10">
        <img
          src="/assets/icons/logo.svg"
          alt="Virtual XP"
          className="h-10 w-auto object-contain"
          draggable={false}
        />
      </div>

      {/* Project name pill — top-center, 40px tall */}
      <div className="absolute top-5 md:top-container left-1/2 -translate-x-1/2 z-10">
        <div className="h-10 flex items-center px-element rounded-pill bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-card">
          <Typography
            variant="titleSmall"
            weight="semiBold"
            colorClass="text-neutral-50"
            className="leading-none whitespace-nowrap"
          >
            {societyName}
          </Typography>
        </div>
      </div>

      {/* Close button — top-right */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Close floor plan and go back"
        className="
          absolute top-5 right-5 md:top-container md:right-container z-10
          w-11 h-11 flex items-center justify-center
          rounded-pill
          bg-spatial-glass backdrop-blur-3xl
          border border-spatial-border shadow-card
          text-neutral-50
          transition-all duration-300
          hover:border-spatial-border-elevated hover:bg-white/10
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-primary-500
        "
      >
        <img
          src="/assets/icons/default_icon.svg"
          alt=""
          aria-hidden="true"
          className="w-5 h-5 opacity-80"
          draggable={false}
        />
      </button>

      {/* Bottom hint
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="px-3 py-1.5 rounded-pill bg-spatial-glass backdrop-blur-3xl border border-spatial-border text-neutral-200 shadow-element">
          <Typography variant="bodySmall" className="text-xs leading-none">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 align-middle" />
            Bedroom & Living Room available · more rooms coming soon
          </Typography>
        </span>
      </div> */}

      <LoadingOverlay isVisible={isLoading} message="Loading Environment..." />
    </div>
  );
};
