import React, { useState } from 'react';
import { Stack, Typography } from './UI';

export interface TextBoxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  containerClassName?: string;
}

/**
 * TextBox Component
 * 
 * Scalable Tailwind implementation of the input component supporting states (Default, Focus, Error, Disabled).
 */
export const TextBox = React.forwardRef<HTMLInputElement, TextBoxProps>(
  ({ label, error, helperText, disabled, fullWidth = true, className = '', containerClassName = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Dynamic states built naturally into Tailwind using pseudo-classes (peer, focus-within, group)
    const errorClasses = error ? 'border-red-500 focus-within:ring-0 focus-within:border-red-500' : '';
    const disabledClasses = disabled ? 'border-neutral-300 opacity-60' : '';
    const defaultClasses = (!error && !disabled) ? 'border-neutral-700 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 focus-within:ring-offset-0 focus-within:ring-offset-transparent' : '';

    return (
      <div className={`flex flex-col gap-tight ${fullWidth ? 'w-full' : 'w-auto'} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <Typography
            variant="bodyMedium"
            className={`${disabled ? 'font-bold text-neutral-400' : 'font-normal text-neutral-50'}`}
          >
            {label}
          </Typography>
        )}

        {/* Input Container configured for focus-within state propagation */}
        <div
          className={`
            flex items-center h-[48px] bg-[#2A2A2A] border rounded-element px-element transition-colors duration-200 overflow-hidden
            ${errorClasses} ${disabledClasses} ${defaultClasses}
          `}
        >
          <input
            ref={ref}
            disabled={disabled}
            type={inputType}
            className={`
              flex-1 bg-transparent border-none outline-none text-base md:text-bodyLarge leading-relaxed font-sans h-full text-neutral-50
              disabled:text-neutral-400 placeholder:text-neutral-500
              ${className}
            `}
            {...props}
          />
          
          {/* Password Toggle Icon */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-neutral-500 hover:text-neutral-300 focus:outline-none transition-colors"
            >
              <img
                src={showPassword ? '/assets/icons/eye_visibility_off.svg' : '/assets/icons/eye_visibility_on.svg'}
                alt={showPassword ? 'Hide password' : 'Show password'}
                className="w-5 h-5"
              />
            </button>
          )}
        </div>

        {/* Error or Helper Message */}
        {(error || helperText) && (
          <Typography
            variant="bodySmall"
            className={`font-semibold uppercase tracking-wider mt-1 ${error ? 'text-red-500' : 'text-neutral-500'}`}
          >
            {error || helperText}
          </Typography>
        )}
      </div>
    );
  }
);

TextBox.displayName = 'TextBox';
