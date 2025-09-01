import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      error: "API key not configured",
      message: "Please add NEXT_PUBLIC_GOOGLE_PLACES_API_KEY to your .env.local file"
    }, { status: 400 });
  }

  // Test the API key by making a simple request
  try {
    const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    
    return NextResponse.json({
      success: true,
      message: "API key is configured",
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
      testUrl: testUrl,
      instructions: [
        "1. Check that your API key has the correct domain restrictions",
        "2. Ensure localhost:3000/* is in your HTTP referrers",
        "3. Verify that Places API and Maps JavaScript API are enabled",
        "4. Make sure billing is enabled for your Google Cloud project"
      ]
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to test API key",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

