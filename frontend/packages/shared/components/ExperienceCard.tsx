import React from 'react';
import { Typography } from './UI';

export interface ExperienceCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  isSelected: boolean;
  onClick: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  description,
  icon: Icon,
  isSelected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center text-center rounded-card py-4 px-4 md:p-group transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'bg-[linear-gradient(180deg,rgba(130,211,247,0.15)_0%,rgba(130,211,247,0.04)_100%)] border border-primary-300 shadow-[0_0_12px_rgba(130,211,247,0.15)]'
          : 'bg-spatial-glass-elevated border border-spatial-border hover:border-spatial-border-elevated hover:bg-[rgba(255,255,255,0.06)]'
        }
      `}
    >
      <div className={`
        w-12 h-12 md:w-16 md:h-16 rounded-element flex items-center justify-center mb-2 md:mb-element transition-colors
        ${isSelected
          ? 'bg-primary-500/20 border border-primary-400/30'
          : 'bg-spatial-glass-elevated border border-spatial-border'
        }
      `}>
        <Icon size={28} className={isSelected ? 'text-primary-300' : 'text-primary-400'} />
      </div>
      <Typography variant="titleMedium" className={`font-bold ${isSelected ? 'text-white' : 'text-neutral-100'}`}>
        {title}
      </Typography>
      <Typography variant="bodySmall" className="font-normal text-neutral-500 mt-2 max-w-[280px]">
        {description}
      </Typography>
    </button>
  );
};
