import React, { useEffect } from 'react';
import { Button } from './Button';

const DEFAULT_ICON = '/assets/icons/default_icon.svg';

export interface WelcomeTip {
  label: string;
  iconSrc?: string;
}

export interface WelcomeModalProps {
  isOpen: boolean;
  societyName: string;
  roomName?: string;
  styleName?: string;
  description?: string;
  tips?: WelcomeTip[];
  ctaLabel?: string;
  onStart: () => void;
  onClose?: () => void;
}

const DEFAULT_TIPS: WelcomeTip[] = [
  { label: 'Drag to look around' },
  { label: 'Tap dots for products' },
  { label: 'Walk to other rooms' },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  societyName,
  roomName,
  styleName,
  description,
  tips = DEFAULT_TIPS,
  ctaLabel = 'Start exploring',
  onStart,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const body =
    description ??
    (styleName
      ? `You're viewing the ${styleName} style. Explore the space and build your estimate as you go.`
      : 'Explore the space and build your estimate as you go.');

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 transition-all duration-500 ease-out ${
          isOpen ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none'
        }`}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-society"
        className={`relative w-full max-w-[460px] bg-spatial-glass-base backdrop-blur-3xl border border-spatial-border rounded-container shadow-modal overflow-hidden transition-all duration-300 ease-out transform ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <div className="flex flex-col items-center text-center px-container pt-container pb-group">
          <span className="text-bodySmall2 uppercase tracking-[0.2em] text-primary-400 mb-tight">
            Welcome to
          </span>

          <h2
            id="welcome-society"
            className="text-h2 md:text-h1 font-bold text-white leading-tight"
          >
            {societyName}
          </h2>

          {roomName && (
            <p className="mt-tight text-titleLarge text-neutral-300 font-medium">
              {roomName}
            </p>
          )}

          <p className="mt-group text-sm md:text-bodyLarge text-neutral-400 leading-relaxed max-w-[360px]">
            {body}
          </p>
        </div>

        <div className="px-container pb-group">
          <ul className="flex flex-col gap-tight bg-spatial-glass-elevated border border-spatial-border rounded-card p-element">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-center gap-element text-sm md:text-bodyMedium text-neutral-200"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-element bg-white/5 border border-spatial-border shrink-0">
                  <img
                    src={tip.iconSrc ?? DEFAULT_ICON}
                    alt=""
                    className="w-5 h-5 object-contain opacity-90"
                  />
                </span>
                <span>{tip.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-container pb-container flex justify-center">
          <Button
            variant="primary"
            size="large"
            rightIcon
            onClick={onStart}
            label={ctaLabel}
          />
        </div>
      </div>
    </div>
  );
};
