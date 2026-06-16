// Static content now lives in a single validated source:
//   data/virtual-xp-content.json  (loaded + validated via lib/content.ts).
//
// The former cities.ts / projects.ts / rooms.ts constants were migrated
// into that JSON under the `navigation` key. Read them through the
// lib/content.ts helpers (getNavFloorLabels, getNavCityByName, getNavRooms,
// getNavRoomTypes, getFilterGroups, getDefaultFilters, getDefaultSociety, …).
export {};
