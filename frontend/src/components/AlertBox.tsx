import React, { useEffect } from 'react';

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface AlertBoxProps {
  isOpen: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions: AlertAction[];
  onClose?: () => void;
}

export const AlertBox: React.FC<AlertBoxProps> = ({
  isOpen,
  title,
  description,
  icon,
  actions,
  onClose,
}) => {
  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-all duration-600 ease-out ${isOpen ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none'
          }`}
        onClick={onClose}
      />

      {/* Alert Box */}
      <div
        className={`relative w-full max-w-[min(320px,calc(100vw-2rem))] bg-spatial-glass-base backdrop-blur-3xl border border-spatial-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out transform ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-title"
      >
        {/* Content Area */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
          {icon && (
            <div className="mb-4 flex items-center justify-center">
              {icon}
            </div>
          )}
          <h2 id="alert-title" className="text-xl font-bold text-white mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-400 font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Actions Area */}
        <div className="flex flex-col w-full">
          {actions.map((action, index) => {
            const isPrimary = action.variant === 'primary' || (!action.variant && index === 0);
            const isDanger = action.variant === 'danger';

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  w-full py-4 text-[14px] border-t border-spatial-border transition-colors
                  hover:bg-white/5 active:bg-white/10 focus:outline-none focus:bg-white/10
                  ${isPrimary ? 'font-semibold' : 'font-normal'}
                  ${isDanger ? 'text-red-500' : isPrimary ? 'text-white' : 'text-neutral-400'}
                `}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
