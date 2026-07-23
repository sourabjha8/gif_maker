'use client';

import React, { useEffect } from 'react';
import { Typography } from '../UI';
import { useEstimateStore, selectEstimateSummary } from '../../lib/estimate';
import { formatINR } from '../../lib/pricing/format';

export interface EstimateSidebarProps {}

export const EstimateSidebar: React.FC<EstimateSidebarProps> = () => {
  const items = useEstimateStore((s) => s.items);
  const isOpen = useEstimateStore((s) => s.isOpen);
  const close = useEstimateStore((s) => s.close);
  const removeItem = useEstimateStore((s) => s.removeItem);
  const setQuantity = useEstimateStore((s) => s.setQuantity);

  const summary = selectEstimateSummary(items);

  const subtotalMinor = summary.grandTotalMinor;
  const gstMinor = Math.round(subtotalMinor * 0.18);
  const totalMinor = subtotalMinor + gstMinor;

  const projectBreadcrumb = items.length > 0
    ? items[0].projectSlug.replace(/-/g, ' ').toUpperCase()
    : '';

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[140] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden={!isOpen}
      />

      {/* Floating sidebar — 8px from top, bottom, right */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="estimate-title"
        aria-hidden={!isOpen}
        className={`
          fixed z-[150]
          top-[max(0.5rem,env(safe-area-inset-top))]
          bottom-[max(0.5rem,env(safe-area-inset-bottom))]
          right-[max(0.5rem,env(safe-area-inset-right))]
          w-[calc(100vw_-_1rem)] sm:w-[400px]
          flex flex-col
          bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal
          rounded-container
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'}
        `}
      >
        {/* Header */}
        <header className="shrink-0 px-element pt-element pb-tight border-b border-spatial-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-tight">
              <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-6 h-6 opacity-50" />
              <Typography variant="titleLarge" weight="bold" colorClass="text-neutral-50">
                <span id="estimate-title">Your Cart</span>
              </Typography>
              {summary.itemCount > 0 && (
                <Typography variant="bodySmall" colorClass="text-neutral-400">
                  {summary.itemCount} item{summary.itemCount !== 1 ? 's' : ''}
                </Typography>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close cart"
              className="
                w-11 h-11 rounded-pill flex items-center justify-center
                bg-spatial-glass-elevated border border-spatial-border
                text-neutral-300 hover:text-white hover:bg-white/10
                transition-all duration-200 active:scale-95
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              "
            >
              ×
            </button>
          </div>
          {projectBreadcrumb && (
            <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mt-tight">
              {projectBreadcrumb}
            </Typography>
          )}
        </header>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {summary.groups.length === 0 ? (
            <div className="flex items-center justify-center h-full px-group py-12">
              <Typography variant="bodyMedium" colorClass="text-neutral-400" className="text-center">
                Nothing in your cart yet. Tap a hotspot and add a module or product to get started.
              </Typography>
            </div>
          ) : (
            summary.groups.map((group) =>
              group.items.map((item, idx) => (
                <div key={item.id}>
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
                          <Typography variant="bodySmall" colorClass="text-neutral-400" className="truncate capitalize">
                            {group.roomLabel.replace(/-/g, ' ')}
                            {item.sku ? ` · ${item.sku}` : item.moduleCode ? ` · ${item.moduleCode}` : ''}
                          </Typography>
                        </div>
                        {/* Remove × */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
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
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
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
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
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
                          {item.priceSnapshot
                            ? formatINR(item.priceSnapshot.totalMinor * item.quantity)
                            : '—'}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Divider between items */}
                  {idx < group.items.length - 1 && (
                    <div className="mx-element border-t border-spatial-border" />
                  )}
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        {summary.itemCount > 0 && (
          <footer className="shrink-0 border-t border-spatial-border px-element py-element space-y-tight">
            <div className="flex items-center justify-between">
              <Typography variant="bodyMedium" colorClass="text-neutral-300">Subtotal</Typography>
              <Typography variant="bodyMedium" colorClass="text-neutral-100">{formatINR(subtotalMinor)}</Typography>
            </div>
            <div className="flex items-center justify-between">
              <Typography variant="bodyMedium" colorClass="text-primary-400">Est. GST (18%)</Typography>
              <Typography variant="bodyMedium" colorClass="text-primary-400">{formatINR(gstMinor)}</Typography>
            </div>
            <div className="flex items-center justify-between pt-tight border-t border-spatial-border">
              <Typography variant="titleSmall" weight="bold" colorClass="text-neutral-50">Total</Typography>
              <Typography variant="titleSmall" weight="bold" colorClass="text-neutral-50">{formatINR(totalMinor)}</Typography>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
};
