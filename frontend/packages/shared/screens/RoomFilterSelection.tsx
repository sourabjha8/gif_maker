import React, { useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, LoadingOverlay } from '../components';
import { Settings, Layout, Award, Maximize } from '../assets/icons';
import { getFilterGroups, getDefaultFilters } from '../lib/content';

export interface RoomFilterSelectionProps {
  onBack?: () => void;
  onExplore?: (filters: Record<string, string>) => void;
}

/**
 * Maps a filter group id to its icon component. Icons are React
 * components, so they live in code; the group data (label/options)
 * comes from the validated content source.
 */
const FILTER_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  design: Layout,
  module: Settings,
  luxury: Award,
  size: Maximize,
};

/**
 * Room Filter Selection Screen
 *
 * Step 3 of 4 (Design Flow).
 * Allows user to refine their selection with specific design parameters.
 */
export const RoomFilterSelection: React.FC<RoomFilterSelectionProps> = ({
  onBack,
  onExplore,
}) => {
  const [selections, setSelections] = useState<Record<string, string>>(getDefaultFilters());
  const [isLoading, setIsLoading] = useState(false);
  const filterGroups = getFilterGroups();

  const handleExplore = () => {
    setIsLoading(true);
    // Simulate design setup delay
    setTimeout(() => {
      onExplore?.(selections);
    }, 2500);
  };

  const handleSelect = (groupId: string, option: string) => {
    setSelections((prev) => ({ ...prev, [groupId]: option }));
  };

  return (
    <ScreenLayout>
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <StepHeader
          currentStep={3}
          totalSteps={4}
          label="Refine Design"
          title="Refine Your Selection"
          description="Customize your experience by applying filters to find the perfect room design."
        />

        {/* ─── Divider ─── */}
        <div className="w-full h-px bg-spatial-border mt-group mb-group" />

        {/* ─── Filter Sections ─── */}
        <div className="flex flex-col gap-group px-2 pb-6">
          {filterGroups.map((group) => {
            const Icon = FILTER_ICONS[group.id];
            return (
              <div key={group.id} className="flex flex-col gap-element">
                <div className="flex items-center gap-tight">
                  <div className="p-1.5 rounded-element bg-primary-500/10 border border-primary-500/20">
                    <Icon size={16} className="text-primary-400" />
                  </div>
                  <Typography variant="titleSmall" className="text-neutral-300 uppercase tracking-wider font-semibold">
                    {group.label}
                  </Typography>
                </div>

                <div className="flex flex-wrap gap-tight">
                  {group.options.map((option) => {
                    const isSelected = selections[group.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(group.id, option)}
                        className={`
                          px-element py-2 rounded-element font-sans font-medium text-bodyMedium transition-all duration-300 cursor-pointer border
                          ${isSelected
                            ? 'bg-primary-500/20 border-primary-400 text-primary-300 shadow-[0_0_12px_rgba(63,189,241,0.2)]'
                            : 'bg-spatial-glass border-spatial-border text-neutral-400 hover:border-spatial-border-elevated hover:text-neutral-200'
                          }
                        `}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ActionFooter
        onBack={onBack}
        onPrimaryAction={handleExplore}
        primaryLabel="Explore Design"
        isLoading={isLoading}
      />

      <LoadingOverlay isVisible={isLoading} message="Setting up your design..." />
    </ScreenLayout>
  );
};
