# Google Places API Setup Guide

## 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API (New)** - This is the recommended API
   - **Maps JavaScript API**
   - **Places API** - Legacy API (still works but deprecated)
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

**Note**: The code now uses the new Places API which provides better functionality and eliminates the legacy API warning.

## 2. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Google Places API Configuration
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

## 3. API Key Restrictions (Recommended)

For security, restrict your API key:

1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:3000/*`, `yourdomain.com/*`)
4. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Places API" and "Maps JavaScript API"

## 4. Billing Setup

Google Places API requires billing to be enabled:
1. Go to Google Cloud Console > Billing
2. Link a billing account to your project
3. The Places API has a free tier with usage limits

## 5. Testing

Once configured, the address field will show:
- Real-time address suggestions as you type
- Accurate city, state, and country extraction
- Fallback to manual parsing if API is unavailable

## 6. Fallback Behavior

If the Google Places API key is not configured or fails to load:
- The address field will still work with manual input
- Basic address parsing will be used as fallback
- Users can still complete the form normally
