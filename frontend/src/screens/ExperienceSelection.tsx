import React, { useState } from 'react';
import { ScreenLayout, StepHeader, ActionFooter, ExperienceCard } from '../components';
import type { ExperienceMode } from '../types';

const LocationPinIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M480-291q98.62-83.08 149.31-160.54T680-596.69q0-89.23-56-146.27Q568-800 480-800t-144 57.04q-56 57.04-56 146.27 0 67.69 50.69 145.15Q381.38-374.08 480-291Zm-22.14 53.58q-10.92-3.81-20.01-11.43-108.77-91.3-163.31-178.69Q220-514.92 220-596.69q0-115.39 72.62-189.35Q365.23-860 480-860t187.38 73.96Q740-712.08 740-596.69q0 81.77-54.54 168.96-54.54 87.19-163.32 178.71-9.22 7.79-20.06 11.6-10.85 3.8-22.08 3.8-11.23 0-22.14-3.8Zm22.21-290.27q29.85 0 51.04-21.26 21.2-21.26 21.2-51.12 0-29.85-21.26-51.04-21.26-21.2-51.12-21.2-29.85 0-51.04 21.26-21.2 21.26-21.2 51.12 0 29.85 21.26 51.04 21.26 21.2 51.12 21.2ZM250-100q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q237.25-160 250-160h460q12.75 0 21.37 8.63 8.63 8.63 8.63 21.38 0 12.76-8.63 21.37Q722.75-100 710-100H250Zm230-500Z" />
  </svg>
);

const DesignHouseIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M286.15-180q-29.92 0-51.11-21.19-21.19-21.2-21.19-51.12v-291.77L120-473.46q-10.54 7.31-22.31 6.19-11.77-1.12-19.46-11.65-7.69-10.54-6.27-22.31 1.43-11.77 11.96-19.46L436-787.23q9.85-7.23 21-10.65 11.15-3.43 23-3.43t23 3.43q11.15 3.42 21 10.65l122.92 92.69v-36.61q0-20.39 14.23-34.62Q675.38-780 695.77-780q20.38 0 34.61 14.23t14.23 34.62v110.92l131.85 99.54q9.92 7.69 11.65 19.46 1.73 11.77-5.96 22.31-7.69 10.53-19.46 11.65-11.77 1.12-22.31-6.19l-93.84-70.62v291.77q0 29.92-21.19 51.12Q704.15-180 674.23-180h-77.31q-29.92 0-51.11-21.19-21.19-21.2-21.19-51.12v-140q0-5.38-3.47-8.84-3.46-3.47-8.84-3.47h-64.62q-5.38 0-8.84 3.47-3.47 3.46-3.47 8.84v140q0 29.92-21.19 51.12Q393-180 363.08-180h-76.93Zm0-60h76.93q5.38 0 8.84-3.46 3.47-3.46 3.47-8.85v-140q0-29.92 21.19-51.11 21.19-21.19 51.11-21.19h64.62q29.92 0 51.11 21.19 21.19 21.19 21.19 51.11v140q0 5.39 3.47 8.85 3.46 3.46 8.84 3.46h77.31q5.39 0 8.85-3.46t3.46-8.85v-337L487.31-739q-3.08-2.31-7.31-2.31-4.23 0-7.31 2.31L273.85-589.31v337q0 5.39 3.46 8.85t8.84 3.46Zm117.7-319.38h152.3q0-30.08-22.84-49.43-22.85-19.34-53.31-19.34t-53.31 19.34q-22.84 19.35-22.84 49.43ZM480-480Z" />
  </svg>
);

export interface ExperienceSelectionProps {
  onContinue?: (mode: ExperienceMode) => void;
}

/**
 * Experience Selection Screen
 *
 * Step 1 of 4 — "Choose Your Experience"
 * Based on Figma node 357:407.
 */
export const ExperienceSelection: React.FC<ExperienceSelectionProps> = ({ onContinue }) => {
  const [selectedMode, setSelectedMode] = useState<ExperienceMode | null>(null);

  return (
    <ScreenLayout>
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
        <StepHeader
          currentStep={1}
          totalSteps={4}
          label="Experience Selection"
          title="Choose Your Experience"
        >
          <p className="block md:hidden font-normal text-neutral-300 text-sm leading-relaxed">
            Explore curated interior projects across India's finest cities.
          </p>
          <p className="hidden md:block font-normal text-neutral-300 text-sm md:text-bodyLarge leading-relaxed max-w-[505px]">
            Explore curated interior projects across India's finest cities. Select a location to begin your immersive walkthrough experience.
          </p>
        </StepHeader>

        {/* Experience Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-element mt-group pb-4">
          <ExperienceCard
            title="City"
            description="Select a floor on the building, pick a project, and explore interiors on the large-screen TV in immersive 3D."
            icon={LocationPinIcon}
            isSelected={selectedMode === 'virtual-tour'}
            onClick={() => setSelectedMode('virtual-tour')}
          />

          <ExperienceCard
            title="Design"
            description="Walk through the experience center. Each floor showcases interiors from a different city across India."
            icon={DesignHouseIcon}
            isSelected={selectedMode === 'walk-around'}
            onClick={() => setSelectedMode('walk-around')}
          />
        </div>
      </div>

      <ActionFooter
        showBack={false}
        primaryLabel="Continue"
        onPrimaryAction={() => selectedMode && onContinue?.(selectedMode)}
        isPrimaryDisabled={!selectedMode}
      />
    </ScreenLayout>
  );
};
