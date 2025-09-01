// Test page for multi-language location functionality

"use client";
import { useState, useEffect } from 'react';
import LocationSearchDemo from '../components/LocationSearchDemo';
import { type UserProfile } from '../../lib/search-utils';

export default function TestMultiLangLocationPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for testing multi-language location functionality
  const mockUsers: UserProfile[] = [
    {
      id: '1',
      name: 'David',
      surname: 'Cohen',
      nickname: 'davidc',
      email: 'david@example.com',
      city: 'תל אביב',
      city_en: 'Tel Aviv',
      city_local: 'תל אביב',
      state: 'מרכז',
      state_en: 'Center',
      state_local: 'מרכז',
      country: 'ישראל',
      country_en: 'Israel',
      country_local: 'ישראל',
      country_code: 'IL',
      latitude: 32.0853,
      longitude: 34.7818,
      avatar_url: '/lib/images/default-avatar.png',
      show_avatar: true
    },
    {
      id: '2',
      name: 'Sarah',
      surname: 'Johnson',
      nickname: 'sarahj',
      email: 'sarah@example.com',
      city: 'New York',
      city_en: 'New York',
      city_local: 'New York',
      state: 'NY',
      state_en: 'New York',
      state_local: 'New York',
      country: 'United States',
      country_en: 'United States',
      country_local: 'United States',
      country_code: 'US',
      latitude: 40.7128,
      longitude: -74.0060,
      avatar_url: '/lib/images/default-avatar.png',
      show_avatar: true
    },
    {
      id: '3',
      name: 'אבי',
      surname: 'לוי',
      nickname: 'avil',
      email: 'avi@example.com',
      city: 'ירושלים',
      city_en: 'Jerusalem',
      city_local: 'ירושלים',
      state: 'ירושלים',
      state_en: 'Jerusalem',
      state_local: 'ירושלים',
      country: 'ישראל',
      country_en: 'Israel',
      country_local: 'ישראל',
      country_code: 'IL',
      latitude: 31.7683,
      longitude: 35.2137,
      avatar_url: '/lib/images/default-avatar.png',
      show_avatar: true
    },
    {
      id: '4',
      name: 'Michael',
      surname: 'Smith',
      nickname: 'mikes',
      email: 'michael@example.com',
      city: 'Los Angeles',
      city_en: 'Los Angeles',
      city_local: 'Los Angeles',
      state: 'CA',
      state_en: 'California',
      state_local: 'California',
      country: 'United States',
      country_en: 'United States',
      country_local: 'United States',
      country_code: 'US',
      latitude: 34.0522,
      longitude: -118.2437,
      avatar_url: '/lib/images/default-avatar.png',
      show_avatar: true
    },
    {
      id: '5',
      name: 'רחל',
      surname: 'גולדברג',
      nickname: 'rachelg',
      email: 'rachel@example.com',
      city: 'חיפה',
      city_en: 'Haifa',
      city_local: 'חיפה',
      state: 'צפון',
      state_en: 'North',
      state_local: 'צפון',
      country: 'ישראל',
      country_en: 'Israel',
      country_local: 'ישראל',
      country_code: 'IL',
      latitude: 32.7940,
      longitude: 34.9896,
      avatar_url: '/lib/images/default-avatar.png',
      show_avatar: true
    },
    {
      id: '6',
      name: 'John',
      surname: 'Brown',
      nickname: 'johnb',
      email: 'john@example.com',
      city: 'London',
      city_en: 'London',
      city_local: 'London',
      state: 'England',
      state_en: 'England',
      state_local: 'England',
      country: 'United Kingdom',
      country_en: 'United Kingdom',
      country_local: 'United Kingdom',
      country_code: 'GB',
      latitude: 51.5074,
      longitude: -0.1278,
      avatar_url: '/lib/images/default-avatar.png',
      show_avatar: true
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading multi-language location test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Multi-Language Location Search Test
            </h1>
            <p className="text-gray-600">
              This page demonstrates the multi-language location search and filtering functionality.
              Try searching for cities in different languages (English, Hebrew, etc.).
            </p>
          </div>

          <LocationSearchDemo users={users} />

          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Test Data Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Users by Country:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🇮🇱 Israel: 3 users (Tel Aviv, Jerusalem, Haifa)</li>
                  <li>🇺🇸 United States: 2 users (New York, Los Angeles)</li>
                  <li>🇬🇧 United Kingdom: 1 user (London)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Multi-Language Support:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Hebrew cities: תל אביב, ירושלים, חיפה</li>
                  <li>English cities: New York, Los Angeles, London</li>
                  <li>Country codes: IL, US, GB</li>
                  <li>Coordinates for distance calculations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">How to Test:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>1. Search for "Tel Aviv" or "תל אביב" - both should find the same user</p>
              <p>2. Search for "Israel" or "ישראל" - should find all Israeli users</p>
              <p>3. Use the city/country filters to narrow down results</p>
              <p>4. Try searching for partial city names in different languages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
