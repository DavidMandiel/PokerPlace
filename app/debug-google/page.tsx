"use client";
import { useEffect, useState } from "react";

export default function DebugGooglePage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGoogleMaps = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        hasGoogleMaps: false,
        hasGoogleMapsPlaces: false,
        environment: process.env.NODE_ENV,
        apiKeyConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
      };

      // Set initial info
      setDebugInfo(info);
      setLoading(false);

      // Test if we can load Google Maps
      try {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&callback=initMap`;
        
        window.initMap = () => {
          const updatedInfo = {
            ...info,
            hasGoogleMaps: true,
            hasGoogleMapsPlaces: typeof google?.maps?.places !== 'undefined',
            googleMapsLoaded: true,
            googleMapsVersion: google?.maps?.version
          };
          setDebugInfo(updatedInfo);
        };

        script.onerror = () => {
          const errorInfo = {
            ...info,
            googleMapsError: "Failed to load Google Maps script"
          };
          setDebugInfo(errorInfo);
        };

        document.head.appendChild(script);
      } catch (error) {
        const errorInfo = {
          ...info,
          googleMapsError: error instanceof Error ? error.message : "Unknown error"
        };
        setDebugInfo(errorInfo);
      }
    };

    checkGoogleMaps();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-clean h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Google Maps Debug Information</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          
          {debugInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700">Current URL</div>
                  <div className="text-sm text-gray-600 break-all">{debugInfo.currentUrl}</div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700">Hostname</div>
                  <div className="text-sm text-gray-600">{debugInfo.hostname}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700">Protocol</div>
                  <div className="text-sm text-gray-600">{debugInfo.protocol}</div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700">Port</div>
                  <div className="text-sm text-gray-600">{debugInfo.port || "default"}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded ${debugInfo.apiKeyConfigured ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-sm font-medium text-gray-700">API Key</div>
                  <div className={`text-sm font-bold ${debugInfo.apiKeyConfigured ? 'text-green-600' : 'text-red-600'}`}>
                    {debugInfo.apiKeyConfigured ? '✅ Set' : '❌ Not Set'}
                  </div>
                </div>
                
                <div className={`p-3 rounded ${debugInfo.hasGoogleMaps ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-sm font-medium text-gray-700">Google Maps</div>
                  <div className={`text-sm font-bold ${debugInfo.hasGoogleMaps ? 'text-green-600' : 'text-red-600'}`}>
                    {debugInfo.hasGoogleMaps ? '✅ Loaded' : '❌ Not Loaded'}
                  </div>
                </div>
                
                <div className={`p-3 rounded ${debugInfo.hasGoogleMapsPlaces ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-sm font-medium text-gray-700">Places API</div>
                  <div className={`text-sm font-bold ${debugInfo.hasGoogleMapsPlaces ? 'text-green-600' : 'text-red-600'}`}>
                    {debugInfo.hasGoogleMapsPlaces ? '✅ Available' : '❌ Not Available'}
                  </div>
                </div>
              </div>

              {debugInfo.googleMapsError && (
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-sm font-medium text-red-800">Error</div>
                  <div className="text-sm text-red-700 mt-1">{debugInfo.googleMapsError}</div>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm font-medium text-blue-800">Required HTTP Referrers</div>
                <div className="text-sm text-blue-700 mt-1">
                  <div>Add these to your Google Cloud Console API key restrictions:</div>
                  <div className="mt-2 font-mono text-xs bg-white p-2 rounded">
                    {debugInfo.hostname}:{debugInfo.port || '3000'}/*<br/>
                    localhost:3000/*<br/>
                    127.0.0.1:3000/*
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-900 mb-2">Quick Fix Steps:</h3>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Go to <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
            <li>2. Navigate to APIs & Services → Credentials</li>
            <li>3. Click on your API key</li>
            <li>4. Under "Application restrictions", select "HTTP referrers (web sites)"</li>
            <li>5. Add the referrers shown above</li>
            <li>6. Click "Save" and wait 2-3 minutes</li>
            <li>7. Refresh this page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
