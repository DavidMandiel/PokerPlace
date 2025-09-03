// Search and filter utilities for multi-language location data

import { createLocationSearchString, getLocationSuggestions, type LocationData } from './location-utils';

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  nickname: string;
  email: string;
  // Location fields
  city?: string;
  state?: string;
  country?: string;
  city_en?: string;
  city_local?: string;
  state_en?: string;
  state_local?: string;
  country_en?: string;
  country_local?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  // Other fields
  avatar_url?: string;
  show_avatar?: boolean;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  radius?: number; // in kilometers
  center_lat?: number;
  center_lng?: number;
}

/**
 * Search users by location with multi-language support
 */
export function searchUsersByLocation(
  users: UserProfile[],
  filters: SearchFilters
): UserProfile[] {
  let filteredUsers = [...users];

  // Filter by query (searches across all location fields)
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filteredUsers = filteredUsers.filter(user => {
      const searchString = createUserSearchString(user);
      return searchString.includes(query);
    });
  }

  // Filter by specific location fields
  if (filters.city) {
    const city = filters.city.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.city?.toLowerCase().includes(city) ||
      user.city_en?.toLowerCase().includes(city) ||
      user.city_local?.toLowerCase().includes(city)
    );
  }

  if (filters.state) {
    const state = filters.state.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.state?.toLowerCase().includes(state) ||
      user.state_en?.toLowerCase().includes(state) ||
      user.state_local?.toLowerCase().includes(state)
    );
  }

  if (filters.country) {
    const country = filters.country.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.country?.toLowerCase().includes(country) ||
      user.country_en?.toLowerCase().includes(country) ||
      user.country_local?.toLowerCase().includes(country)
    );
  }

  if (filters.country_code) {
    filteredUsers = filteredUsers.filter(user => 
      user.country_code === filters.country_code
    );
  }

  // Filter by radius (if coordinates are available)
  if (filters.radius && filters.center_lat && filters.center_lng) {
    filteredUsers = filteredUsers.filter(user => {
      if (!user.latitude || !user.longitude) return false;
      
      const distance = calculateDistance(
        filters.center_lat!,
        filters.center_lng!,
        user.latitude,
        user.longitude
      );
      
      return distance <= filters.radius!;
    });
  }

  return filteredUsers;
}

/**
 * Create a search-friendly string for a user profile
 */
export function createUserSearchString(user: UserProfile): string {
  const locationParts = [
    user.city,
    user.city_en,
    user.city_local,
    user.state,
    user.state_en,
    user.state_local,
    user.country,
    user.country_en,
    user.country_local,
    user.country_code
  ].filter(Boolean);
  
  const nameParts = [
    user.name,
    user.surname,
    user.nickname,
    user.email
  ].filter(Boolean);
  
  return [...nameParts, ...locationParts].join(' ').toLowerCase();
}

/**
 * Get location suggestions for search/filter dropdowns
 */
export function getLocationFilterSuggestions(
  users: UserProfile[],
  field: 'city' | 'state' | 'country',
  query: string = ''
): string[] {
  const suggestions = new Set<string>();
  
  users.forEach(user => {
    let values: string[] = [];
    
    switch (field) {
      case 'city':
        values = [user.city, user.city_en, user.city_local].filter(Boolean) as string[];
        break;
      case 'state':
        values = [user.state, user.state_en, user.state_local].filter(Boolean) as string[];
        break;
      case 'country':
        values = [user.country, user.country_en, user.country_local].filter(Boolean) as string[];
        break;
    }
    
    values.forEach(value => {
      if (query === '' || value.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(value);
      }
    });
  });
  
  return Array.from(suggestions).sort();
}

/**
 * Get unique countries with their codes for filtering
 */
export function getCountryFilterOptions(users: UserProfile[]): Array<{
  code: string;
  name_en: string;
  name_local: string;
  count: number;
}> {
  const countryMap = new Map<string, {
    code: string;
    name_en: string;
    name_local: string;
    count: number;
  }>();
  
  users.forEach(user => {
    if (user.country_code) {
      const key = user.country_code;
      const existing = countryMap.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        countryMap.set(key, {
          code: user.country_code,
          name_en: user.country_en || user.country || '',
          name_local: user.country_local || user.country || '',
          count: 1
        });
      }
    }
  });
  
  return Array.from(countryMap.values()).sort((a, b) => a.name_en.localeCompare(b.name_en));
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Find nearby users within a radius
 */
export function findNearbyUsers(
  users: UserProfile[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Array<UserProfile & { distance: number }> {
  return users
    .filter(user => user.latitude && user.longitude)
    .map(user => ({
      ...user,
      distance: calculateDistance(centerLat, centerLng, user.latitude!, user.longitude!)
    }))
    .filter(user => user.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get location statistics for analytics
 */
export function getLocationStatistics(users: UserProfile[]): {
  totalUsers: number;
  usersWithLocation: number;
  topCities: Array<{ name: string; count: number }>;
  topCountries: Array<{ code: string; name: string; count: number }>;
  languageDistribution: { hebrew: number; english: number; other: number };
} {
  const usersWithLocation = users.filter(user => 
    user.city || user.city_en || user.city_local
  );
  
  // Top cities
  const cityCounts = new Map<string, number>();
  usersWithLocation.forEach(user => {
    const city = user.city_local || user.city_en || user.city || '';
    if (city) {
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });
  
  const topCities = Array.from(cityCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Top countries
  const countryCounts = new Map<string, { name: string; count: number }>();
  usersWithLocation.forEach(user => {
    if (user.country_code) {
      const existing = countryCounts.get(user.country_code);
      if (existing) {
        existing.count++;
      } else {
        countryCounts.set(user.country_code, {
          name: user.country_en || user.country || user.country_code,
          count: 1
        });
      }
    }
  });
  
  const topCountries = Array.from(countryCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Language distribution
  let hebrew = 0;
  let english = 0;
  let other = 0;
  
  usersWithLocation.forEach(user => {
    const hasHebrew = /[\u0590-\u05FF]/.test(
      (user.city_local || '') + (user.country_local || '')
    );
    const hasEnglish = /^[A-Za-z\s]+$/.test(
      (user.city_en || '') + (user.country_en || '')
    );
    
    if (hasHebrew) hebrew++;
    else if (hasEnglish) english++;
    else other++;
  });
  
  return {
    totalUsers: users.length,
    usersWithLocation: usersWithLocation.length,
    topCities,
    topCountries,
    languageDistribution: { hebrew, english, other }
  };
}







