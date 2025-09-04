"use client";
import { useState } from "react";

export default function TestAddIconPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const addIconField = async () => {
    setLoading(true);
    setResult("Adding icon field...");
    
    try {
      const response = await fetch('/api/add-icon-field', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`Success: ${data.message}`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-app min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add Icon Field Test</h1>
        
        <button
          onClick={addIconField}
          disabled={loading}
          className="w-full btn-accent rounded-xl py-3 mb-4 disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Icon Field to Database"}
        </button>
        
        {result && (
          <div className="p-4 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl">
            <p className="text-sm">{result}</p>
          </div>
        )}
        
        <div className="mt-6 text-sm text-emerald-mintSoft">
          <p>This will add the 'icon' column to the clubs table.</p>
          <p>After running this, try uploading an icon to a club again.</p>
        </div>
      </div>
    </div>
  );
}













