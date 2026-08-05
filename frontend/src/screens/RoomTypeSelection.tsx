import React, { useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, RoomCard } from '../components';
import { getNavRoomTypes } from '../lib/content';

export interface RoomTypeSelectionProps {
  onBack?: () => void;
  onContinue?: (roomTypeId: string) => void;
}

/**
 * Room Type Selection Screen
 *
 * Step 2 of 4 (Design Flow).
 * Allows user to pick a category of room to explore.
 */
export const RoomTypeSelection: React.FC<RoomTypeSelectionProps> = ({
  onBack,
  onContinue,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const roomTypes = getNavRoomTypes();

  return (
    <ScreenLayout>
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <StepHeader
          currentStep={2}
          totalSteps={4}
          label="Room Selection"
          title="Select Room Type"
          description="Choose the type of space you'd like to explore across different designs."
        />

        {/* ─── Divider ─── */}
        <div className="w-full h-px bg-spatial-border mt-group mb-group" />

        {/* ─── Room Type Grid ─── */}
        <div className="flex flex-col gap-element px-2">
          <Typography variant="bodyMedium" className="font-normal text-neutral-400 mb-2">
            Tap a room type to continue
          </Typography>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-element overflow-y-auto custom-scrollbar pr-2 pb-4">
            {roomTypes.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={selectedType === room.id}
                onClick={() => {
                  setSelectedType(room.id);
                  onContinue?.(room.id);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <ActionFooter onBack={onBack} showPrimary={false} />
    </ScreenLayout>
  );
};
