import React, { useState } from 'react';
import { ScreenLayout, StepHeader, ActionFooter, ExperienceCard } from '../components';
import { Monitor, Headphones } from '../assets/icons';
import type { ExperienceMode } from '../types';

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
            icon={Monitor}
            isSelected={selectedMode === 'virtual-tour'}
            onClick={() => setSelectedMode('virtual-tour')}
          />

          <ExperienceCard
            title="Design"
            description="Walk through the experience center. Each floor showcases interiors from a different city across India."
            icon={Headphones}
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
