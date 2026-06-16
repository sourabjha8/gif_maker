import React, { useState } from 'react';
import { AlertBox } from './AlertBox';

interface NavbarProps {
  onSignOut?: () => void;
}

/**
 * Navbar: The global navigation component for Virtual XP.
 * 
 * Features:
 * - Glassmorphism design consistent with the spatial design system.
 * - Responsive layout with logo on left and links/actions on right.
 * - Sticky positioning at the top of the screen.
 */
export const Navbar: React.FC<NavbarProps> = ({ onSignOut }) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleConfirmSignOut = () => {
    setIsAlertOpen(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] h-[70px] flex items-center justify-between px-6 md:px-12 animate-fade-in-down"
      >
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/icons/logo.svg"
            alt="Virtual XP Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Right Side: Sign Out */}
        <nav aria-label="User navigation">
          <button
            onClick={() => setIsAlertOpen(true)}
            className="p-2.5 hover:bg-white/10 rounded-full transition-all duration-300 group flex items-center justify-center border border-white/5 hover:border-white/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Sign Out"
            aria-label="Sign out of the application"
          >
            <img
              src="/assets/icons/sign_out.svg"
              alt=""
              aria-hidden="true"
              className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </button>
        </nav>
      </header>

      <AlertBox
        isOpen={isAlertOpen}
        title="Log Out"
        description="Are you sure you want to end your Virtual XP session?"
        icon={
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <img
              src="/assets/icons/sign_out.svg"
              alt="Sign Out"
              className="w-6 h-6 opacity-100"
            />
          </div>
        }
        actions={[
          {
            label: "Log Out",
            variant: "danger",
            onClick: handleConfirmSignOut
          },
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setIsAlertOpen(false)
          }
        ]}
        onClose={() => setIsAlertOpen(false)}
      />
    </>
  );
};
