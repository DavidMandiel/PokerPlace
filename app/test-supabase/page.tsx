"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabaseUrl = "http://127.0.0.1:54321";
        const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
        
        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
        
        // Test basic connection
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError(`Auth error: ${userError.message}`);
          setConnectionStatus("❌ Connection failed");
        } else {
          setConnectionStatus("✅ Connected successfully");
          setUser(user);
        }
      } catch (err: any) {
        setError(`Connection error: ${err.message}`);
        setConnectionStatus("❌ Connection failed");
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg">{connectionStatus}</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2">
            <p><strong>URL:</strong> http://127.0.0.1:54321</p>
            <p><strong>Anon Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0</p>
          </div>
        </div>

        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
