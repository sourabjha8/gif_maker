'use client';

import React, { useEffect } from 'react';
import { Typography } from '../UI';
import { Button } from '../Button';
import { useEstimateStore, selectEstimateSummary } from '../../lib/estimate';
import { formatINR } from '../../lib/pricing/format';

export interface EstimateSidebarProps {
  onViewSummary?: () => void;
}

export const EstimateSidebar: React.FC<EstimateSidebarProps> = ({ onViewSummary }) => {
  const items = useEstimateStore((s) => s.items);
  const isOpen = useEstimateStore((s) => s.isOpen);
  const close = useEstimateStore((s) => s.close);
  const removeItem = useEstimateStore((s) => s.removeItem);
  const setQuantity = useEstimateStore((s) => s.setQuantity);

  const summary = selectEstimateSummary(items);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[140] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed top-0 right-0 z-[150] h-full w-full sm:w-[420px] bg-spatial-glass backdrop-blur-3xl border-l border-spatial-border shadow-modal flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="estimate-title"
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between p-6 border-b border-spatial-border">
          <Typography variant="h3" weight="semiBold" colorClass="text-neutral-50">
            <span id="estimate-title">Your estimate</span>
          </Typography>
          <button
            type="button"
            onClick={close}
            aria-label="Close estimate"
            className="w-11 h-11 rounded-full bg-spatial-glass-elevated border border-spatial-border text-neutral-200 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {summary.groups.length === 0 && (
            <div className="text-center py-12">
              <Typography variant="bodyMedium" colorClass="text-neutral-400">
                Nothing in your estimate yet. Tap a hotspot and add a module or product to get started.
              </Typography>
            </div>
          )}

          {summary.groups.map((group) => (
            <section key={group.roomSlug} className="rounded-card border border-spatial-border bg-spatial-glass-elevated p-4">
              <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50" className="mb-3 capitalize">
                {group.roomLabel.replace(/-/g, ' ')}
              </Typography>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Typography variant="bodyMedium" colorClass="text-neutral-50" className="truncate">
                        {item.label}
                      </Typography>
                      {(item.sku || item.moduleCode) && (
                        <Typography variant="bodySmall" colorClass="text-neutral-500" className="truncate">
                          {item.sku || item.moduleCode}
                        </Typography>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="w-9 h-9 rounded-full bg-spatial-glass border border-spatial-border text-neutral-100 hover:bg-white/10"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="text-sm w-6 text-center text-neutral-100">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="w-9 h-9 rounded-full bg-spatial-glass border border-spatial-border text-neutral-100 hover:bg-white/10"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Typography variant="bodyMedium" weight="medium" colorClass="text-neutral-50">
                        {item.priceSnapshot
                          ? formatINR(item.priceSnapshot.totalMinor * item.quantity)
                          : 'Pending'}
                      </Typography>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-neutral-400 hover:text-red-400 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-spatial-border">
                <Typography variant="bodySmall" colorClass="text-neutral-300">
                  Room subtotal
                </Typography>
                <Typography variant="bodyMedium" weight="semiBold" colorClass="text-neutral-50">
                  {formatINR(group.subtotalMinor)}
                </Typography>
              </div>
            </section>
          ))}
        </div>

        <footer className="p-6 border-t border-spatial-border space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="titleSmall" colorClass="text-neutral-300">
              {summary.itemCount} item{summary.itemCount === 1 ? '' : 's'}
            </Typography>
            <Typography variant="h3" weight="bold" colorClass="text-primary-400">
              {formatINR(summary.grandTotalMinor)}
            </Typography>
          </div>
          {onViewSummary && (
            <Button
              variant="primary"
              className="w-full"
              disabled={summary.itemCount === 0}
              onClick={onViewSummary}
            >
              View full summary
            </Button>
          )}
        </footer>
      </aside>
    </>
  );
};
