'use client';

import React from 'react';
import { EstimateSummaryView } from '../components/estimate';

export interface EstimatePageProps {
  onBack?: () => void;
}

export const EstimatePage: React.FC<EstimatePageProps> = ({ onBack }) => (
  <EstimateSummaryView onBack={onBack} />
);
