'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Typography } from '../UI';
import { useEstimateStore, selectEstimateSummary, selectDesignScope } from '../../lib/estimate';
import { formatINR } from '../../lib/pricing/format';
import { getDesignFlowRoomList } from '../../lib/content';
import { CartItemRow } from './CartItemRow';
import { RoomSection } from './RoomSection';
import { AddRoomMenu } from './AddRoomMenu';
import type { ResolvedProject } from '../../types';

export interface EstimateSidebarProps {}

// Mock CRM lookup data — a project/unit search is a separate concern from
// this app's own room content, so this is a standalone dataset rather than
// anything drawn from virtual-xp-content.json. Society names reuse this
// pilot's two real project names for authenticity.
const MOCK_RESULTS: ResolvedProject[] = [
  { id: 'r1', name: 'Rohit Sharma', tower: 'Tower B', unit: '1204', bhkType: '3BHK', incoId: 'INCO-4821', society: 'Seabreeze Residences' },
  { id: 'r2', name: 'Rohit Sharma', tower: 'Tower A', unit: '0907', bhkType: '2BHK', incoId: 'INCO-4390', society: 'Seabreeze Residences' },
  { id: 'r3', name: 'Rohit Mehta', tower: 'Tower C', unit: '1602', bhkType: '3BHK', incoId: 'INCO-5117', society: 'Seabreeze Residences' },
  { id: 'r4', name: 'Ananya Gupta', tower: 'Tower A', unit: '0512', bhkType: '2BHK', incoId: 'INCO-3987', society: 'Seabreeze Residences' },
  { id: 'r5', name: 'Vikram Nair', tower: 'Tower D', unit: '1108', bhkType: '4BHK', incoId: 'INCO-5502', society: 'Prestige Kingfisher Towers' },
  { id: 'r6', name: 'Fatima Khan', tower: 'Tower B', unit: '0304', bhkType: '3BHK', incoId: 'INCO-4106', society: 'Prestige Kingfisher Towers' },
  { id: 'r7', name: 'Karan Malhotra', tower: 'Tower C', unit: '0921', bhkType: '2BHK', incoId: 'INCO-4755', society: 'Prestige Kingfisher Towers' },
];

const BHK_OPTIONS = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'];

