'use client';

import React from 'react';
import { Typography } from '../UI';
import { Button } from '../Button';
import { useEstimateStore, selectEstimateSummary } from '../../lib/estimate';
import { formatINR } from '../../lib/pricing/format';

export interface EstimateSummaryViewProps {
  onBack?: () => void;
}

export const EstimateSummaryView: React.FC<EstimateSummaryViewProps> = ({ onBack }) => {
  const items = useEstimateStore((s) => s.items);
  const removeItem = useEstimateStore((s) => s.removeItem);
  const setQuantity = useEstimateStore((s) => s.setQuantity);
  const clear = useEstimateStore((s) => s.clear);
  const summary = selectEstimateSummary(items);

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-spatial-bg text-neutral-50 px-6 md:px-10 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Typography variant="h2" weight="bold" colorClass="text-neutral-50">
              Estimate summary
            </Typography>
            <Typography variant="bodyMedium" colorClass="text-neutral-400" className="mt-1">
              Snapshot of pricing captured when each item was added.
            </Typography>
          </div>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              Back to tour
            </Button>
          )}
        </div>

        {summary.groups.length === 0 ? (
          <div className="rounded-card border border-spatial-border bg-spatial-glass-elevated p-10 text-center">
            <Typography variant="titleMedium" colorClass="text-neutral-50" className="mb-2">
              No items yet
            </Typography>
            <Typography variant="bodyMedium" colorClass="text-neutral-400">
              Tap any hotspot and add it to your estimate to see numbers here.
            </Typography>
          </div>
        ) : (
          <div className="space-y-6">
            {summary.groups.map((group) => (
              <section
                key={group.roomSlug}
                className="rounded-card border border-spatial-border bg-spatial-glass-elevated p-6"
              >
                <Typography variant="titleMedium" weight="semiBold" colorClass="text-neutral-50" className="mb-4 capitalize">
                  {group.roomLabel.replace(/-/g, ' ')}
                </Typography>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3 border-b border-spatial-border last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <Typography variant="bodyMedium" colorClass="text-neutral-50" className="truncate">
                          {item.label}
                        </Typography>
                        {(item.sku || item.moduleCode) && (
                          <Typography variant="bodySmall" colorClass="text-neutral-500">
                            {item.sku || item.moduleCode}
                          </Typography>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="w-9 h-9 rounded-full bg-spatial-glass border border-spatial-border text-neutral-100 hover:bg-white/10"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="w-9 h-9 rounded-full bg-spatial-glass border border-spatial-border text-neutral-100 hover:bg-white/10"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <Typography variant="bodyMedium" weight="medium" colorClass="text-neutral-50" className="w-28 text-right">
                        {item.priceSnapshot
                          ? formatINR(item.priceSnapshot.totalMinor * item.quantity)
                          : 'Pending'}
                      </Typography>
                      <button
                        type="button"
                        aria-label="Remove item"
                        className="text-xs text-neutral-400 hover:text-red-400"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-spatial-border">
                  <Typography variant="bodyMedium" colorClass="text-neutral-300">
                    Room subtotal
                  </Typography>
                  <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50">
                    {formatINR(group.subtotalMinor)}
                  </Typography>
                </div>
              </section>
            ))}

            <section className="rounded-card border border-primary-500/40 bg-primary-500/10 p-6 flex items-center justify-between">
              <div>
                <Typography variant="titleMedium" weight="semiBold" colorClass="text-neutral-50">
                  Grand total
                </Typography>
                <Typography variant="bodySmall" colorClass="text-neutral-400">
                  {summary.itemCount} item{summary.itemCount === 1 ? '' : 's'} · INR · prices snapshot at add-time.
                </Typography>
              </div>
              <Typography variant="h2" weight="bold" colorClass="text-primary-400">
                {formatINR(summary.grandTotalMinor)}
              </Typography>
            </section>

            <div className="flex justify-end">
              <Button variant="tertiary" onClick={clear}>
                Clear estimate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
