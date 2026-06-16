import React, { useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, SocietyCard } from '../components';
import { getNavCityByName, getDefaultCityName } from '../lib/content';
import type { Society } from '../types';

export interface ProjectSelectionProps {
  onBack?: () => void;
  onContinue?: (society: Society) => void;
  onViewOnMap?: (society: Society) => void;
  cityName?: string;
}

/** Societies that have a dolly/floor-plan map experience available. */
const SOCIETIES_WITH_MAP = new Set<string>(['Prestige Kingfisher Towers']);

/**
 * Project Selection Screen
 *
 * Step 3 of 4 — "Project Selection"
 * Based on Figma node 196:913.
 * Shows a list of societies/projects for the selected city.
 */
export const ProjectSelection: React.FC<ProjectSelectionProps> = ({
  onBack,
  onContinue,
  onViewOnMap,
  cityName = getDefaultCityName(),
}) => {
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);

  const projectData = (getNavCityByName(cityName) ?? getNavCityByName(getDefaultCityName()))!;
  const currentSociety = projectData.societies.find((s) => s.name === selectedSociety);

  return (
    <ScreenLayout>
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
        <StepHeader
          currentStep={3}
          totalSteps={4}
          label="Project Selection"
          title={projectData.name}
        >
          <div className="flex items-baseline gap-tight -mt-1">
            <Typography variant="bodyMedium" className="font-normal text-neutral-400 text-sm md:text-bodyMedium">
              {projectData.nameHindi}
            </Typography>
            <span className="mx-2 text-neutral-600">·</span>
            <Typography variant="bodySmall" className="font-normal text-neutral-400 text-sm md:text-bodySmall">
              {projectData.state}, {projectData.country}
            </Typography>
          </div>
        </StepHeader>

        {/* ─── Divider ─── */}
        <div className="w-full h-px bg-spatial-border mt-group" />

        {/* ─── Society List ─── */}
        <div className="flex flex-col gap-element mt-group">
          <Typography variant="bodyMedium" className="font-normal text-neutral-400">
            Select a society
          </Typography>

          <div className="flex flex-col gap-tight">
            {projectData.societies.map((society) => (
              <SocietyCard
                key={society.name}
                society={society}
                isSelected={selectedSociety === society.name}
                onClick={() => setSelectedSociety(society.name)}
                onViewOnMap={
                  SOCIETIES_WITH_MAP.has(society.name)
                    ? () => onViewOnMap?.(society)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>

      <ActionFooter
        onBack={onBack}
        onPrimaryAction={() => currentSociety && onContinue?.(currentSociety)}
        primaryLabel="Continue"
        isPrimaryDisabled={!selectedSociety}
      />
    </ScreenLayout>
  );
};
