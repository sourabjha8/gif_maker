'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Viewer } from '@photo-sphere-viewer/core';
import { GlassIconButton } from '../GlassIconButton';

export interface MinimapRoom {
  slug: string;
  name: string;
}

export interface RoomMinimapProps {
  /** Rooms in the current project, in plan order. */
  rooms: MinimapRoom[];
  /** Slug of the room the user is currently standing in. */
  activeRoomSlug: string;
  /**
   * Live Photo Sphere Viewer instance. When supplied, the "you" marker's
   * field-of-view cone rotates to follow the camera yaw.
   */
  viewerRef?: React.MutableRefObject<Viewer | null>;
  /** Fade + lift the whole control away (e.g. during a walkthrough). */
  hidden?: boolean;
  /** Shared idle-dim state — lifted to TourScreen so every chrome group
   * dims/restores together instead of independently. */
  dimmed: boolean;
  onRestore: () => void;
  onScheduleDim: () => void;
}

// ── Floor-plan geometry ──────────────────────────────────────────────
// The content model carries no floor-plan coordinates, so we synthesise a
// schematic plan from the room list: a deterministic binary partition of the
// plan rectangle (alternating split axis) tiles the space into plan-like
// rooms with no gaps and a stable arrangement per project.

const VIEW_W = 200;
const VIEW_H = 160;
const PLAN = { x: 12, y: 12, w: 176, h: 136 };
const GAP = 3; // "wall" thickness drawn between adjacent rooms

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function partition(count: number, rect: Rect, horizontal: boolean): Rect[] {
  if (count <= 1) return [rect];
  const a = Math.ceil(count / 2);
  const b = count - a;
  const ratio = a / count;

  let r1: Rect;
  let r2: Rect;
  if (horizontal) {
    const h1 = rect.h * ratio;
    r1 = { x: rect.x, y: rect.y, w: rect.w, h: h1 };
    r2 = { x: rect.x, y: rect.y + h1, w: rect.w, h: rect.h - h1 };
  } else {
    const w1 = rect.w * ratio;
    r1 = { x: rect.x, y: rect.y, w: w1, h: rect.h };
    r2 = { x: rect.x + w1, y: rect.y, w: rect.w - w1, h: rect.h };
  }
  return [...partition(a, r1, !horizontal), ...partition(b, r2, !horizontal)];
}

interface PlanCell extends Rect {
  slug: string;
  name: string;
  cx: number;
  cy: number;
}

