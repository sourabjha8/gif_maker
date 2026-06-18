import React from 'react';
import { Stack, Typography } from './UI';
import { StepIndicator } from './StepIndicator';

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  label: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * StepHeader: Standardized header for multi-step screens.
 * Includes a StepIndicator, a title, and an optional description or custom content.
 */
export const StepHeader: React.FC<StepHeaderProps> = ({
  currentStep,
  totalSteps,
  label,
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-element md:gap-group flex-shrink-0 ${className}`}>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} label={label} />

      <Stack gap="tiny">
        {title && (
          <Typography variant="h2" className="font-bold text-white text-2xl md:text-h2">
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="bodyLarge" className="font-normal text-neutral-300 max-w-[505px] text-sm md:text-bodyLarge">
            {description}
          </Typography>
        )}
        {children}
      </Stack>
    </div>
  );
};
