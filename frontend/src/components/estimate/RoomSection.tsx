'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '../UI';
import { formatINR } from '../../lib/pricing/format';

export interface RoomSectionProps {
  title: string;
  itemCount: number;
  subtotalMinor: number;
  isEmpty: boolean;
  onRemoveRoom: () => void;
  children: React.ReactNode;
}

export const RoomSection: React.FC<RoomSectionProps> = ({
  title,
  itemCount,
  subtotalMinor,
  isEmpty,
  onRemoveRoom,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setConfirmingRemove(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      closeMenu();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isMenuOpen]);

  return (
    <div className="border-b border-spatial-border">
      <div className="flex items-center gap-tight px-element py-tight">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="
            flex items-center gap-tight flex-1 min-w-0 text-left rounded-element
            focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
          "
        >
          <img
            src="/assets/icons/chevron_down.svg"
            alt=""
            aria-hidden
            className={`w-3 h-3 shrink-0 opacity-60 transition-transform duration-150 ${isExpanded ? '' : '-rotate-90'}`}
          />
          <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100" className="truncate">
            {title}
          </Typography>
          <Typography variant="bodySmall" colorClass="text-neutral-500" className="shrink-0 truncate">
            · {itemCount} item{itemCount !== 1 ? 's' : ''}
            {itemCount > 0 ? ` · ${formatINR(subtotalMinor)}` : ''}
          </Typography>
        </button>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={`More actions for ${title}`}
            aria-expanded={isMenuOpen}
            className="
              w-7 h-7 rounded-pill flex items-center justify-center
              text-neutral-500 hover:text-neutral-200 hover:bg-white/10
              transition-colors duration-150
              focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
            "
          >
            <img src="/assets/icons/more.svg" alt="" aria-hidden className="w-4 h-4 opacity-70" />
          </button>

          {isMenuOpen && (
            <div
              className="
                absolute right-0 top-full mt-1 z-[60] min-w-[200px]
                rounded-element border border-spatial-border-elevated
                bg-spatial-glass-elevated backdrop-blur-2xl shadow-modal py-1
              "
            >
              {!confirmingRemove ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isEmpty) {
                      onRemoveRoom();
                      closeMenu();
                    } else {
                      setConfirmingRemove(true);
                    }
                  }}
                  className="
                    w-full px-element py-1.5 text-left
                    text-neutral-300 hover:text-neutral-50 hover:bg-white/5
                    transition-colors duration-100
                    focus:outline-none focus-visible:bg-white/10
                  "
                >
                  <Typography variant="bodySmall" colorClass="text-inherit">Remove room</Typography>
                </button>
              ) : (
                <div className="px-element py-tight space-y-tight">
                  <Typography variant="bodySmall" colorClass="text-neutral-300">
                    Move {itemCount} item{itemCount !== 1 ? 's' : ''} to Unassigned?
                  </Typography>
                  <div className="flex gap-tight">
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="
                        flex-1 h-8 rounded-element border border-spatial-border
                        text-neutral-300 hover:text-neutral-50 hover:bg-white/5
                        transition-colors duration-150
                        focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
                      "
                    >
                      <Typography variant="bodySmall" colorClass="text-inherit">Cancel</Typography>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveRoom();
                        closeMenu();
                      }}
                      className="
                        flex-1 h-8 rounded-element bg-primary-500/20 border border-primary-400
                        text-primary-300 hover:bg-primary-500/30
                        transition-colors duration-150
                        focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
                      "
                    >
                      <Typography variant="bodySmall" colorClass="text-inherit">Remove</Typography>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        isEmpty ? (
          <div className="px-element pb-element">
            <Typography variant="bodySmall" colorClass="text-neutral-500">No items yet</Typography>
          </div>
        ) : (
          <div>{children}</div>
        )
      )}
    </div>
  );
};
