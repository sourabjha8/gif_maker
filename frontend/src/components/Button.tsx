import React from 'react';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonStyle = 'primary' | 'secondary' | 'tertiary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonStyle;
  size?: ButtonSize;
  iconOnly?: boolean;
  leftIcon?: boolean;
  rightIcon?: boolean;
  rightIconSrc?: string;
  label?: string;
}

/**
 * Universal CTA Button
 * 
 * Supports variants based on Virtual XP Design System using Tailwind CSS.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  iconOnly = false,
  leftIcon = false,
  rightIcon = false,
  rightIconSrc,
  label,
  disabled,
  className = '',
  children,
  ...props
}, ref) => {

  // --- Size Classes ---
  let sizeClasses = 'h-[48px] px-group text-cta'; // default medium (14px)
  
  if (size === 'small') {
    sizeClasses = 'h-[36px] px-element text-sm md:text-bodySmall';
  } else if (size === 'large') {
    sizeClasses = 'h-[56px] px-container text-sm md:text-titleMedium';
  }

  if (iconOnly) {
    if (size === 'small') sizeClasses = 'h-[36px] w-[36px] p-0';
    if (size === 'medium') sizeClasses = 'h-[48px] w-[48px] p-0';
    if (size === 'large') sizeClasses = 'h-[56px] w-[56px] p-0';
  } else {
    // If not icon only, ensure width is auto to wrap content tightly
    sizeClasses += ' w-auto';
  }

  // --- Variant Classes ---
  let variantClasses = '';
  
  if (variant === 'primary') {
    variantClasses = `
      bg-primary-500 text-white 
      hover:bg-primary-400 
      disabled:bg-neutral-700 disabled:text-neutral-300
    `;
  } else if (variant === 'secondary') {
    variantClasses = `
      bg-transparent border border-primary-500 text-primary-500
      hover:bg-primary-500/10 
      disabled:border-neutral-500 disabled:text-neutral-500
    `;
  } else if (variant === 'tertiary') {
    variantClasses = `
      bg-transparent text-primary-500 
      hover:text-primary-400 
      disabled:text-neutral-500
    `;
  }

  const DEFAULT_ICON = "/assets/icons/default_icon.svg";

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-tight font-sans font-semibold rounded-pill transition-all duration-200
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500 focus-visible:border-2 focus-visible:border-spatial-bg
        disabled:cursor-not-allowed disabled:opacity-60
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {/* Left Icon or Icon Only */}
      {(leftIcon || iconOnly) && (
         <img 
           src={DEFAULT_ICON} 
           alt="" 
           className="w-5 h-5 object-contain"
         />
      )}

      {/* Main Text Label */}
      {!iconOnly && <span>{label || children}</span>}

      {/* Right Icon */}
      {(rightIcon && !iconOnly) && (
         <img
           src={rightIconSrc ?? DEFAULT_ICON}
           alt=""
           className="w-5 h-5 object-contain"
         />
      )}
    </button>
  );
});

Button.displayName = 'Button';
