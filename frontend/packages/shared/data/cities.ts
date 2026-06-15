import type { FloorCityMap } from '../types';

/**
 * Floor-to-city mapping data.
 * Each floor of the experience center corresponds to one Indian city.
 *
 * TODO: Replace with API call — `GET /api/floors`
 */
export const FLOOR_CITY_MAP: FloorCityMap = {
  '1F': {
    name: 'Gurugram',
    nameHindi: 'गुरुग्राम',
    state: 'Haryana',
    country: 'India',
    projectCount: 14,
    tags: ['Luxury Interiors', 'Garden City', 'South Indian Heritage'],
    image: '/assets/images/background.png',
  },
  '2F': {
    name: 'Mumbai',
    nameHindi: 'मुंबई',
    state: 'Maharashtra',
    country: 'India',
    projectCount: 18,
    tags: ['Sea-facing Villas', 'Modern Lofts', 'Heritage Homes'],
    image: '/assets/images/background.png',
  },
  '3F': {
    name: 'Bangalore',
    nameHindi: 'बेंगलुरु',
    state: 'Karnataka',
    country: 'India',
    projectCount: 12,
    tags: ['Tech Hub Living', 'Garden City', 'Contemporary Design'],
    image: '/assets/images/background.png',
  },
  '4F': {
    name: 'Pune',
    nameHindi: 'पुणे',
    state: 'Maharashtra',
    country: 'India',
    projectCount: 14,
    tags: ['Luxury Interiors', 'Garden City', 'South Indian Heritage'],
    image: '/assets/images/background.png',
  },
};

/** Ordered list of floor labels for navigation. */
export const FLOORS = Object.keys(FLOOR_CITY_MAP);
