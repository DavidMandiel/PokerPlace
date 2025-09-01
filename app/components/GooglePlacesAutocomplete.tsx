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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useNewAPI, setUseNewAPI] = useState(false);

  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "YOUR_GOOGLE_PLACES_API_KEY";
        
        if (apiKey === "YOUR_GOOGLE_PLACES_API_KEY") {
          console.warn("Google Places API key not configured. Using fallback address parsing.");
          setIsLoaded(false);
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Error loading Google Places API:", err);
        setError("Failed to load address autocomplete");
        setIsLoaded(false);
      }
    };

    initializeGooglePlaces();
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current) {
      try {
        // Use the new PlaceAutocompleteElement API
        if (typeof google !== 'undefined' && google.maps && google.maps.places && google.maps.places.PlaceAutocompleteElement) {
          const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();
          
          // Configure the element
          autocompleteElement.setAttribute('placeholder', placeholder);
          autocompleteElement.setAttribute('class', className);
          if (required) autocompleteElement.setAttribute('required', 'true');
          
          // Apply comprehensive styling
          autocompleteElement.style.cssText = `
            width: 100% !important;
            padding: 8px 12px !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
            background-color: white !important;
            color: #374151 !important;
            font-size: 14px !important;
            outline: none !important;
            box-sizing: border-box !important;
            display: block !important;
            font-family: inherit !important;
          `;
          
          // Set initial value
          if (value) {
            autocompleteElement.value = value;
          }
          
          // Listen for place selection with proper event handling
          autocompleteElement.addEventListener('gmp-placeselect', (event: any) => {
            console.log('New API place select event:', { event });
            const place = event.place;
            if (place) {
              // Handle different property names for formatted address
              const formattedAddress = place.formattedAddress || place.formatted_address || place.displayName || '';
              if (formattedAddress) {
                onChange(formattedAddress, place);
              }
            }
          });
          
          // Listen for input changes with proper event handling
          autocompleteElement.addEventListener('input', (event: any) => {
            const inputValue = event.target?.value || event.detail?.value || '';
            console.log('New API input event:', { inputValue, event });
            onChange(inputValue);
          });
          
          // Also listen for other possible events
          autocompleteElement.addEventListener('change', (event: any) => {
            const inputValue = event.target?.value || event.detail?.value || '';
            console.log('New API change event:', { inputValue, event });
            onChange(inputValue);
          });
          
          // Clear container and add the new element
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(autocompleteElement);
          
          setUseNewAPI(true);
          console.log("✅ Using new PlaceAutocompleteElement API");
        } else {
          // Fallback: create a simple input without autocomplete
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = placeholder;
          input.className = className;
          input.value = value || '';
          if (required) input.required = true;
          input.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background-color: white;
            color: #374151;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
          `;
          
          input.addEventListener('input', (e: any) => {
            console.log('Fallback input event:', { value: e.target.value });
            onChange(e.target.value);
          });
          
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(input);
          
          setUseNewAPI(false);
          console.log("⚠️ Using fallback input (no autocomplete)");
        }
      } catch (err) {
        console.error("Error initializing autocomplete:", err);
        setError("Failed to initialize address autocomplete");
      }
    }
  }, [isLoaded, onChange, placeholder, className, required, value]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="[&>gmp-place-autocomplete-element]:w-full [&>gmp-place-autocomplete-element]:p-2 [&>gmp-place-autocomplete-element]:border [&>gmp-place-autocomplete-element]:border-gray-300 [&>gmp-place-autocomplete-element]:rounded-lg [&>gmp-place-autocomplete-element]:bg-white [&>gmp-place-autocomplete-element]:text-gray-900 [&>gmp-place-autocomplete-element]:focus:ring-2 [&>gmp-place-autocomplete-element]:focus:ring-blue-500 [&>gmp-place-autocomplete-element]:focus:border-transparent"
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      {!isLoaded && !error && (
        <p className="text-xs text-gray-500 mt-1">
          Address autocomplete will be available once API is loaded
        </p>
      )}
      {isLoaded && useNewAPI && (
        <p className="text-xs text-green-600 mt-1">
          ✅ Using latest PlaceAutocompleteElement API
        </p>
      )}
      {isLoaded && !useNewAPI && (
        <p className="text-xs text-blue-600 mt-1">
          ✅ Using legacy Autocomplete API (working reliably)
        </p>
      )}
    </div>
  );
}
