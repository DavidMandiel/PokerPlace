// Location utilities for handling multi-language location data

export interface LocationData {
  // English versions (for searching/filtering)
  city_en: string;
  state_en: string;
  country_en: string;
  
  // Local language versions (for display)
  city_local: string;
  state_local: string;
  country_local: string;
  
  // Additional data
  country_code: string; // ISO country code (US, IL, etc.)
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Common city translations for major cities
const CITY_TRANSLATIONS: Record<string, { en: string; local: string; country_code: string }> = {
  'תל אביב-יפו': { en: 'Tel Aviv', local: 'תל אביב-יפו', country_code: 'IL' },
  'תל אביב': { en: 'Tel Aviv', local: 'תל אביב', country_code: 'IL' },
  'ירושלים': { en: 'Jerusalem', local: 'ירושלים', country_code: 'IL' },
  'חיפה': { en: 'Haifa', local: 'חיפה', country_code: 'IL' },
  'באר שבע': { en: 'Beer Sheva', local: 'באר שבע', country_code: 'IL' },
  'אשדוד': { en: 'Ashdod', local: 'אשדוד', country_code: 'IL' },
  'ניו יורק': { en: 'New York', local: 'New York', country_code: 'US' },
  'לוס אנג\'לס': { en: 'Los Angeles', local: 'Los Angeles', country_code: 'US' },
  'שיקגו': { en: 'Chicago', local: 'Chicago', country_code: 'US' },
  'מיאמי': { en: 'Miami', local: 'Miami', country_code: 'US' },
  'לונדון': { en: 'London', local: 'London', country_code: 'GB' },
  'פריז': { en: 'Paris', local: 'Paris', country_code: 'FR' },
  'ברלין': { en: 'Berlin', local: 'Berlin', country_code: 'DE' },
  'רומא': { en: 'Rome', local: 'Rome', country_code: 'IT' },
  'מדריד': { en: 'Madrid', local: 'Madrid', country_code: 'ES' },
  'מוסקבה': { en: 'Moscow', local: 'Moscow', country_code: 'RU' },
  'טוקיו': { en: 'Tokyo', local: 'Tokyo', country_code: 'JP' },
  'בייג\'ינג': { en: 'Beijing', local: 'Beijing', country_code: 'CN' },
  'דובאי': { en: 'Dubai', local: 'Dubai', country_code: 'AE' },
  'אמסטרדם': { en: 'Amsterdam', local: 'Amsterdam', country_code: 'NL' },
  'וינה': { en: 'Vienna', local: 'Vienna', country_code: 'AT' },
  'ציריך': { en: 'Zurich', local: 'Zurich', country_code: 'CH' },
};

// Country translations
const COUNTRY_TRANSLATIONS: Record<string, { en: string; local: string; code: string }> = {
  'ישראל': { en: 'Israel', local: 'ישראל', code: 'IL' },
  'ארצות הברית': { en: 'United States', local: 'United States', code: 'US' },
  'בריטניה': { en: 'United Kingdom', local: 'United Kingdom', code: 'GB' },
  'אנגליה': { en: 'England', local: 'England', code: 'GB' },
  'צרפת': { en: 'France', local: 'France', code: 'FR' },
  'גרמניה': { en: 'Germany', local: 'Germany', code: 'DE' },
  'איטליה': { en: 'Italy', local: 'Italy', code: 'IT' },
  'ספרד': { en: 'Spain', local: 'Spain', code: 'ES' },
  'רוסיה': { en: 'Russia', local: 'Russia', code: 'RU' },
  'יפן': { en: 'Japan', local: 'Japan', code: 'JP' },
  'סין': { en: 'China', local: 'China', code: 'CN' },
  'איחוד האמירויות': { en: 'United Arab Emirates', local: 'United Arab Emirates', code: 'AE' },
  'הולנד': { en: 'Netherlands', local: 'Netherlands', code: 'NL' },
  'אוסטריה': { en: 'Austria', local: 'Austria', code: 'AT' },
  'שוויץ': { en: 'Switzerland', local: 'Switzerland', code: 'CH' },
  'קנדה': { en: 'Canada', local: 'Canada', code: 'CA' },
  'אוסטרליה': { en: 'Australia', local: 'Australia', code: 'AU' },
  'ברזיל': { en: 'Brazil', local: 'Brazil', code: 'BR' },
  'מקסיקו': { en: 'Mexico', local: 'Mexico', code: 'MX' },
  'ארגנטינה': { en: 'Argentina', local: 'Argentina', code: 'AR' },
};

// State/Province translations for major regions
const STATE_TRANSLATIONS: Record<string, { en: string; local: string; country_code: string }> = {
  'ניו יורק': { en: 'New York', local: 'New York', country_code: 'US' },
  'קליפורניה': { en: 'California', local: 'California', country_code: 'US' },
  'טקסס': { en: 'Texas', local: 'Texas', country_code: 'US' },
  'פלורידה': { en: 'Florida', local: 'Florida', country_code: 'US' },
  'אילינוי': { en: 'Illinois', local: 'Illinois', country_code: 'US' },
  'מרכז': { en: 'Center', local: 'מרכז', country_code: 'IL' },
  'צפון': { en: 'North', local: 'צפון', country_code: 'IL' },
  'דרום': { en: 'South', local: 'דרום', country_code: 'IL' },
  'ירושלים': { en: 'Jerusalem', local: 'ירושלים', country_code: 'IL' },
};

/**
 * Detect if text contains Hebrew characters
 */
export function isHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * Detect if text contains Arabic characters
 */
export function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Detect if text contains non-Latin characters
 */
export function isNonLatin(text: string): boolean {
  return /[^\u0000-\u024F\u1E00-\u1EFF]/.test(text);
}

/**
 * Normalize location data to handle multi-language inputs
 */
export function normalizeLocationData(
  city: string,
  state: string,
  country: string
): LocationData {
  // Check if input contains non-Latin characters
  const hasNonLatin = isNonLatin(city + state + country);
  
  let city_en = city;
  let city_local = city;
  let state_en = state;
  let state_local = state;
  let country_en = country;
  let country_local = country;
  let country_code = '';

  // Handle city translations
  if (CITY_TRANSLATIONS[city]) {
    city_en = CITY_TRANSLATIONS[city].en;
    city_local = CITY_TRANSLATIONS[city].local;
    country_code = CITY_TRANSLATIONS[city].country_code;
  } else if (hasNonLatin) {
    // For non-Latin cities not in our dictionary, keep local but try to find English equivalent
    city_en = city; // Could be enhanced with translation API in the future
  }

  // Handle state translations
  if (STATE_TRANSLATIONS[state]) {
    state_en = STATE_TRANSLATIONS[state].en;
    state_local = STATE_TRANSLATIONS[state].local;
    if (!country_code) {
      country_code = STATE_TRANSLATIONS[state].country_code;
    }
  } else if (hasNonLatin) {
    state_en = state; // Could be enhanced with translation API
  }

  // Handle country translations
  if (COUNTRY_TRANSLATIONS[country]) {
    country_en = COUNTRY_TRANSLATIONS[country].en;
    country_local = COUNTRY_TRANSLATIONS[country].local;
    country_code = COUNTRY_TRANSLATIONS[country].code;
  } else if (hasNonLatin) {
    country_en = country; // Could be enhanced with translation API
  }

  // If we don't have a country code yet, try to infer from country name
  if (!country_code) {
    const countryLower = country.toLowerCase();
    if (countryLower.includes('israel') || countryLower.includes('ישראל')) {
      country_code = 'IL';
    } else if (countryLower.includes('united states') || countryLower.includes('usa') || countryLower.includes('america') || countryLower.includes('ארצות הברית')) {
      country_code = 'US';
    } else if (countryLower.includes('united kingdom') || countryLower.includes('britain') || countryLower.includes('england') || countryLower.includes('בריטניה')) {
      country_code = 'GB';
    } else if (countryLower.includes('france') || countryLower.includes('צרפת')) {
      country_code = 'FR';
    } else if (countryLower.includes('germany') || countryLower.includes('גרמניה')) {
      country_code = 'DE';
    } else if (countryLower.includes('italy') || countryLower.includes('איטליה')) {
      country_code = 'IT';
    } else if (countryLower.includes('spain') || countryLower.includes('ספרד')) {
      country_code = 'ES';
    } else if (countryLower.includes('russia') || countryLower.includes('רוסיה')) {
      country_code = 'RU';
    } else if (countryLower.includes('japan') || countryLower.includes('יפן')) {
      country_code = 'JP';
    } else if (countryLower.includes('china') || countryLower.includes('סין')) {
      country_code = 'CN';
    }
  }

  return {
    city_en,
    city_local,
    state_en,
    state_local,
    country_en,
    country_local,
    country_code
  };
}

/**
 * Create search-friendly location string for filtering
 */
export function createLocationSearchString(locationData: LocationData): string {
  return `${locationData.city_en} ${locationData.city_local} ${locationData.state_en} ${locationData.state_local} ${locationData.country_en} ${locationData.country_local}`.toLowerCase();
}

/**
 * Check if two locations are the same (handles multi-language)
 */
export function areLocationsEqual(loc1: LocationData, loc2: LocationData): boolean {
  return (
    loc1.city_en === loc2.city_en ||
    loc1.city_local === loc2.city_local ||
    loc1.city_en === loc2.city_local ||
    loc1.city_local === loc2.city_en
  ) && (
    loc1.country_code === loc2.country_code ||
    loc1.country_en === loc2.country_en ||
    loc1.country_local === loc2.country_local
  );
}

/**
 * Format location for display (prefer local language)
 */
export function formatLocationForDisplay(locationData: LocationData, preferEnglish = false): string {
  if (preferEnglish) {
    return `${locationData.city_en}, ${locationData.state_en}, ${locationData.country_en}`;
  }
  return `${locationData.city_local}, ${locationData.state_local}, ${locationData.country_local}`;
}

/**
 * Get location suggestions for search/filter
 */
export function getLocationSuggestions(query: string, locations: LocationData[]): LocationData[] {
  const queryLower = query.toLowerCase();
  
  return locations.filter(location => {
    const searchString = createLocationSearchString(location);
    return searchString.includes(queryLower);
  });
}

/**
 * Extract location data from Google Places result
 */
export function extractLocationFromGooglePlaces(placeDetails: any): LocationData {
  const addressComponents = placeDetails.address_components || [];
  
  let city = '';
  let state = '';
  let country = '';
  let countryCode = '';
  
  // Extract components from Google Places
  addressComponents.forEach((component: any) => {
    const types = component.types;
    
    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = component.long_name;
    } else if (types.includes('country')) {
      country = component.long_name;
      countryCode = component.short_name;
    }
  });
  
  // Normalize the extracted data
  return normalizeLocationData(city, state, country);
}

/**
 * Create location data from manual parsing
 */
export function createLocationFromManualParsing(
  address: string,
  city: string,
  state: string,
  country: string
): LocationData {
  return normalizeLocationData(city, state, country);
}










