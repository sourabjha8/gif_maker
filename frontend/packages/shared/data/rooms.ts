import type { Room, FilterGroup } from '../types';
import { Settings, Layout, Award, Maximize } from '../assets/icons';

/**
 * Room data used across room selection and room type selection screens.
 *
 * TODO: Replace with API call — `GET /api/societies/:societyId/rooms`
 */
export const ROOMS: Room[] = [
  {
    id: 'master-bedroom',
    name: 'Master Bedroom',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'kids-bedroom',
    name: "Kid's Bedroom",
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'guest-bedroom',
    name: 'Guest Bedroom',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'balcony',
    name: 'Balcony',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
];

/**
 * Room types for the design flow.
 * Includes an extra "Living Room" entry not in the city-flow rooms.
 *
 * TODO: Replace with API call — `GET /api/room-types`
 */
export const ROOM_TYPES: Room[] = [
  {
    id: 'master-bedroom',
    name: 'Master Bedroom',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'living-room',
    name: 'Living Room',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'kids-bedroom',
    name: "Kid's Bedroom",
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'guest-bedroom',
    name: 'Guest Bedroom',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    image: '/assets/images/background.png',
    icon: '/assets/icons/default_icon.svg',
  },
];

/**
 * Design-flow filter groups.
 *
 * TODO: Replace with API call — `GET /api/filters`
 */
export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'design',
    label: 'Design Style',
    icon: Layout,
    options: ['Modern', 'Classic', 'Industrial', 'Minimalist'],
  },
  {
    id: 'module',
    label: 'Module Type',
    icon: Settings,
    options: ['Standard', 'Premium', 'Custom'],
  },
  {
    id: 'luxury',
    label: 'Luxury Level',
    icon: Award,
    options: ['Gold', 'Platinum', 'Diamond'],
  },
  {
    id: 'size',
    label: 'Room Size',
    icon: Maximize,
    options: ['10x12 ft', '12x14 ft', '15x18 ft'],
  },
];

/** Default filter selections. */
export const DEFAULT_FILTERS: Record<string, string> = {
  design: 'Modern',
  module: 'Standard',
  luxury: 'Gold',
  size: '12x14 ft',
};

/** Default society fallback. */
export const DEFAULT_SOCIETY = {
  name: 'DLF Camellias',
  bhk: '2 BHK',
  address: 'Gold Course Road',
  logo: '/assets/icons/default_icon.svg',
};
