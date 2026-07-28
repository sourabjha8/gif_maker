import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Typography, ScreenLayout, StepHeader, ActionFooter, LoadingOverlay } from '../components';
import { getRoomVariantFacets, filterRoomVariants } from '../lib/content';
import type { VariantFacet, VariantFacetKey } from '../lib/content';
import type { RoomVariant } from '../types';

export interface RoomFilterSelectionProps {
  /** The room type chosen on the previous screen (e.g. "living-room"). */
  roomTypeId: string;
  onBack?: () => void;
  onExplore?: (filters: Record<string, string>) => void;
}

type Selections = Partial<Record<VariantFacetKey, string[]>>;

/** Which facets get their own quick-access dropdown pill in the bar. */
const QUICK_FACETS: VariantFacetKey[] = ['designStyle', 'moduleType'];

/** Options above this count get a search field inside the popover. */
const SEARCH_THRESHOLD = 8;

const FALLBACK_THUMB = '/assets/images/background.png';

/** Single lowercase token → Title Case (handles multi-word values too). */
function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

function thumbnailFor(variant: RoomVariant): string {
  return variant.panorama.lowUrl ?? variant.panorama.midUrl ?? variant.panorama.url ?? FALLBACK_THUMB;
}

function countSelected(selections: Selections): number {
  return Object.values(selections).reduce((sum, vals) => sum + (vals?.length ?? 0), 0);
}

// ─── Checkbox row ────────────────────────────────────────────────

const CheckboxRow: React.FC<{ label: string; checked: boolean; onToggle: () => void }> = ({
  label,
  checked,
  onToggle,
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onToggle}
    className={`
      w-full flex items-center gap-tight px-tight py-2 rounded-element text-left min-h-[44px]
      transition-colors duration-200 cursor-pointer
      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
      ${checked ? 'bg-primary-500/10' : 'hover:bg-white/5'}
    `}
  >
    <span
      aria-hidden
      className={`
        flex items-center justify-center w-[18px] h-[18px] rounded-[5px] border text-[11px] font-bold leading-none shrink-0
        transition-colors duration-200
        ${checked ? 'bg-primary-500 border-primary-400 text-white' : 'bg-transparent border-spatial-border-elevated text-transparent'}
      `}
    >
      ✓
    </span>
    <Typography variant="bodyMedium" className={checked ? 'text-neutral-100' : 'text-neutral-300'}>
      {label}
    </Typography>
  </button>
);

// ─── Dropdown popover (Style / Package pills) ────────────────────

