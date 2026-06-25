import React from 'react';

const ArrowForwardIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="M665.08-450H210q-12.77 0-21.38-8.62Q180-467.23 180-480t8.62-21.38Q197.23-510 210-510h455.08L458.31-716.77q-8.92-8.92-8.81-20.88.12-11.96 9.42-21.27 9.31-8.69 21.08-9 11.77-.31 21.08 9l253.61 253.61q5.62 5.62 7.92 11.85 2.31 6.23 2.31 13.46t-2.31 13.46q-2.3 6.23-7.92 11.85L501.08-201.08q-8.31 8.31-20.58 8.5-12.27.19-21.58-8.5-9.3-9.31-9.3-21.38 0-12.08 9.3-21.39L665.08-450Z" />
  </svg>
);

const ChevronPreviousIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={size} height={size} fill="currentColor" className={className}>
    <path d="m418.15-480 162.93 162.92q8.3 8.31 8.5 20.89.19 12.57-8.5 21.27-8.7 8.69-21.08 8.69-12.38 0-21.08-8.69L359.15-454.69q-5.61-5.62-7.92-11.85-2.31-6.23-2.31-13.46t2.31-13.46q2.31-6.23 7.92-11.85l179.77-179.77q8.31-8.3 20.89-8.5 12.57-.19 21.27 8.5 8.69 8.7 8.69 21.08 0 12.38-8.69 21.08L418.15-480Z" />
  </svg>
);

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
  primaryIcon = <ArrowForwardIcon size={18} />,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mt-element md:mt-group pt-element md:pt-group border-t border-spatial-border flex-shrink-0 ${className}`}>
      {/* Back Button */}
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isBackDisabled || isLoading}
          className={`flex items-center justify-center gap-tight w-11 md:w-auto px-0 md:px-element h-11 min-w-[44px] rounded-pill border border-spatial-border bg-transparent text-neutral-300 font-sans font-medium text-bodyMedium transition-all duration-200 hover:border-spatial-border-elevated hover:text-white cursor-pointer ${isBackDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronPreviousIcon size={14} />
          <span className="hidden md:inline">Back</span>
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
