"use client";
import { useEffect, useState } from "react";

export default function StatusPage() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/check-google-places');
        const data = await response.json();
        setApiStatus(data);
      } catch (error) {
        console.error('Error checking API status:', error);
        setApiStatus({ error: 'Failed to check API status' });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-clean h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking API status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Google Places API Status</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Configuration Status</h2>
          
          {apiStatus && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700">API Key Status</div>
                  <div className={`text-lg font-bold ${apiStatus.hasApiKey ? 'text-green-600' : 'text-red-600'}`}>
                    {apiStatus.hasApiKey ? '✅ Configured' : '❌ Not Configured'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700">Environment</div>
                  <div className="text-lg font-bold text-blue-600">{apiStatus.environment}</div>
                </div>
              </div>

              {apiStatus.hasApiKey && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">API Key Details</div>
                  <div className="text-sm text-green-700 mt-1">
                    <div>Length: {apiStatus.apiKeyLength} characters</div>
                    <div>Prefix: {apiStatus.apiKeyPrefix}</div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm font-medium text-blue-800">Message</div>
                <div className="text-sm text-blue-700 mt-1">{apiStatus.message}</div>
              </div>

              {apiStatus.error && (
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-sm font-medium text-red-800">Error</div>
                  <div className="text-sm text-red-700 mt-1">{apiStatus.error}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-900 mb-2">Next Steps:</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            {apiStatus?.hasApiKey ? (
              <>
                <p>✅ Your Google Places API key is configured!</p>
                <p>🔗 <a href="/test-google-places" className="underline">Test the address autocomplete</a></p>
                <p>🔗 <a href="/profile" className="underline">Try the profile page</a></p>
              </>
            ) : (
              <>
                <p>❌ Google Places API key is not configured</p>
                <p>📝 Create a <code>.env.local</code> file in your project root</p>
                <p>🔑 Add: <code>NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here</code></p>
                <p>🔄 Restart the development server</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
