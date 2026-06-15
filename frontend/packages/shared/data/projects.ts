import type { CityProjectMap } from '../types';

/**
 * City-to-projects mapping data.
 * Each city contains a list of societies (real estate projects).
 *
 * TODO: Replace with API call — `GET /api/cities/:cityName/projects`
 */
export const PROJECTS_DATA: CityProjectMap = {
  Gurugram: {
    cityName: 'Gurugram',
    cityNameHindi: 'गुरुग्राम',
    state: 'Haryana',
    country: 'India',
    societies: [
      {
        name: 'DLF Camellias',
        bhk: '2 BHK',
        address: 'Gold Course Road',
        logo: '/assets/icons/default_icon.svg',
      },
      {
        name: 'M3M Golf Hills',
        bhk: '3 BHK',
        address: 'Gold Course Road',
        logo: '/assets/icons/default_icon.svg',
      },
      {
        name: 'Godrej',
        bhk: '1 BHK',
        address: 'Gold Course Road',
        logo: '/assets/icons/default_icon.svg',
      },
    ],
  },
  Mumbai: {
    cityName: 'Mumbai',
    cityNameHindi: 'मुंबई',
    state: 'Maharashtra',
    country: 'India',
    societies: [
      {
        name: 'Lodha Altamount',
        bhk: '4 BHK',
        address: 'Altamount Road',
        logo: '/assets/icons/default_icon.svg',
      },
      {
        name: 'Piramal Mahalaxmi',
        bhk: '3 BHK',
        address: 'Mahalaxmi',
        logo: '/assets/icons/default_icon.svg',
      },
    ],
  },
  Bangalore: {
    cityName: 'Bangalore',
    cityNameHindi: 'बेंगलुरु',
    state: 'Karnataka',
    country: 'India',
    societies: [
      {
        name: 'Prestige Kingfisher Towers',
        bhk: '4 BHK',
        address: 'Ashok Nagar',
        logo: '/assets/icons/default_icon.svg',
      },
    ],
  },
  Pune: {
    cityName: 'Pune',
    cityNameHindi: 'पुणे',
    state: 'Maharashtra',
    country: 'India',
    societies: [
      {
        name: 'Panchshil Trump Towers',
        bhk: '5 BHK',
        address: 'Kalyani Nagar',
        logo: '/assets/icons/default_icon.svg',
      },
    ],
  },
};

/** Default fallback city name. */
export const DEFAULT_CITY = 'Gurugram';
