"use client";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, placeDetails?: any) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Start typing your address...",
  className = "",
  required = false
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{description: string, place_id: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "YOUR_GOOGLE_PLACES_API_KEY";
        
        if (apiKey === "YOUR_GOOGLE_PLACES_API_KEY") {
          console.error("❌ Google Places API key not configured!");
          setError("API key not configured. Check console for setup instructions.");
          setIsLoaded(false);
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places"],
          load: "async"
        });

        await loader.load();
        console.log("✅ Google Maps API loaded successfully");
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error("❌ Error loading Google Places API:", err);
        setError("Failed to load Google Maps API. Check console for troubleshooting steps.");
        setIsLoaded(false);
      }
    };

    initializeGooglePlaces();
  }, []);

  // Handle input changes and get suggestions
  const handleInputChange = async (inputValue: string) => {
    onChange(inputValue);
    
    if (isLoaded && inputValue.length > 2) {
      try {
        const service = new google.maps.places.AutocompleteService();
        const request = {
          input: inputValue,
          types: ['address'],
          language: 'en', // Get English results for consistency
          region: 'us' // Bias results to US, but will work globally
        };
        
        service.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Store both the description and place_id for later use
            const suggestionList = predictions.map(prediction => ({
              description: prediction.description,
              place_id: prediction.place_id
            }));
            setSuggestions(suggestionList);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        });
      } catch (err) {
        console.error("Error getting place predictions:", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: {description: string, place_id: string}) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Try to get place details using fetch to Places API (if we have the API key)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      // Use Places API to get place details with comprehensive fields
      fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=formatted_address,address_components,geometry,place_id&language=en&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === 'OK' && data.result) {
            onChange(suggestion.description, data.result);
          } else {
            // Fallback to just the description
            onChange(suggestion.description, { formatted_address: suggestion.description });
          }
        })
        .catch(error => {
          console.error('Error fetching place details:', error);
          // Fallback to just the description
          onChange(suggestion.description, { formatted_address: suggestion.description });
        });
    } else {
      // Fallback to just the description
      onChange(suggestion.description, { formatted_address: suggestion.description });
    }
  };

  // Handle input focus/blur
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full ${className}`}
        required={required}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.description}
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-500 mt-1 p-2 bg-red-50 border border-red-200 rounded">
          <p className="font-medium">{error}</p>
          <p className="mt-1">Check the console for detailed setup instructions.</p>
        </div>
      )}
      {!isLoaded && !error && (
        <p className="text-xs text-gray-500 mt-1">
          Address autocomplete will be available once API is loaded
        </p>
      )}

    </div>
  );
}

