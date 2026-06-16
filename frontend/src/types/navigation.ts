import type { Society } from './project';
import type { ExperienceMode } from './experience';

/**
 * Navigation types for the onboarding flow.
 * Defines all screen identifiers and the shared state
 * that flows between screens.
 */

/** All possible screen IDs in the onboarding wizard. */
export type ScreenId =
  | 'start'
  | 'login'
  | 'choose'
  | 'location'
  | 'project'
  | 'room'
  | 'room-type'
  | 'room-filter'
  | 'dolly'
  | 'experience'
  | 'estimate';

/** State that accumulates as the user progresses through screens. */
export interface FlowState {
  currentScreen: ScreenId;
  experienceMode: ExperienceMode | null;
  selectedCity: string | null;
  selectedSociety: Society | null;
  selectedRoomType: string | null;
  roomFilters: Record<string, string>;
  /** Tour content slugs — set when entering the experience. */
  selectedCitySlug: string | null;
  selectedProjectSlug: string | null;
  selectedRoomSlug: string | null;
}

/** Actions that can update the flow state. */
export type FlowAction =
  | { type: 'GO_TO'; screen: ScreenId }
  | { type: 'SELECT_MODE'; mode: ExperienceMode }
  | { type: 'SELECT_CITY'; city: string }
  | { type: 'SELECT_SOCIETY'; society: Society }
  | { type: 'SELECT_ROOM_TYPE'; roomType: string }
  | { type: 'SET_FILTERS'; filters: Record<string, string> }
  | { type: 'SET_TOUR_SLUGS'; citySlug: string; projectSlug: string; roomSlug: string }
  | { type: 'RESET' };
