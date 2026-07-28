import React, { useEffect, useMemo, useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, RoomCard, LoadingOverlay } from '../components';
import { getFilterGroups, getMatchingVariants } from '../lib/content';
import type { RoomVariant, Room } from '../types';

export interface RoomFilterSelectionProps {
  /** The room type chosen on the previous screen (e.g. "living-room"). */
  roomTypeId: string;
  onBack?: () => void;
  onExplore?: (filters: Record<string, string>) => void;
}

/** Maps a filter group id to its icon asset — reuses existing icon files per the icon rule, never authored inline. */
const FILTER_ICONS: Record<string, string> = {
  design: '/assets/icons/pallete.svg',
  module: '/assets/icons/layers.svg',
  luxury: '/assets/icons/crown.svg',
  size: '/assets/icons/aspect_ratio_24dp_E8EAED_FILL0_wght300_GRAD0_opsz24.svg',
};

/** Adapts a real content RoomVariant into the shape RoomCard expects. */
function variantToCard(variant: RoomVariant): Room {
  return {
    id: variant.slug,
    name: variant.name,
    image: variant.panorama.lowUrl ?? variant.panorama.midUrl ?? variant.panorama.url ?? '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
    assets: variant.materials?.map((m) => m.material),
  };
}

/**
 * Room Filter Selection Screen
 *
 * Step 3 of 4 (Design Flow).
 * A horizontal filter bar up top narrows the room-design grid below it live —
 * refining by style/module/luxury/size and choosing a specific room design
 * happen on this one screen.
 */
export const RoomFilterSelection: React.FC<RoomFilterSelectionProps> = ({
  roomTypeId,
  onBack,
  onExplore,
}) => {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const filterGroups = getFilterGroups();

  const matchingVariants = useMemo(
    () => getMatchingVariants(roomTypeId, selections),
    [roomTypeId, selections]
  );
  const hasActiveFilters = Object.keys(selections).length > 0;

  // Deselect a variant the moment a filter change hides it from the grid.
  useEffect(() => {
    if (selectedVariantId && !matchingVariants.some((v) => v.slug === selectedVariantId)) {
      setSelectedVariantId(null);
    }
  }, [matchingVariants, selectedVariantId]);

  const handleToggleFilter = (groupId: string, option: string) => {
    setSelections((prev) => {
      if (prev[groupId] === option) {
        const { [groupId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [groupId]: option };
    });
  };

  const clearFilters = () => setSelections({});

  const handleExplore = () => {
    const variant = matchingVariants.find((v) => v.slug === selectedVariantId);
    if (!variant) return;
    setIsLoading(true);
    // Simulate design setup delay
    setTimeout(() => {
      const filters: Record<string, string> = {};
      if (variant.designStyle) filters.designStyle = variant.designStyle;
      if (variant.moduleType) filters.moduleType = variant.moduleType;
      if (variant.luxuryLevel) filters.luxuryLevel = variant.luxuryLevel;
      if (variant.roomSize) filters.roomSize = variant.roomSize;
      onExplore?.(filters);
    }, 2500);
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
          description="Filter by style and preference, then tap the room design you'd like to explore."
        />

        {/* ─── Divider ─── */}
        <div className="w-full h-px bg-spatial-border mt-group mb-group" />

        {/* ─── Horizontal Filter Bar ─── */}
        <div className="flex flex-col gap-tight px-2 mb-group">
          <div className="flex items-center justify-between">
            <Typography variant="titleSmall" className="text-neutral-300 uppercase tracking-wider font-semibold">
              Refine Your Selection
            </Typography>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element"
              >
                <Typography variant="bodySmall" className="text-primary-400 underline">
                  Clear filters
                </Typography>
              </button>
            )}
          </div>

          <div className="flex items-center gap-group overflow-x-auto custom-scrollbar pb-2">
            {filterGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-tight flex-shrink-0 pr-group border-r border-spatial-border last:border-r-0 last:pr-0"
              >
                <img src={FILTER_ICONS[group.id]} alt="" className="w-4 h-4 opacity-70 flex-shrink-0" />
                <div className="flex gap-tight">
                  {group.options.map((option) => {
                    const isSelected = selections[group.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleToggleFilter(group.id, option)}
                        aria-pressed={isSelected}
                        className={`
                          whitespace-nowrap px-element py-2 rounded-pill font-sans font-medium text-bodySmall transition-all duration-300 cursor-pointer border
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
            ))}
          </div>
        </div>

        {/* ─── Room Design Grid ─── */}
        <div className="flex flex-col gap-element px-2">
          {matchingVariants.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-tight py-12">
              <Typography variant="bodyMedium" className="text-neutral-400">
                No room designs match the selected filters.
              </Typography>
              <button
                type="button"
                onClick={clearFilters}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element"
              >
                <Typography variant="bodySmall" className="text-primary-400 underline">
                  Clear filters
                </Typography>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-element overflow-y-auto custom-scrollbar pr-2 pb-4 animate-fade-in">
              {matchingVariants.map((variant) => (
                <RoomCard
                  key={variant.slug}
                  room={variantToCard(variant)}
                  isSelected={selectedVariantId === variant.slug}
                  onClick={() => setSelectedVariantId(variant.slug === selectedVariantId ? null : variant.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ActionFooter
        onBack={onBack}
        onPrimaryAction={handleExplore}
        primaryLabel="Explore Design"
        isPrimaryDisabled={!selectedVariantId}
        isLoading={isLoading}
      />

      <LoadingOverlay isVisible={isLoading} message="Setting up your design..." />
    </ScreenLayout>
  );
};
