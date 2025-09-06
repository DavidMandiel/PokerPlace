// Demo component showing how to use multi-language location search and filtering

"use client";
import { useState, useEffect } from 'react';
import { searchUsersByLocation, getLocationFilterSuggestions, getCountryFilterOptions, type SearchFilters } from '../../lib/search-utils';
import { type UserProfile } from '../../lib/search-utils';

interface LocationSearchDemoProps {
  users?: UserProfile[];
}

export default function LocationSearchDemo({ users = [] }: LocationSearchDemoProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [countryOptions, setCountryOptions] = useState<Array<{ code: string; name_en: string; name_local: string; count: number }>>([]);

  // Update filtered results when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      query: searchQuery || undefined,
      city: selectedCity || undefined,
      country: selectedCountry || undefined
    };

    const results = searchUsersByLocation(users, filters);
    setFilteredUsers(results);
  }, [users, searchQuery, selectedCity, selectedCountry]);

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery.length > 0) {
      const suggestions = getLocationFilterSuggestions(users, 'city', searchQuery);
      setCitySuggestions(suggestions.slice(0, 5)); // Show top 5 suggestions
    } else {
      setCitySuggestions([]);
    }
  }, [users, searchQuery]);

  // Load country options
  useEffect(() => {
    const options = getCountryFilterOptions(users);
    setCountryOptions(options);
  }, [users]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Multi-Language Location Search Demo</h2>
      
      {/* Search Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Users (Name, City, Country)
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try: 'Tel Aviv', 'תל אביב', 'New York', 'ישראל'..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* City Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by City
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          {getLocationFilterSuggestions(users, 'city').map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Country Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Country
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Countries</option>
          {countryOptions.map(country => (
            <option key={country.code} value={country.name_en}>
              {country.name_en} ({country.name_local}) - {country.count} users
            </option>
          ))}
        </select>
      </div>

      {/* City Suggestions */}
      {citySuggestions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">City suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {citySuggestions.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Results ({filteredUsers.length} users found)
        </h3>
        
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500">No users found matching your criteria.</p>
        ) : (
          <div className="space-y-3">
            {filteredUsers.slice(0, 10).map(user => (
              <div key={user.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  {user.avatar_url && (
                    <img
                      src={user.avatar_url}
                      alt={user.nickname}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {user.name} {user.surname} ({user.nickname})
                    </h4>
                    <p className="text-sm text-gray-600">
                      {user.city_local || user.city_en || user.city}
                      {user.state_local || user.state_en || user.state ? 
                        `, ${user.state_local || user.state_en || user.state}` : ''}
                      {user.country_local || user.country_en || user.country ? 
                        `, ${user.country_local || user.country_en || user.country}` : ''}
                    </p>
                    {user.country_code && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">
                        {user.country_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                Showing first 10 results. {filteredUsers.length - 10} more users found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Multi-language Examples */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Multi-Language Search Examples:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Search "Tel Aviv" or "תל אביב" to find users in Tel Aviv</p>
          <p>• Search "Israel" or "ישראל" to find users in Israel</p>
          <p>• Search "New York" to find users in New York</p>
          <p>• Search "Jerusalem" or "ירושלים" to find users in Jerusalem</p>
        </div>
      </div>
    </div>
  );
}










