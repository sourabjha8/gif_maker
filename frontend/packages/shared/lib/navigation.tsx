'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ScreenId, FlowState, FlowAction, Society, ExperienceMode } from '../types';

// ─── Initial State ───────────────────────────────────────────────

const STORAGE_KEY = 'vxp_flow_state';

const initialState: FlowState = {
  currentScreen: 'start',
  experienceMode: null,
  selectedCity: null,
  selectedSociety: null,
  selectedRoomType: null,
  roomFilters: {},
  selectedCitySlug: null,
  selectedProjectSlug: null,
  selectedRoomSlug: null,
};

/** Read persisted state from sessionStorage. Falls back to initialState. */
function loadPersistedState(): FlowState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<FlowState>;
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

// ─── Reducer ─────────────────────────────────────────────────────

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'GO_TO':
      return { ...state, currentScreen: action.screen };
    case 'SELECT_MODE':
      return { ...state, experienceMode: action.mode };
    case 'SELECT_CITY':
      return { ...state, selectedCity: action.city };
    case 'SELECT_SOCIETY':
      return { ...state, selectedSociety: action.society };
    case 'SELECT_ROOM_TYPE':
      return { ...state, selectedRoomType: action.roomType };
    case 'SET_FILTERS':
      return { ...state, roomFilters: action.filters };
    case 'SET_TOUR_SLUGS':
      return {
        ...state,
        selectedCitySlug: action.citySlug,
        selectedProjectSlug: action.projectSlug,
        selectedRoomSlug: action.roomSlug,
      };
    case 'RESET':
      if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
      return initialState;
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────

interface FlowContextValue {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  /** Navigate to a screen. */
  goTo: (screen: ScreenId) => void;
  /** Navigate to a screen while also setting a selection. */
  selectModeAndGo: (mode: ExperienceMode) => void;
  selectCityAndGo: (city: string) => void;
  selectSocietyAndGo: (society: Society) => void;
  selectRoomTypeAndGo: (roomType: string) => void;
  setFiltersAndGo: (filters: Record<string, string>) => void;
  selectDollyRoomAndGo: (roomSlug: string) => void;
  viewSocietyOnMap: (society: Society) => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(flowReducer, undefined, loadPersistedState);
  const [hasMounted, setHasMounted] = React.useState(false);

  // Mark as ready after first client paint — sessionStorage is already loaded
  // via the useReducer initializer, so we just need to unblock the render.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Persist state to sessionStorage on every change (clears on tab close, survives refresh).
  useEffect(() => {
    if (!hasMounted) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage unavailable — silently skip persistence.
    }
  }, [state, hasMounted]);

  const goTo = useCallback(
    (screen: ScreenId) => dispatch({ type: 'GO_TO', screen }),
    [],
  );

  const selectModeAndGo = useCallback((mode: ExperienceMode) => {
    dispatch({ type: 'SELECT_MODE', mode });
    dispatch({ type: 'GO_TO', screen: mode === 'walk-around' ? 'room-type' : 'location' });
  }, []);

  const selectCityAndGo = useCallback((city: string) => {
    dispatch({ type: 'SELECT_CITY', city });
    dispatch({ type: 'GO_TO', screen: 'project' });
  }, []);

  const selectSocietyAndGo = useCallback((society: Society) => {
    dispatch({ type: 'SELECT_SOCIETY', society });
    dispatch({ type: 'GO_TO', screen: 'room' });
  }, []);

  /** Open the dolly (floor-plan map) flow for a society. */
  const viewSocietyOnMap = useCallback((society: Society) => {
    dispatch({ type: 'SELECT_SOCIETY', society });
    dispatch({
      type: 'SET_TOUR_SLUGS',
      citySlug: 'bangalore',
      projectSlug: 'prestige-kingfisher-towers',
      roomSlug: '',
    });
    dispatch({ type: 'GO_TO', screen: 'dolly' });
  }, []);

  const selectRoomTypeAndGo = useCallback((roomType: string) => {
    dispatch({ type: 'SELECT_ROOM_TYPE', roomType });
    dispatch({ type: 'GO_TO', screen: 'room-filter' });
  }, []);

  const setFiltersAndGo = useCallback((filters: Record<string, string>) => {
    dispatch({ type: 'SET_FILTERS', filters });
    dispatch({ type: 'GO_TO', screen: 'experience' });
  }, []);

  const selectDollyRoomAndGo = useCallback((roomSlug: string) => {
    dispatch({
      type: 'SET_TOUR_SLUGS',
      citySlug: 'bangalore',
      projectSlug: 'prestige-kingfisher-towers',
      roomSlug,
    });
    dispatch({ type: 'GO_TO', screen: 'experience' });
  }, []);

  const value: FlowContextValue = {
    state,
    dispatch,
    goTo,
    selectModeAndGo,
    selectCityAndGo,
    selectSocietyAndGo,
    selectRoomTypeAndGo,
    setFiltersAndGo,
    selectDollyRoomAndGo,
    viewSocietyOnMap,
  };

  // Block render until client has read sessionStorage — prevents start-screen flash.
  // All hooks are declared above, so this early return is safe.
  if (!hasMounted) return null;

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

// ─── Hook ────────────────────────────────────────────────────────

export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}
