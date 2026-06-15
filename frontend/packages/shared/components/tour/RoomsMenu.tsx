'use client';

import React, { useEffect } from 'react';
import { Typography } from '../UI';
import type { ContentRoom } from '../../types';

export interface RoomsMenuProps {
  rooms: ContentRoom[];
  activeRoomSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (roomSlug: string) => void;
}

export const RoomsMenu: React.FC<RoomsMenuProps> = ({
  rooms,
  activeRoomSlug,
  isOpen,
  onClose,
  onSelect,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Rooms"
        aria-hidden={!isOpen}
        className={`fixed top-0 left-0 z-[120] h-full w-full sm:w-[360px] bg-spatial-glass backdrop-blur-3xl border-r border-spatial-border shadow-modal flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between p-6 border-b border-spatial-border">
          <Typography variant="h3" weight="semiBold" colorClass="text-neutral-50">
            Rooms
          </Typography>
          <button
            type="button"
            aria-label="Close rooms menu"
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-spatial-glass-elevated border border-spatial-border text-neutral-200 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
          >
            ×
          </button>
        </header>

        <ul className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {rooms.map((room) => {
            const isActive = room.slug === activeRoomSlug;
            return (
              <li key={room.id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    onSelect(room.slug);
                    onClose();
                  }}
                  className={`w-full text-left rounded-card border p-4 transition-all flex items-center gap-3 ${
                    isActive
                      ? 'bg-primary-500/15 border-primary-400 text-neutral-50'
                      : 'bg-spatial-glass-elevated border-spatial-border text-neutral-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {room.thumbnail && (
                    <img
                      src={room.thumbnail}
                      alt=""
                      className="w-14 h-14 rounded-element object-cover border border-spatial-border"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <Typography variant="bodyMedium" weight="semiBold" colorClass="text-inherit">
                      {room.name}
                    </Typography>
                    <Typography variant="bodySmall" colorClass="text-neutral-400" className="capitalize">
                      {room.type} · {room.variants.length} style{room.variants.length === 1 ? '' : 's'}
                    </Typography>
                  </div>
                  {isActive && (
                    <span className="shrink-0 text-primary-400 text-xs font-semibold uppercase">
                      Now
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
};
