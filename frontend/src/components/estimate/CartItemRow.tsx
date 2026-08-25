'use client';

import React from 'react';
import { Typography } from '../UI';
import { formatINR } from '../../lib/pricing/format';
import { RoomLabelPicker } from './RoomLabelPicker';
import type { EstimateItem } from '../../types';

export interface RoomOption {
  slug: string;
  name: string;
}

export interface CartItemRowProps {
  item: EstimateItem;
  /** Display label for the picker trigger (the room's resolved name). */
  roomLabel: string;
  /** The room key/slug the picker should mark as currently selected. */
  selectedRoomKey: string;
  roomOptions: RoomOption[];
  onSelectRoom: (roomKey: string) => void;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  roomLabel,
  selectedRoomKey,
  roomOptions,
  onSelectRoom,
  onRemove,
  onQuantityChange,
}) => (
  <div className="flex items-start gap-element px-element py-element">
    {/* Thumbnail */}
    <div className="w-[72px] h-[72px] shrink-0 rounded-element border border-spatial-border bg-spatial-glass-elevated flex items-center justify-center">
      <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-6 h-6 opacity-25" />
    </div>

    {/* Details */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-tight">
        <div className="min-w-0">
          <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50" className="truncate">
            {item.label}
          </Typography>
          <RoomLabelPicker
            label={roomLabel}
            itemLabel={item.label}
            options={roomOptions}
            selectedSlug={selectedRoomKey}
            onSelect={onSelectRoom}
          />
        </div>
        {/* Remove × */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.label}`}
          className="
            shrink-0 w-7 h-7 rounded-pill flex items-center justify-center
            text-neutral-500 hover:text-neutral-100 hover:bg-white/10
            transition-all duration-200
            focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
          "
        >
          ×
        </button>
      </div>

      {/* Qty stepper + price */}
      <div className="flex items-center justify-between mt-tight">
        <div className="flex items-center rounded-element border border-spatial-border overflow-hidden">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onQuantityChange(item.quantity - 1)}
            className="
              w-9 h-9 flex items-center justify-center
              text-neutral-300 hover:text-white hover:bg-white/10
              transition-all duration-150
              focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
            "
          >
            −
          </button>
          <div className="w-px h-5 bg-spatial-border" />
          <Typography variant="bodySmall" colorClass="text-neutral-100" className="w-8 text-center">
            {item.quantity}
          </Typography>
          <div className="w-px h-5 bg-spatial-border" />
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="
              w-9 h-9 flex items-center justify-center
              text-neutral-300 hover:text-white hover:bg-white/10
              transition-all duration-150
              focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
            "
          >
            +
          </button>
        </div>
        <Typography variant="titleSmall" weight="bold" colorClass="text-neutral-50">
          {item.priceSnapshot ? formatINR(item.priceSnapshot.totalMinor * item.quantity) : '—'}
        </Typography>
      </div>
    </div>
  </div>
);
