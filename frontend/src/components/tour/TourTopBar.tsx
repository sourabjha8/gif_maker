'use client';

import React from 'react';
import { BackButton } from '../BackButton';
import { StatusPill } from '../StatusPill';
import { EstimateButton } from '../EstimateButton';

export interface TourTopBarProps {
  /** Current room name shown in the centre "now viewing" pill. */
  roomName: string;
  /** Estimate item count for the trailing button. */
  estimateCount: number;
  onBack?: () => void;
  onOpenEstimate?: () => void;
}

/**
 * Tour overlay top bar: back button · now-viewing room pill · estimate button.
 * A composition of the shared {@link BackButton}, {@link StatusPill}, and
 * {@link EstimateButton} primitives.
 */
export const TourTopBar: React.FC<TourTopBarProps> = ({
  roomName,
  estimateCount,
  onBack,
  onOpenEstimate,
}) => (
  <div className="flex items-start justify-between w-full gap-3">
    <div className="pointer-events-auto">
      <BackButton onClick={onBack} />
    </div>

    <div className="pointer-events-auto">
      <StatusPill label={roomName} showDot />
    </div>

    <div className="pointer-events-auto">
      <EstimateButton count={estimateCount} onClick={onOpenEstimate} />
    </div>
  </div>
);
