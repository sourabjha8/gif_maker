'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '../UI';
import type { RoomCategory, ScopeRoom } from '../../types';
import { ROOM_CATEGORY_ORDER } from '../../lib/estimate';

const CATEGORY_LABEL: Record<RoomCategory, string> = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  washroom: 'Washroom',
  balcony: 'Balcony',
};

export interface AddRoomMenuProps {
  rooms: ScopeRoom[];
  onAddRoom: (category: RoomCategory) => void;
}

export const AddRoomMenu: React.FC<AddRoomMenuProps> = ({ rooms, onAddRoom }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative px-element py-element">
      {isOpen && (
        <div
          role="listbox"
          aria-label="Add a room"
          className="
            absolute left-element right-element bottom-full mb-1 z-[60]
            rounded-element border border-spatial-border-elevated
            bg-spatial-glass-elevated backdrop-blur-2xl shadow-modal py-1
          "
        >
          {ROOM_CATEGORY_ORDER.map((category) => {
            const existingCount = rooms.filter((r) => r.category === category).length;
            const copy = existingCount > 0 ? `Add another ${CATEGORY_LABEL[category]}` : `Add ${CATEGORY_LABEL[category]}`;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onAddRoom(category);
                  setIsOpen(false);
                }}
                className="
                  w-full px-element py-1.5 text-left
                  text-neutral-200 hover:text-neutral-50 hover:bg-white/5
                  transition-colors duration-100
                  focus:outline-none focus-visible:bg-white/10
                "
              >
                <Typography variant="bodySmall" colorClass="text-inherit">{copy}</Typography>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="
          w-full h-10 rounded-element border border-dashed border-spatial-border
          flex items-center justify-center gap-tight
          text-neutral-400 hover:text-neutral-100 hover:border-spatial-border-elevated hover:bg-white/5
          transition-all duration-150
          focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
        "
      >
        <span aria-hidden className="leading-none text-base">+</span>
        <Typography variant="bodySmall" colorClass="text-inherit">Add room</Typography>
      </button>
    </div>
  );
};
