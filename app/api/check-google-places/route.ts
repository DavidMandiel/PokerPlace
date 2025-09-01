import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : null,
    environment: process.env.NODE_ENV,
    message: apiKey 
      ? "Google Places API key is configured" 
      : "Google Places API key is not configured. Please add NEXT_PUBLIC_GOOGLE_PLACES_API_KEY to your .env.local file"
  });
}
