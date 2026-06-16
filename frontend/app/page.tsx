'use client';

import React from 'react';
import {
  FlowProvider,
  useFlow,
  StartScreen,
  LoginScreen,
  ExperienceSelection,
  LocationSelection,
  ProjectSelection,
  RoomSelection,
  RoomTypeSelection,
  RoomFilterSelection,
  DollyScreen,
  TourScreen,
  EstimatePage,
  Navbar,
} from '../packages/shared';
import type { ScreenId } from '../packages/shared';

// ─── Screen Registry ─────────────────────────────────────────────
// Maps each ScreenId to a React component factory.
// To add a new screen: add the ScreenId type, register it here, done.

type ScreenFactory = (flow: ReturnType<typeof useFlow>) => React.ReactNode;

const SCREEN_REGISTRY: Record<ScreenId, ScreenFactory> = {
  start: ({ goTo }) => (
    <StartScreen onBegin={() => goTo('login')} />
  ),

  login: ({ goTo }) => (
    <LoginScreen onContinue={() => goTo('choose')} />
  ),

  choose: ({ selectModeAndGo }) => (
    <ExperienceSelection onContinue={(mode) => selectModeAndGo(mode)} />
  ),

  location: ({ goTo, selectCityAndGo }) => (
    <LocationSelection
      onBack={() => goTo('choose')}
      onExplore={(city) => selectCityAndGo(city)}
    />
  ),

  project: ({ goTo, state, selectSocietyAndGo, viewSocietyOnMap }) => (
    <ProjectSelection
      onBack={() => goTo('location')}
      onContinue={(society) => selectSocietyAndGo(society)}
      onViewOnMap={(society) => viewSocietyOnMap(society)}
      cityName={state.selectedCity || undefined}
    />
  ),

  room: ({ goTo, state }) => (
    <RoomSelection
      onBack={() => goTo('project')}
      onExplore={() => goTo('experience')}
      society={state.selectedSociety || undefined}
      cityName={state.selectedCity || undefined}
    />
  ),

  'room-type': ({ goTo, selectRoomTypeAndGo }) => (
    <RoomTypeSelection
      onBack={() => goTo('choose')}
      onContinue={(type) => selectRoomTypeAndGo(type)}
    />
  ),
  //heyheyhey

  'room-filter': ({ goTo, setFiltersAndGo }) => (
    <RoomFilterSelection
      onBack={() => goTo('room-type')}
      onExplore={(filters) => setFiltersAndGo(filters)}
    />
  ),

  dolly: ({ goTo, selectDollyRoomAndGo, state }) => (
    <DollyScreen
      onBack={() => goTo('project')}
      onSelectRoom={(roomSlug) => selectDollyRoomAndGo(roomSlug)}
      cityName={state.selectedCity || 'Bangalore'}
      societyName={state.selectedSociety?.name}
    />
  ),

  experience: ({ goTo, state }) => (
    <TourScreen
      onBack={() => goTo(state.selectedCitySlug === 'bangalore' ? 'dolly' : 'room')}
      onOpenEstimate={() => goTo('estimate')}
      citySlug={state.selectedCitySlug || undefined}
      projectSlug={state.selectedProjectSlug || undefined}
      roomSlug={state.selectedRoomSlug || undefined}
    />
  ),

  estimate: ({ goTo }) => (
    <EstimatePage onBack={() => goTo('experience')} />
  ),
};

function ScreenRouter() {
  const flow = useFlow();
  const { state, dispatch, goTo } = flow;
  const factory = SCREEN_REGISTRY[state.currentScreen];

  // Only show navbar if we are not on start, login, estimate, or the
  // full-screen dollhouse page (which renders its own minimal chrome).
  const showNavbar =
    state.currentScreen !== 'start' &&
    state.currentScreen !== 'login' &&
    state.currentScreen !== 'estimate' &&
    state.currentScreen !== 'dolly';

  const handleSignOut = () => {
    dispatch({ type: 'RESET' });
    goTo('start');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {showNavbar && <Navbar onSignOut={handleSignOut} />}
      <div className="w-full h-full">
        {factory(flow)}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <FlowProvider>
      <ScreenRouter />
    </FlowProvider>
  );
}