export const EstimateSidebar: React.FC<EstimateSidebarProps> = () => {
  const items = useEstimateStore((s) => s.items);
  const isOpen = useEstimateStore((s) => s.isOpen);
  const close = useEstimateStore((s) => s.close);
  const removeItem = useEstimateStore((s) => s.removeItem);
  const setQuantity = useEstimateStore((s) => s.setQuantity);
  const setItemRoom = useEstimateStore((s) => s.setItemRoom);
  const resolvedProject = useEstimateStore((s) => s.resolvedProject);
  const rooms = useEstimateStore((s) => s.rooms);
  const resolveProject = useEstimateStore((s) => s.resolveProject);
  const clearResolvedProject = useEstimateStore((s) => s.clearResolvedProject);
  const setBhkType = useEstimateStore((s) => s.setBhkType);
  const addRoom = useEstimateStore((s) => s.addRoom);
  const removeRoom = useEstimateStore((s) => s.removeRoom);

  // Which "page" the drawer's body is showing — swapped in place rather than
  // spawning a separate overlay, same single-shell pattern as
  // RoomBrowserPanel's list/catalog and VisualizeStylesModal's two levels.
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Pre-resolution, an item's room can only be reassigned to one of the
  // real rooms in the tour's project, never free text.
  const roomList = useMemo(() => getDesignFlowRoomList(), []);

  // Transient notice for actions that move (rather than delete) items, e.g.
  // removing a room. Floats over the list rather than pushing it down.
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const summary = selectEstimateSummary(items);
  const designScope = useMemo(() => selectDesignScope(items, rooms), [items, rooms]);
  const projectRoomOptions = useMemo(() => rooms.map((r) => ({ slug: r.key, name: r.name })), [rooms]);

  const subtotalMinor = summary.grandTotalMinor;
  const gstMinor = Math.round(subtotalMinor * 0.18);
  const totalMinor = subtotalMinor + gstMinor;

  const projectBreadcrumb = items.length > 0
    ? items[0].projectSlug.replace(/-/g, ' ').toUpperCase()
    : '';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_RESULTS;
    return MOCK_RESULTS.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.society.toLowerCase().includes(q) ||
      r.incoId.toLowerCase().includes(q),
    );
  }, [query]);

  const openQuote = () => {
    setQuery('');
    setIsQuoteOpen(true);
  };
  const backToCart = () => setIsQuoteOpen(false);

  const handleSelectResult = (result: ResolvedProject) => {
    resolveProject(result);
    backToCart();
  };

  const handleRemoveRoom = (roomKey: string, roomName: string, itemCount: number) => {
    removeRoom(roomKey);
    if (itemCount > 0) {
      setToast(`Moved ${itemCount} item${itemCount !== 1 ? 's' : ''} from ${roomName} to Unassigned`);
    }
  };

  // Pre-resolution, the primary CTA starts the INCO/unit search. Once a
  // project is resolved, it becomes the terminal "push" action, and pushing
  // drops the drawer back to its default, unresolved cart UI.
  const handlePrimaryCta = () => {
    if (resolvedProject) clearResolvedProject();
    else openQuote();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isQuoteOpen) backToCart();
      else close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isQuoteOpen, close]);

  // Reset to the cart page whenever the drawer closes, so it doesn't reopen
  // mid-quotation-search next time.
  useEffect(() => {
    if (!isOpen) setIsQuoteOpen(false);
  }, [isOpen]);

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

      {/* Floating sidebar — 8px from top, bottom, right. Width is fixed
          regardless of resolution state or list structure: this panel sits
          over a live tour during a screen share, and widening it would cover
          the tour at the moment of commitment. */}
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
        <div className="relative flex-1 min-h-0">

          {/* ── CART / DESIGN SCOPE PAGE ──────────────────────────── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${isQuoteOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}
            `}
          >
            <header className="shrink-0 px-element pt-element pb-tight border-b border-spatial-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-tight">
                  <img src="/assets/icons/default_icon.svg" alt="" aria-hidden className="w-6 h-6 opacity-50" />
                  <Typography variant="titleLarge" weight="bold" colorClass="text-neutral-50">
                    <span id="estimate-title">{resolvedProject ? 'Your design' : 'Your Cart'}</span>
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
              {resolvedProject ? (
                <div className="flex items-center gap-tight mt-tight">
                  <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest">
                    Configuration
                  </Typography>
                  <div className="relative">
                    <select
                      value={resolvedProject.bhkType}
                      onChange={(e) => setBhkType(e.target.value)}
                      aria-label="Change BHK configuration — updates the rooms below"
                      className="
                        appearance-none rounded-pill border border-spatial-border bg-spatial-glass-elevated
                        pl-element pr-6 py-0.5
                        text-xs font-semibold uppercase tracking-wide text-neutral-100
                        hover:border-spatial-border-elevated transition-colors duration-150
                        focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500
                      "
                    >
                      {BHK_OPTIONS.map((bhk) => (
                        <option key={bhk} value={bhk} className="bg-neutral-900 text-neutral-100">
                          {bhk}
                        </option>
                      ))}
                    </select>
                    <img
                      src="/assets/icons/chevron_down.svg"
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 opacity-50"
                    />
                  </div>
                </div>
              ) : (
                projectBreadcrumb && (
                  <Typography variant="bodySmall" colorClass="text-neutral-500" className="uppercase tracking-widest mt-tight">
                    {projectBreadcrumb}
                  </Typography>
                )
              )}
            </header>

            {/* Items list */}
            <div className="flex-1 relative min-h-0">
              {toast && (
                <div
                  className="
                    absolute top-tight left-tight right-tight z-20
                    px-element py-tight rounded-element
                    bg-spatial-glass-elevated border border-spatial-border-elevated shadow-modal backdrop-blur-2xl
                  "
                >
                  <Typography variant="bodySmall" colorClass="text-neutral-200">{toast}</Typography>
                </div>
              )}

              <div className="h-full overflow-y-auto custom-scrollbar">
                {!resolvedProject ? (
                  // ── Flat list — no unit resolved yet, nothing to group by. ──
                  summary.groups.length === 0 ? (
                    <div className="flex items-center justify-center h-full px-group py-12">
                      <Typography variant="bodyMedium" colorClass="text-neutral-400" className="text-center">
                        Nothing in your cart yet. Tap a hotspot and add a module or product to get started.
                      </Typography>
                    </div>
                  ) : (
                    summary.groups.map((group) =>
                      group.items.map((item, idx) => (
                        <div key={item.id}>
                          <CartItemRow
                            item={item}
                            roomLabel={group.roomLabel.replace(/-/g, ' ')}
                            selectedRoomKey={item.roomSlug}
                            roomOptions={roomList}
                            onSelectRoom={(slug) => setItemRoom(item.id, slug)}
                            onRemove={() => removeItem(item.id)}
                            onQuantityChange={(q) => setQuantity(item.id, q)}
                          />
                          {idx < group.items.length - 1 && (
                            <div className="mx-element border-t border-spatial-border" />
                          )}
                        </div>
                      )),
                    )
                  )
                ) : (
                  // ── Room-grouped design scope — driven by the resolved
                  // unit's BHK skeleton. Empty rooms still render; items that
                  // don't resolve to a current room surface in Unassigned. ──
                  <>
                    {designScope.unassignedItems.length > 0 && (
                      <div className="border-b border-spatial-border">
                        <div className="flex items-center gap-tight px-element py-tight">
                          <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100">
                            Unassigned
                          </Typography>
                          <Typography variant="bodySmall" colorClass="text-neutral-500">
                            · {designScope.unassignedItems.length} item{designScope.unassignedItems.length !== 1 ? 's' : ''} · {formatINR(designScope.unassignedSubtotalMinor)}
                          </Typography>
                        </div>
                        {designScope.unassignedItems.map((item, idx) => (
                          <div key={item.id}>
                            <CartItemRow
                              item={item}
                              roomLabel="Unassigned"
                              selectedRoomKey="unassigned"
                              roomOptions={projectRoomOptions}
                              onSelectRoom={(roomKey) => setItemRoom(item.id, roomKey)}
                              onRemove={() => removeItem(item.id)}
                              onQuantityChange={(q) => setQuantity(item.id, q)}
                            />
                            {idx < designScope.unassignedItems.length - 1 && (
                              <div className="mx-element border-t border-spatial-border" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {designScope.roomGroups.map((group) => (
                      <RoomSection
                        key={group.room.key}
                        title={group.room.name}
                        itemCount={group.items.length}
                        subtotalMinor={group.subtotalMinor}
                        isEmpty={group.items.length === 0}
                        onRemoveRoom={() => handleRemoveRoom(group.room.key, group.room.name, group.items.length)}
                      >
                        {group.items.map((item, idx) => (
                          <div key={item.id}>
                            <CartItemRow
                              item={item}
                              roomLabel={group.room.name}
                              selectedRoomKey={group.room.key}
                              roomOptions={projectRoomOptions}
                              onSelectRoom={(roomKey) => setItemRoom(item.id, roomKey)}
                              onRemove={() => removeItem(item.id)}
                              onQuantityChange={(q) => setQuantity(item.id, q)}
                            />
                            {idx < group.items.length - 1 && (
                              <div className="mx-element border-t border-spatial-border" />
                            )}
                          </div>
                        ))}
                      </RoomSection>
                    ))}

                    <AddRoomMenu rooms={rooms} onAddRoom={addRoom} />
                  </>
                )}
              </div>
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

                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="
                    w-full h-12 mt-tight rounded-pill
                    bg-primary-500 text-white
                    hover:bg-primary-400
                    shadow-card transition-all duration-200 active:scale-[0.98]
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                  "
                >
                  <Typography variant="cta" weight="bold" colorClass="text-inherit">
                    {resolvedProject ? 'Push to BLOCKS' : 'Send for Quotation'}
                  </Typography>
                </button>
              </footer>
            )}
          </div>

          {/* ── QUOTATION PAGE ────────────────────────────────────── */}
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-opacity duration-300
              ${isQuoteOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}
            `}
          >
            <header className="shrink-0 flex items-center gap-element px-element pt-element pb-tight border-b border-spatial-border">
              <button
                type="button"
                onClick={backToCart}
                className="
                  flex items-center gap-tight shrink-0
                  text-neutral-300 hover:text-white transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-element
                "
              >
                <img src="/assets/icons/chevron_previous.svg" alt="" aria-hidden className="w-3.5 h-3.5 opacity-70" />
                <Typography variant="bodySmall" colorClass="text-inherit">Cart</Typography>
              </button>
              <div className="flex-1 min-w-0">
                <Typography variant="titleLarge" weight="bold" colorClass="text-neutral-50" className="truncate">
                  Send for quotation
                </Typography>
                <Typography variant="bodySmall" colorClass="text-neutral-400">
                  {summary.itemCount} item{summary.itemCount !== 1 ? 's' : ''}
                </Typography>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="
                  w-11 h-11 rounded-pill flex items-center justify-center shrink-0
                  bg-spatial-glass-elevated border border-spatial-border
                  text-neutral-300 hover:text-white hover:bg-white/10
                  transition-all duration-200 active:scale-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                "
              >
                ×
              </button>
            </header>

            {/* Search */}
            <div className="shrink-0 px-element pt-element pb-tight">
              <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-100" className="mb-tight">
                Which project is this for?
              </Typography>
              <div className="relative">
                <img
                  src="/assets/icons/default_icon.svg"
                  alt=""
                  aria-hidden
                  className="absolute left-element top-1/2 -translate-y-1/2 w-4 h-4 opacity-40"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, society, or INCO id…"
                  className="
                    w-full h-11 pl-11 pr-element rounded-pill
                    bg-spatial-glass-elevated border border-spatial-border
                    text-neutral-100 placeholder:text-neutral-500
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                  "
                />
              </div>
              {query.trim() && (
                <Typography variant="bodySmall" colorClass="text-neutral-500" className="mt-tight">
                  {results.length} match{results.length !== 1 ? 'es' : ''}
                </Typography>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-tight pb-tight">
              {results.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Typography variant="bodyMedium" colorClass="text-neutral-400">
                    No matches for &ldquo;{query}&rdquo;.
                  </Typography>
                </div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectResult(r)}
                    className="
                      w-full flex items-center justify-between gap-element
                      px-element py-tight rounded-element text-left
                      hover:bg-white/5 transition-colors duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                    "
                  >
                    <div className="min-w-0">
                      <Typography variant="titleSmall" weight="semiBold" colorClass="text-neutral-50" className="truncate">
                        {r.name}
                      </Typography>
                      <Typography variant="bodySmall" colorClass="text-neutral-400" className="mt-0.5 truncate">
                        {r.tower} · Unit {r.unit} · {r.bhkType}
                      </Typography>
                    </div>
                    <Typography variant="bodySmall" colorClass="text-neutral-500" className="shrink-0 tracking-wide">
                      {r.incoId}
                    </Typography>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};
