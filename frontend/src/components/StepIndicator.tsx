import React from 'react'; // Re-build trigger
import { Typography } from './UI';
import { Globe } from '../assets/icons';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, label }) => {
  return (
    <div className="flex flex-col gap-2 md:gap-element flex-shrink-0">
      <div className="flex items-center gap-element">
        <div className="w-9 h-9 rounded-element bg-spatial-glass-elevated border border-spatial-border flex items-center justify-center">
          <Globe size={16} className="text-neutral-300" />
        </div>
        <div className="flex items-center gap-tight">
          <Typography variant="bodySmall" className="font-medium text-neutral-400 uppercase tracking-wider">
            STEP {currentStep} OF {totalSteps}
          </Typography>
          <span className="text-neutral-600 mx-1">|</span>
          <Typography variant="bodySmall" className="font-normal text-neutral-400">
            {label}
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-tight">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-pill ${index + 1 === currentStep ? 'w-8 bg-white' : 'w-2 bg-neutral-600'
              }`}
          />
        ))}
      </div>
    </div>
  );
};
