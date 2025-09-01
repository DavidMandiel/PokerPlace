"use client";
import { useEffect, useState } from "react";

export default function TestApiKeyPage() {
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    hasKey: boolean;
    keyLength: number;
    keyPrefix: string;
  } | null>(null);

  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "YOUR_GOOGLE_PLACES_API_KEY";
    
    setApiKeyStatus({
      hasKey: apiKey !== "YOUR_GOOGLE_PLACES_API_KEY",
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10) + "..."
    });
  }, []);

  const testApiKey = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey || apiKey === "YOUR_GOOGLE_PLACES_API_KEY") {
      setTestResult("❌ No API key configured");
      return;
    }

    try {
      // Test the API key by loading the Google Maps JavaScript API with proper async loading
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=testCallback&loading=async`;
      
      // Create a global callback function
      (window as any).testCallback = () => {
        setTestResult("✅ API key is working correctly! Google Maps API loaded successfully.");
        // Clean up
        delete (window as any).testCallback;
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
      
      // Handle script load error
      script.onerror = () => {
        setTestResult("❌ API key is invalid or restricted. Check your API key and restrictions.");
        delete (window as any).testCallback;
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
      
      document.head.appendChild(script);
      
    } catch (error) {
      setTestResult(`❌ Error testing API key: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Google Maps API Key Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">API Key Status</h2>
          
          {apiKeyStatus && (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Has API Key:</span>{" "}
                <span className={apiKeyStatus.hasKey ? "text-green-600" : "text-red-600"}>
                  {apiKeyStatus.hasKey ? "✅ Yes" : "❌ No"}
                </span>
              </p>
              <p>
                <span className="font-medium">Key Length:</span> {apiKeyStatus.keyLength} characters
              </p>
              <p>
                <span className="font-medium">Key Prefix:</span> {apiKeyStatus.keyPrefix}
              </p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={testApiKey}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test API Key
            </button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="font-medium">{testResult}</p>
            </div>
          )}
        </div>

                 <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
           <h2 className="text-lg font-semibold mb-4">Why CORS Error?</h2>
           <p className="text-sm text-gray-700 mb-4">
             The CORS error you saw is normal! Google's Places API doesn't allow direct browser requests 
             for security reasons. Instead, we test the API key by loading the Google Maps JavaScript API, 
             which is the proper way to use it in web applications.
           </p>
           <p className="text-sm text-gray-700">
             Your API key is actually working (notice the 200 OK response), but we need to use the 
             JavaScript API instead of direct HTTP requests.
           </p>
         </div>

         <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
           <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
           <ol className="list-decimal list-inside space-y-2 text-sm">
             <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
             <li>Create a new project or select existing one</li>
             <li>Enable billing for the project</li>
             <li>Enable these APIs:
               <ul className="list-disc list-inside ml-4 mt-1">
                 <li>Places API</li>
                 <li>Maps JavaScript API</li>
                 <li>Geocoding API (optional)</li>
               </ul>
             </li>
             <li>Create an API key in the Credentials page</li>
             <li>Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file in your project root</li>
             <li>Add: <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_key_here</code></li>
             <li>Restart your development server</li>
           </ol>
         </div>
      </div>
    </div>
  );
}
