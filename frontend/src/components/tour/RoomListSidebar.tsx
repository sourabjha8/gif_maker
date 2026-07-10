'use client';

import React, { useEffect } from 'react';
import { Typography } from '../UI';
import type { ContentRoom } from '../../types';

export interface RoomListSidebarProps {
  projectName: string;
  projectBhkType?: string;
  rooms: ContentRoom[];
  activeRoomSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (roomSlug: string) => void;
  onBrowseCatalog?: () => void;
}

export const RoomListSidebar: React.FC<RoomListSidebarProps> = ({
  projectName,
  projectBhkType,
  rooms,
  activeRoomSlug,
  isOpen,
  onClose,
  onSelect,
  onBrowseCatalog,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const projectLabel = projectBhkType ? `${projectName} · ${projectBhkType}` : projectName;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[110] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Floating sidebar — 8px off the top-left edge */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Room list"
        aria-hidden={!isOpen}
        className={`
          fixed top-2 left-2 z-[120]
          w-[340px] h-[calc(100dvh-16px)]
          flex flex-col
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal
          rounded-card
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-element py-element border-b border-spatial-border shrink-0">
          <div>
            <Typography variant="titleMedium" weight="bold" colorClass="text-neutral-50">
              {projectLabel}
            </Typography>
            <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mt-0.5">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''} · tap a room to tour
            </Typography>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close room list"
            className="
              w-11 h-11 flex items-center justify-center shrink-0
              rounded-element border border-spatial-border
              bg-spatial-glass-elevated text-neutral-300
              hover:text-white hover:bg-white/10
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            "
          >
            <img src="/assets/icons/close.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>

        <Typography
          variant="bodySmall"
          colorClass="text-neutral-500"
          className="uppercase tracking-widest px-element pt-group pb-tight shrink-0"
        >
          Rooms in this property
        </Typography>

        {/* Room list */}
        <ul className="overflow-y-auto custom-scrollbar px-element pb-element space-y-tight flex-1">
          {rooms.map((room) => {
            const isActive = room.slug === activeRoomSlug;

            return (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => { onSelect(room.slug); onClose(); }}
                  className={`
                    w-full flex items-center gap-element p-tight rounded-element
                    border transition-all duration-200 text-left
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                    ${isActive
                      ? 'bg-primary-500/15 border-primary-400/40'
                      : 'bg-spatial-glass-elevated border-spatial-border hover:bg-white/10 hover:border-spatial-border-elevated'
                    }
                  `}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-element overflow-hidden border border-spatial-border shrink-0 bg-white/5">
                    {room.thumbnail
                      ? <img src={room.thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
                      : <div className="w-full h-full flex items-center justify-center">
                          <img src="/assets/icons/design_house.svg" alt="" aria-hidden className="w-6 h-6 opacity-30" />
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-tight">
                      <Typography variant="titleSmall" colorClass={isActive ? 'text-neutral-50' : 'text-neutral-200'} className="truncate">
                        {room.name}
                      </Typography>
                      {isActive && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded-pill bg-primary-500/30 border border-primary-400/40">
                          <Typography variant="bodySmall" colorClass="text-primary-300">
                            Now
                          </Typography>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <img src="/assets/icons/chevron_next.svg" alt="" aria-hidden className="w-4 h-4 opacity-40 shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Catalog entry — plain text row, no card chrome */}
        <button
          type="button"
          onClick={onBrowseCatalog}
          className="
            flex items-center gap-tight px-element h-11 shrink-0 text-left
            border-t border-spatial-border
            text-neutral-300 hover:text-white hover:bg-white/5
            transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          "
        >
          <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-4 h-4 opacity-60 shrink-0" />
          <Typography variant="bodyMedium" colorClass="text-inherit" className="flex-1">
            Browse all rooms in the catalog
          </Typography>
          <img src="/assets/icons/chevron_next.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-40 shrink-0" />
        </button>
      </aside>
    </>
  );
};
