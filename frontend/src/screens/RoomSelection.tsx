import React, { useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, LoadingOverlay, RoomCard } from '../components';
import { getNavRooms, getDefaultSociety } from '../lib/content';
import type { Society } from '../types';

export interface RoomSelectionProps {
  onBack?: () => void;
  onExplore?: (roomId?: string) => void;
  society?: Society;
  cityName?: string;
  stateName?: string;
  country?: string;
}

/**
 * Room Selection Screen
 *
 * Final step before experience. Based on Figma node 107:379.
 * Shows a grid of rooms for the selected society.
 */
export const RoomSelection: React.FC<RoomSelectionProps> = ({
  onBack,
  onExplore,
  society = getDefaultSociety(),
  cityName = 'Gurugram',
  stateName = 'Haryana',
  country = 'India',
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const rooms = getNavRooms();

  const handleExplore = () => {
    setIsLoading(true);
    // Simulate project setup delay
    setTimeout(() => {
      onExplore?.(selectedRoom || undefined);
    }, 2500);
  };

  return (
    <ScreenLayout>
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <StepHeader
          currentStep={4}
          totalSteps={4}
          label="Room Selection"
        >
          <div className="flex items-center gap-element">
            <div className="w-12 h-12 rounded-element bg-neutral-800 border border-spatial-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={society.logo}
                alt={`${society.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <Typography variant="h2" className="font-bold text-white text-2xl md:text-h2">
                {society.name}
              </Typography>
              <div className="flex items-center gap-1 min-w-0">
                <img
                  src="/assets/icons/default_icon.svg"
                  alt="location"
                  className="w-4 h-4 opacity-50"
                />
                <Typography variant="bodySmall" className="font-normal text-neutral-400 text-sm md:text-bodySmall truncate whitespace-nowrap">
                  {society.address}
                  <span className="mx-2 text-neutral-600">·</span>
                  {stateName}, {country}
                </Typography>
              </div>
            </div>
          </div>
        </StepHeader>

        {/* ─── Divider ─── */}
        <div className="w-full h-px bg-spatial-border mt-group mb-group" />

        {/* ─── Room Grid ─── */}
        <div className="flex flex-col gap-element px-2">
          <Typography variant="bodyMedium" className="font-normal text-neutral-400 mb-2">
            Tap a room to explore
          </Typography>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-element overflow-y-auto custom-scrollbar pr-2 pb-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={selectedRoom === room.id}
                onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <ActionFooter
        onBack={onBack}
        onPrimaryAction={handleExplore}
        primaryLabel="Explore"
        isLoading={isLoading}
      />

      <LoadingOverlay isVisible={isLoading} />
    </ScreenLayout>
  );
};
