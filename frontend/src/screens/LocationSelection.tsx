import React, { useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, FloorTab, CityCard } from '../components';
import { ChevronLeft } from '../assets/icons';
import { getNavFloorLabels, getNavCityByFloor } from '../lib/content';

export interface LocationSelectionProps {
  onBack?: () => void;
  onExplore?: (city: string) => void;
}

/**
 * Location Selection Screen
 *
 * Step 2 of 4 — "Start Your Interior Journey"
 * Based on Figma node 60:682.
 * Shows floor-based city selection with FloorTab navigation.
 */
export const LocationSelection: React.FC<LocationSelectionProps> = ({ onBack, onExplore }) => {
  const floors = getNavFloorLabels();
  const [activeFloor, setActiveFloor] = useState(floors[0]);
  const currentCity = getNavCityByFloor(activeFloor)!;
  const activeFloorIndex = floors.indexOf(activeFloor);

  const handleUpClick = () => {
    if (activeFloorIndex < floors.length - 1) {
      setActiveFloor(floors[activeFloorIndex + 1]);
    }
  };

  const handleDownClick = () => {
    if (activeFloorIndex > 0) {
      setActiveFloor(floors[activeFloorIndex - 1]);
    }
  };

  return (
    <ScreenLayout>
      <StepHeader
        currentStep={2}
        totalSteps={4}
        label="Location Selection"
        title="Start Your Interior Journey"
      >
        <p className="block md:hidden font-normal text-neutral-300 text-sm leading-relaxed">
          Select a location to begin your experience.
        </p>
        <p className="hidden md:block font-normal text-neutral-300 text-sm md:text-bodyLarge leading-relaxed max-w-[505px]">
          Select a location to begin your immersive walkthrough experience.
        </p>
      </StepHeader>

      {/* ─── Main Content: FloorTab + City Card ─── */}
      <div className="flex flex-col md:flex-row gap-element md:gap-group mt-element md:mt-group flex-1 min-h-0 flex-shrink-0 md:h-full">
        {/* Left: Floor Tab Navigation */}
        <div className="flex-shrink-0 md:h-full">
          <FloorTab
            floors={floors}
            activeFloor={activeFloor}
            onFloorSelect={setActiveFloor}
            onUpClick={handleUpClick}
            onDownClick={handleDownClick}
            className="flex-row md:flex-col w-full md:w-auto h-auto md:h-full justify-center md:justify-start"
          />
        </div>

        {/* Right: Content Area */}
        <div className="flex-1 flex flex-col gap-element min-w-0">
          {/* Floor Pagination Bar */}
          <div className="hidden md:flex items-center justify-between bg-spatial-glass-elevated border border-spatial-border rounded-element px-element py-3">
            <div className="flex items-center gap-element">
              {/* Floor Number */}
              <div className="flex items-center gap-tight">
                <ChevronLeft size={12} className="text-primary-400" />
                <Typography variant="titleLarge" className="font-bold text-white">
                  {activeFloor.replace('F', '')}
                </Typography>
              </div>
              {/* Dot indicators */}
              <div className="flex items-center gap-tight">
                {floors.map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setActiveFloor(floor)}
                    className={`rounded-pill transition-all duration-200 ${floor === activeFloor
                      ? 'w-4 h-[6px] bg-primary-400'
                      : 'w-[6px] h-[6px] bg-neutral-600 hover:bg-neutral-500'
                      }`}
                  />
                ))}
              </div>
            </div>
            <Typography variant="bodySmall" className="font-medium text-neutral-500 uppercase tracking-wider">
              ARRIVED
            </Typography>
          </div>

          <CityCard city={currentCity} floorLabel={`FLOOR ${activeFloor.replace('F', '')}`} className="flex-1 min-h-0 min-w-0" />
        </div>
      </div>

      <ActionFooter
        onBack={onBack}
        onPrimaryAction={() => onExplore?.(currentCity.name)}
        primaryLabel={`Explore ${currentCity.name}`}
      />
    </ScreenLayout>
  );
};
