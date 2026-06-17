import React from 'react';
import { ArrowRight, ChevronLeft } from '../assets/icons';

interface ActionFooterProps {
  onBack?: () => void;
  onPrimaryAction?: () => void;
  primaryLabel: string;
  isPrimaryDisabled?: boolean;
  isBackDisabled?: boolean;
  isLoading?: boolean;
  showBack?: boolean;
  primaryIcon?: React.ReactNode;
  className?: string;
}

/**
 * ActionFooter: Standardized footer for screen transitions.
 * Features a back button and a primary action button.
 */
export const ActionFooter: React.FC<ActionFooterProps> = ({
  onBack,
  onPrimaryAction,
  primaryLabel,
  isPrimaryDisabled = false,
  isBackDisabled = false,
  isLoading = false,
  showBack = true,
  primaryIcon = <ArrowRight size={18} />,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mt-2 md:mt-group pt-2 md:pt-group border-t border-spatial-border flex-shrink-0 ${className}`}>
      {/* Back Button */}
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isBackDisabled || isLoading}
          className={`flex items-center gap-tight px-element h-11 min-w-[44px] rounded-pill border border-spatial-border bg-transparent text-neutral-300 font-sans font-medium text-bodyMedium transition-all duration-200 hover:border-spatial-border-elevated hover:text-white cursor-pointer ${isBackDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
      ) : (
        <div />
      )}

      {/* Primary Action CTA */}
      <button
        type="button"
        onClick={onPrimaryAction}
        disabled={isPrimaryDisabled || isLoading}
        className={`
          flex items-center gap-tight px-group h-11 min-w-[44px] rounded-pill font-sans font-bold text-bodyMedium transition-all duration-200
          ${isPrimaryDisabled || isLoading
            ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed opacity-60'
            : 'bg-primary-500 text-white hover:bg-primary-400 shadow-card hover:shadow-modal cursor-pointer'
          }
        `}
      >
        <span>{primaryLabel}</span>
        {!isLoading && primaryIcon}
        {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
      </button>
    </div>
  );
};