const FilterPopover: React.FC<{
  facet: VariantFacet;
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}> = ({ facet, selected, onToggle, onClear, onClose }) => {
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  const showSearch = facet.options.length > SEARCH_THRESHOLD;
  const visible = query
    ? facet.options.filter((o) => titleCase(o).toLowerCase().includes(query.toLowerCase()))
    : facet.options;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`${facet.label} filter`}
      className="absolute top-[calc(100%+8px)] left-0 z-[120] w-[min(280px,80vw)] rounded-card bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal p-tight animate-fade-in-down"
    >
      {showSearch && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${facet.label.toLowerCase()}…`}
          autoFocus
          className="w-full mb-tight px-element py-2 rounded-element bg-spatial-glass-elevated border border-spatial-border text-neutral-100 text-bodyMedium placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        />
      )}

      <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
        {visible.length === 0 ? (
          <Typography variant="bodySmall" className="text-neutral-500 px-tight py-3">
            No matches
          </Typography>
        ) : (
          visible.map((option) => (
            <CheckboxRow
              key={option}
              label={titleCase(option)}
              checked={selected.includes(option)}
              onToggle={() => onToggle(option)}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-tight mt-tight pt-tight border-t border-spatial-border">
        <button
          type="button"
          onClick={onClear}
          disabled={selected.length === 0}
          className={`px-element py-2 rounded-pill text-bodySmall font-medium transition-colors ${
            selected.length === 0
              ? 'text-neutral-600 cursor-not-allowed'
              : 'text-neutral-300 hover:text-white cursor-pointer'
          }`}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-element py-2 rounded-pill text-bodySmall font-bold bg-primary-500 text-white hover:bg-primary-400 transition-colors cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

// ─── Filters slide-over drawer ───────────────────────────────────

const DrawerAccordion: React.FC<{
  facet: VariantFacet;
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}> = ({ facet, selected, onToggle, defaultOpen }) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <section className="border-b border-spatial-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-tight py-element min-h-[44px] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element"
      >
        <span className="flex items-center gap-tight">
          <Typography variant="titleSmall" className="text-neutral-200 font-semibold uppercase tracking-wider">
            {facet.label}
          </Typography>
          {selected.length > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[11px] font-bold leading-none">
              {selected.length}
            </span>
          )}
        </span>
        <img
          src="/assets/icons/chevron_down.svg"
          alt=""
          aria-hidden
          className={`w-4 h-4 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-element">
          {facet.options.map((option) => (
            <CheckboxRow
              key={option}
              label={titleCase(option)}
              checked={selected.includes(option)}
              onToggle={() => onToggle(option)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const FiltersDrawer: React.FC<{
  open: boolean;
  facets: VariantFacet[];
  selections: Selections;
  resultCount: number;
  onToggle: (key: VariantFacetKey, value: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}> = ({ open, facets, selections, resultCount, onToggle, onClearAll, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const total = countSelected(selections);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[150] bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!open}
        className={`
          fixed z-[160] top-0 right-0 h-full w-[min(380px,90vw)] flex flex-col
          bg-spatial-glass backdrop-blur-3xl border-l border-spatial-border shadow-modal
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-container py-element border-b border-spatial-border shrink-0">
          <span className="flex items-center gap-tight">
            <Typography variant="titleLarge" className="text-white font-bold">
              Filters
            </Typography>
            {total > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-[11px] font-bold leading-none">
                {total}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-11 h-11 flex items-center justify-center shrink-0 rounded-element border border-spatial-border bg-spatial-glass-elevated text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>

        {/* Accordions */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-container">
          {facets.map((facet, i) => (
            <DrawerAccordion
              key={facet.key}
              facet={facet}
              selected={selections[facet.key] ?? []}
              onToggle={(value) => onToggle(facet.key, value)}
              defaultOpen={i === 0}
            />
          ))}
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-between gap-element px-container py-element border-t border-spatial-border shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            disabled={total === 0}
            className={`px-element py-2.5 rounded-pill text-bodyMedium font-medium transition-colors ${
              total === 0 ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-300 hover:text-white cursor-pointer'
            }`}
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 max-w-[220px] px-group py-2.5 rounded-pill text-bodyMedium font-bold bg-primary-500 text-white hover:bg-primary-400 shadow-card transition-colors cursor-pointer"
          >
            Show {resultCount} design{resultCount === 1 ? '' : 's'}
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── Design result card ──────────────────────────────────────────

const DesignCard: React.FC<{ variant: RoomVariant; selected: boolean; onClick: () => void }> = ({
  variant,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`
      group relative flex flex-col rounded-card overflow-hidden border text-left
      transition-all duration-300 cursor-pointer
      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
      ${selected
        ? 'border-primary-400 shadow-[0_0_20px_rgba(63,189,241,0.35)] -translate-y-1'
        : 'border-spatial-border hover:border-spatial-border-elevated hover:-translate-y-0.5'
      }
    `}
  >
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5">
      <img
        src={thumbnailFor(variant)}
        alt={variant.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

      {/* 360° badge */}
      <span className="absolute top-tight left-tight flex items-center gap-1 pl-1 pr-2 h-6 rounded-pill bg-black/40 backdrop-blur-md border border-white/10">
        <img src="/assets/icons/globe.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-80" />
        <span className="text-[10px] font-bold text-white tracking-wide leading-none">360°</span>
      </span>

      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-tight">
        <Typography variant="titleSmall" className="text-white font-bold drop-shadow-md truncate">
          {variant.name}
        </Typography>
      </div>
    </div>
  </button>
);

// ─── Applied-filter chip ─────────────────────────────────────────

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <button
    type="button"
    onClick={onRemove}
    aria-label={`Remove ${label} filter`}
    className="flex items-center gap-1.5 pl-element pr-2.5 h-9 rounded-pill bg-primary-500/15 border border-primary-400/50 text-primary-200 text-bodySmall font-medium hover:bg-primary-500/25 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  >
    <span>{label}</span>
    <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-2.5 h-2.5 opacity-80" />
  </button>
);

// ─── Filter-bar dropdown pill ────────────────────────────────────

const FilterPill: React.FC<{
  label: string;
  count: number;
  open: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ label, count, open, onClick, children }) => (
  <div className="relative shrink-0">
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={`
        flex items-center gap-tight px-element h-10 rounded-pill border text-bodyMedium font-medium
        transition-all duration-200 cursor-pointer whitespace-nowrap
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        ${count > 0 || open
          ? 'bg-primary-500/15 border-primary-400 text-primary-100'
          : 'bg-spatial-glass border-spatial-border text-neutral-300 hover:border-spatial-border-elevated hover:text-white'
        }
      `}
    >
      <span>{label}</span>
      {count > 0 && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[11px] font-bold leading-none">
          {count}
        </span>
      )}
      <img
        src="/assets/icons/chevron_down.svg"
        alt=""
        aria-hidden
        className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      />
    </button>
    {open && children}
  </div>
);

// ─── Screen ──────────────────────────────────────────────────────

/**
 * Room Filter Selection Screen — Step 3 of 4 (Design Flow).
 *
 * A fixed filter bar (Style / Package quick dropdowns + a Filters drawer for
 * every dimension) narrows a vertically-scrolling grid of the room's real 360°
 * design variants live. An applied-chip row summarises active filters; the
 * pinned footer's CTA stays disabled until a design is chosen.
 */
export const RoomFilterSelection: React.FC<RoomFilterSelectionProps> = ({
  roomTypeId,
  onBack,
  onExplore,
}) => {
  const facets = useMemo(() => getRoomVariantFacets(roomTypeId), [roomTypeId]);
  const facetByKey = useMemo(() => new Map(facets.map((f) => [f.key, f])), [facets]);

  const [selections, setSelections] = useState<Selections>({});
  const [openPill, setOpenPill] = useState<VariantFacetKey | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const results = useMemo(() => filterRoomVariants(roomTypeId, selections), [roomTypeId, selections]);
  const totalSelected = countSelected(selections);
  const hasFilters = totalSelected > 0;

  // Deselect a design the moment a filter change removes it from the grid.
  useEffect(() => {
    if (selectedVariantId && !results.some((v) => v.slug === selectedVariantId)) {
      setSelectedVariantId(null);
    }
  }, [results, selectedVariantId]);

  const toggleValue = (key: VariantFacetKey, value: string) => {
    setSelections((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length === 0) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const clearFacet = (key: VariantFacetKey) =>
    setSelections((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });

  const clearAll = () => setSelections({});

  // Flat list of active (facet, value) pairs for the chip row.
  const activeChips = facets.flatMap((facet) =>
    (selections[facet.key] ?? []).map((value) => ({ key: facet.key, value }))
  );

  const handleExplore = () => {
    const variant = results.find((v) => v.slug === selectedVariantId);
    if (!variant) return;
    setIsLoading(true);
    setTimeout(() => {
      const filters: Record<string, string> = {};
      if (variant.designStyle) filters.designStyle = variant.designStyle;
      if (variant.moduleType) filters.moduleType = variant.moduleType;
      if (variant.luxuryLevel) filters.luxuryLevel = variant.luxuryLevel;
      if (variant.roomSize) filters.roomSize = variant.roomSize;
      onExplore?.(filters);
    }, 2500);
  };

  const quickFacets = QUICK_FACETS.map((k) => facetByKey.get(k)).filter(
    (f): f is VariantFacet => Boolean(f)
  );

  return (
    <ScreenLayout>
      <StepHeader
        currentStep={3}
        totalSteps={4}
        label="Refine Design"
        title="Refine Your Selection"
        description="Filter by style and preference, then tap the room design you'd like to explore."
      />

      {/* ─── Divider ─── */}
      <div className="w-full h-px bg-spatial-border mt-element mb-element shrink-0" />

      {/* ─── Filter Bar ─── */}
      <div className="flex items-center gap-tight flex-wrap shrink-0 relative z-30">
        {quickFacets.map((facet) => (
          <FilterPill
            key={facet.key}
            label={facet.label}
            count={selections[facet.key]?.length ?? 0}
            open={openPill === facet.key}
            onClick={() => setOpenPill((prev) => (prev === facet.key ? null : facet.key))}
          >
            <FilterPopover
              facet={facet}
              selected={selections[facet.key] ?? []}
              onToggle={(value) => toggleValue(facet.key, value)}
              onClear={() => clearFacet(facet.key)}
              onClose={() => setOpenPill(null)}
            />
          </FilterPill>
        ))}

        {/* Filters drawer trigger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-tight px-element h-10 rounded-pill border border-spatial-border bg-spatial-glass text-neutral-300 text-bodyMedium font-medium hover:border-spatial-border-elevated hover:text-white transition-all duration-200 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-4 h-4 opacity-70" />
          <span>Filters</span>
          {totalSelected > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[11px] font-bold leading-none">
              {totalSelected}
            </span>
          )}
        </button>

        {/* Result count */}
        <Typography variant="bodySmall" className="text-neutral-500 ml-auto pl-element whitespace-nowrap">
          {results.length} design{results.length === 1 ? '' : 's'}
        </Typography>
      </div>

      {/* ─── Applied-filter chip row ─── */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-tight flex-wrap shrink-0 mt-element">
          {activeChips.map(({ key, value }) => (
            <Chip
              key={`${key}:${value}`}
              label={titleCase(value)}
              onRemove={() => toggleValue(key, value)}
            />
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="px-element h-9 text-bodySmall font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-pill"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ─── Results Grid ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mt-element min-h-0">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-element text-center py-12">
            <Typography variant="titleMedium" className="text-neutral-300 font-semibold">
              No designs match these filters
            </Typography>
            <div className="flex items-center gap-tight flex-wrap justify-center">
              {facets
                .filter((f) => (selections[f.key]?.length ?? 0) > 0)
                .map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => clearFacet(f.key)}
                    className="px-element h-10 rounded-pill border border-spatial-border bg-spatial-glass text-neutral-300 text-bodySmall font-medium hover:border-spatial-border-elevated hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Clear {f.label} filter
                  </button>
                ))}
              <button
                type="button"
                onClick={clearAll}
                className="px-group h-10 rounded-pill bg-primary-500 text-white text-bodySmall font-bold hover:bg-primary-400 shadow-card transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Clear all
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-element pb-2 animate-fade-in-down">
            {results.map((variant) => (
              <DesignCard
                key={variant.slug}
                variant={variant}
                selected={selectedVariantId === variant.slug}
                onClick={() =>
                  setSelectedVariantId(variant.slug === selectedVariantId ? null : variant.slug)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ActionFooter
        onBack={onBack}
        onPrimaryAction={handleExplore}
        primaryLabel="Explore Design"
        isPrimaryDisabled={!selectedVariantId}
        isLoading={isLoading}
      />

      <FiltersDrawer
        open={drawerOpen}
        facets={facets}
        selections={selections}
        resultCount={results.length}
        onToggle={toggleValue}
        onClearAll={clearAll}
        onClose={() => setDrawerOpen(false)}
      />

      <LoadingOverlay isVisible={isLoading} message="Setting up your design..." />
    </ScreenLayout>
  );
};
