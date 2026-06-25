import React, { useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, LoadingOverlay } from '../components';
const LayersIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M182.92-394.85q-11.76-8.92-11.65-23.42.12-14.5 11.89-23.81 8.3-6.07 18.23-6.07 9.92 0 18.23 6.07l252.69 195.54q3.46 2.69 7.69 2.69t7.69-2.69l252.69-195.54q8.31-6.07 18.23-6.07 9.93 0 18.23 6.07 11.77 9.31 11.89 23.81.11 14.5-11.65 23.42L524.38-198.7q-20.07 15.47-44.38 15.47-24.31 0-44.38-15.47l-252.7-196.15Zm252.7 18.77-210-163.23q-27.93-21.69-27.93-56.84 0-35.16 27.93-56.85l210-163.23q20.07-15.46 44.38-15.46 24.31 0 44.38 15.46l210 163.23q27.93 21.69 27.93 56.85 0 35.15-27.93 56.84l-210 163.23q-20.07 15.46-44.38 15.46-24.31 0-44.38-15.46Zm52.07-47.84 209.62-162.62q5-3.84 5-9.61t-5-9.62L487.69-768.38q-3.46-2.7-7.69-2.7t-7.69 2.7L262.69-605.77q-5 3.85-5 9.62t5 9.61l209.62 162.62q3.46 2.69 7.69 2.69t7.69-2.69ZM480-596.15Z" />
  </svg>
);

const PaletteIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M479.23-100q-77.77 0-146.92-29.96-69.16-29.96-120.77-81.58-51.62-51.61-81.58-120.96T100-480q0-79.15 30.77-148.5t83.58-120.65q52.8-51.31 123.54-81.08Q408.62-860 488.77-860q75 0 142.15 25.58 67.16 25.58 117.96 70.81 50.81 45.23 80.96 107.5Q860-593.85 860-521.08q0 103.85-61.73 162.46Q736.54-300 640-300h-72.46q-17.08 0-27.31 11.15Q530-277.69 530-262.46q0 18.54 15 38.54T560-178q0 39.61-21.92 58.81Q516.15-100 479.23-100Zm.77-380Zm-184.31 15.69Q310-478.62 310-500q0-21.38-14.31-35.69Q281.38-550 260-550q-21.38 0-35.69 14.31Q210-521.38 210-500q0 21.38 14.31 35.69Q238.62-450 260-450q21.38 0 35.69-14.31Zm120-160Q430-638.62 430-660q0-21.38-14.31-35.69Q401.38-710 380-710q-21.38 0-35.69 14.31Q330-681.38 330-660q0 21.38 14.31 35.69Q358.62-610 380-610q21.38 0 35.69-14.31Zm200 0Q630-638.62 630-660q0-21.38-14.31-35.69Q601.38-710 580-710q-21.38 0-35.69 14.31Q530-681.38 530-660q0 21.38 14.31 35.69Q558.62-610 580-610q21.38 0 35.69-14.31Zm120 160Q750-478.62 750-500q0-21.38-14.31-35.69Q721.38-550 700-550q-21.38 0-35.69 14.31Q650-521.38 650-500q0 21.38 14.31 35.69Q678.62-450 700-450q21.38 0 35.69-14.31ZM479.23-160q9.77 0 15.27-4.81T500-178q0-14-15-31.46t-15-54.69q0-42.77 29-69.31T570-360h70q70.62 0 115.31-41.38Q800-442.77 800-521.08q0-121.38-93.08-200.15Q613.85-800 488.77-800q-137.15 0-232.96 93T160-480q0 133 93.5 226.5T479.23-160Z" />
  </svg>
);

const CrownIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M246.54-180q-12.75 0-21.38-8.63-8.62-8.63-8.62-21.38 0-12.76 8.62-21.37 8.63-8.62 21.38-8.62h466.92q12.75 0 21.38 8.63 8.62 8.63 8.62 21.38 0 12.76-8.62 21.37-8.63 8.62-21.38 8.62H246.54Zm29.54-127.69q-26.31 0-46.31-16.89-20-16.88-25-42.8L160.92-621q-2 .38-4.5.69-2.5.31-4.5.31Q130-620 115-635.14q-15-15.15-15-36.78 0-21.96 15-37.33 15-15.36 36.95-15.36 21.94 0 37.3 15.36 15.37 15.37 15.37 37.33 0 5.58-.93 10.37-.92 4.78-2.92 9.01l117.69 50.23q3.85 1.54 7.69.39 3.85-1.16 6.54-4.62l116.54-158.69q-9.84-6.85-15.88-18.02-6.04-11.17-6.04-24.06 0-21.95 15.36-37.32Q458.03-860 479.98-860q21.94 0 37.33 15.35 15.38 15.34 15.38 37.27 0 13.15-6.04 24.23-6.04 11.07-15.88 17.92l116.54 158.69q2.69 3.46 6.54 4.62 3.84 1.15 7.69-.39l117.69-50.23q-1.54-4.09-2.69-9.01-1.16-4.91-1.16-10.37 0-21.96 15-37.33 15-15.36 36.95-15.36 21.94 0 37.31 15.36Q860-693.88 860-671.92q0 21.57-15.39 36.75Q829.22-620 807.23-620q-1.76 0-3.96-.5-2.19-.5-4.38-.5l-43.66 253.62q-5 25.92-25 42.8-20 16.89-46.31 16.89H276.08Zm.38-60h407.08q4.23 0 7.69-2.69 3.46-2.7 4.23-6.93l35.62-196.62-66 26.93q-23.31 9.84-47.39 3.5-24.07-6.35-39.23-27.19L480-705.92l-98.46 135.23q-15.16 20.84-39.23 27.19-24.08 6.34-47.39-3.5l-66-26.93 35.62 196.62q.77 4.23 4.23 6.93 3.46 2.69 7.69 2.69Zm203.54 0Z" />
  </svg>
);

const ExpandIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M690-350h-90q-12.77 0-21.38 8.62Q570-332.77 570-320t8.62 21.38Q587.23-290 600-290h113.85q15.46 0 25.8-10.35Q750-310.69 750-326.15V-440q0-12.77-8.62-21.38Q732.77-470 720-470t-21.38 8.62Q690-452.77 690-440v90ZM270-610h90q12.77 0 21.38-8.62Q390-627.23 390-640t-8.62-21.38Q372.77-670 360-670H246.15q-15.46 0-25.8 10.35Q210-649.31 210-633.85V-520q0 12.77 8.62 21.38Q227.23-490 240-490t21.38-8.62Q270-507.23 270-520v-90Zm-97.69 430Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31Zm0-60h615.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H172.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM160-240v-480 480Z" />
  </svg>
);
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
  design: PaletteIcon,
  module: LayersIcon,
  luxury: CrownIcon,
  size: ExpandIcon,
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
