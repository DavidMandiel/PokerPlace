"use client";
import { useState } from "react";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";
import { extractAddressComponents } from "../../lib/address-utils";

export default function TestGooglePlacesPage() {
  const [address, setAddress] = useState("");
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [components, setComponents] = useState<any>(null);

  const handleAddressChange = (newAddress: string, place?: any) => {
    setAddress(newAddress);
    setPlaceDetails(place || null);
    
    if (place) {
      const extractedComponents = extractAddressComponents(place);
      setComponents(extractedComponents);
    } else {
      setComponents(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Google Places API Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Address Autocomplete Test</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <GooglePlacesAutocomplete
              value={address}
              onChange={handleAddressChange}
              placeholder="Start typing your address..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Current Address:</h3>
              <p className="text-gray-600">{address || "No address entered"}</p>
            </div>

            {placeDetails && (
              <div>
                <h3 className="font-medium text-gray-900">Google Places Data:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(placeDetails, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {components && (
              <div>
                <h3 className="font-medium text-gray-900">Extracted Components:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>City:</strong> {components.locality || "N/A"}</div>
                    <div><strong>State:</strong> {components.administrativeAreaLevel1 || "N/A"}</div>
                    <div><strong>Country:</strong> {components.country || "N/A"}</div>
                    <div><strong>Postal Code:</strong> {components.postalCode || "N/A"}</div>
                    <div><strong>Street Number:</strong> {components.streetNumber || "N/A"}</div>
                    <div><strong>Route:</strong> {components.route || "N/A"}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-900">API Status:</h3>
              <div className="text-sm">
                <p>Environment Variable: {process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? "✅ Set" : "❌ Not Set"}</p>
                <p>Google Maps Loaded: {typeof google !== 'undefined' ? "✅ Yes" : "❌ No"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Start typing an address in the field above</li>
            <li>2. You should see Google Places suggestions appear</li>
            <li>3. Select an address from the dropdown</li>
            <li>4. Check the extracted components below</li>
            <li>5. Verify the API status indicators</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