function buildPlan(rooms: MinimapRoom[]): PlanCell[] {
  if (rooms.length === 0) return [];
  // Start by splitting along the longer axis first for balanced proportions.
  const rects = partition(rooms.length, PLAN, PLAN.w < PLAN.h);
  return rooms.map((room, i) => {
    const r = rects[i] ?? PLAN;
    const inset = GAP / 2;
    const x = r.x + inset;
    const y = r.y + inset;
    const w = Math.max(0, r.w - GAP);
    const h = Math.max(0, r.h - GAP);
    return { slug: room.slug, name: room.name, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  });
}

export const RoomMinimap: React.FC<RoomMinimapProps> = ({
  rooms,
  activeRoomSlug,
  viewerRef,
  hidden = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fovRef = useRef<SVGGElement>(null);
  const lastYaw = useRef<number | null>(null);
  const { dimmed, restore, scheduledim } = useAutoDim();

  const cells = useMemo(() => buildPlan(rooms), [rooms]);
  const activeCell = useMemo(
    () => cells.find((c) => c.slug === activeRoomSlug) ?? cells[0],
    [cells, activeRoomSlug],
  );
  const activeName =
    rooms.find((r) => r.slug === activeRoomSlug)?.name ?? rooms[0]?.name ?? 'Room';

  // Collapse whenever the control is hidden (e.g. entering a walkthrough).
  useEffect(() => {
    if (hidden) setExpanded(false);
  }, [hidden]);

  // Escape collapses the expanded plan.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  // Clicking anywhere outside the panel collapses it.
  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [expanded]);

  // Rotate the "you" marker's FOV cone to match the live camera yaw. Mutates
  // the SVG group imperatively so the tour tree never re-renders during a drag.
  useEffect(() => {
    if (!expanded || !viewerRef) return;
    let raf = 0;
    const tick = () => {
      const viewer = viewerRef.current;
      const g = fovRef.current;
      if (viewer && g) {
        try {
          const { yaw } = viewer.getPosition();
          if (lastYaw.current === null || Math.abs(yaw - lastYaw.current) > 0.008) {
            lastYaw.current = yaw;
            g.setAttribute('transform', `rotate(${(yaw * 180) / Math.PI})`);
          }
        } catch {
          /* viewer not ready yet — retry next frame */
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [expanded, viewerRef]);

  // Keep the marker sized to its room so it never spills out of a small cell.
  const markerScale = activeCell
    ? Math.max(0.5, Math.min(1.1, Math.min(activeCell.w, activeCell.h) / 52))
    : 1;

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none absolute left-[max(1rem,env(safe-area-inset-left))] bottom-[max(1rem,env(safe-area-inset-bottom))] md:left-[max(1.5rem,env(safe-area-inset-left))] md:bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 transition-all duration-500 ease-in-out ${
        hidden ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Collapsed trigger — idle-dims like the right-rail icon dock, and
          restores to full opacity on hover/touch. */}
      <div
        className={`absolute left-0 bottom-0 transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
          expanded
            ? 'opacity-0 scale-90 pointer-events-none'
            : dimmed
              ? 'opacity-[0.45] scale-100 pointer-events-auto'
              : 'opacity-100 scale-100 pointer-events-auto'
        }`}
        onMouseEnter={restore}
        onMouseLeave={scheduledim}
        onTouchStart={restore}
        onTouchEnd={scheduledim}
      >
        <GlassIconButton
          label="Floor plan"
          tooltip
          tooltipPosition="top"
          shape="rounded"
          onClick={() => setExpanded(true)}
          aria-expanded={expanded}
        >
          <img
            src="/assets/icons/map.svg"
            alt=""
            aria-hidden="true"
            className="w-6 h-6 opacity-90"
          />
        </GlassIconButton>
      </div>

      {/* Expanded floor-plan panel */}
      <div
        role="group"
        aria-label={`Floor plan — you are in ${activeName}`}
        className={`absolute left-0 bottom-0 origin-bottom-left w-[min(360px,calc(min(100dvh,100vw)*1.25_-_180px))] rounded-card bg-spatial-glass backdrop-blur-3xl border border-spatial-border shadow-modal overflow-hidden transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
          expanded
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-tight px-4 pt-3 pb-2">
          <span className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Map
            </span>
            <span aria-hidden="true" className="text-neutral-500">
              ·
            </span>
            <span className="text-titleSmall font-semibold text-neutral-50 truncate">
              {activeName}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Close floor plan"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-pill text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <img
              src="/assets/icons/close.svg"
              alt=""
              aria-hidden="true"
              className="w-3.5 h-3.5 opacity-80"
            />
          </button>
        </div>

        {/* Plan canvas */}
        <div className="px-3 pb-3">
          <div className="rounded-element bg-spatial-glass-elevated border border-spatial-border p-2">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-auto block"
              role="img"
              aria-label={`Schematic floor plan of ${rooms.length} rooms`}
            >
              {/* Outer wall */}
              <rect
                x={PLAN.x - 4}
                y={PLAN.y - 4}
                width={PLAN.w + 8}
                height={PLAN.h + 8}
                rx={6}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={2}
              />

              {/* Rooms */}
              {cells.map((cell) => {
                const active = cell.slug === activeRoomSlug;
                return (
                  <g key={cell.slug}>
                    <rect
                      x={cell.x}
                      y={cell.y}
                      width={cell.w}
                      height={cell.h}
                      rx={2.5}
                      fill={active ? 'rgba(23,168,229,0.18)' : 'rgba(255,255,255,0.05)'}
                      stroke={active ? '#17A8E5' : 'rgba(255,255,255,0.14)'}
                      strokeWidth={active ? 2 : 1.25}
                    />
                    <text
                      x={cell.cx}
                      y={cell.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={cell.name.length > 12 ? 5 : 6}
                      fontFamily="var(--font-sans)"
                      fill={active ? '#fafafa' : 'rgba(255,255,255,0.62)'}
                      style={{ pointerEvents: 'none' }}
                    >
                      {cell.name}
                    </text>
                  </g>
                );
              })}

              {/* You-are-here marker */}
              {activeCell && (
                <g transform={`translate(${activeCell.cx},${activeCell.cy}) scale(${markerScale})`}>
                  <g ref={fovRef}>
                    <path
                      d="M0 0 L-14 -20 A24 24 0 0 1 14 -20 Z"
                      fill="rgba(23,168,229,0.30)"
                    />
                  </g>
                  <circle r={8} fill="none" stroke="#17A8E5" strokeWidth={1} opacity={0.5}>
                    <animate
                      attributeName="r"
                      values="6;9;6"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0.1;0.5"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r={4} fill="#3FBDF1" stroke="#ffffff" strokeWidth={1.5} />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
