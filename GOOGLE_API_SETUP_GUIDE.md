# Google Maps API Setup Guide

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing for the project

## Step 2: Enable Required APIs
Enable these APIs in your Google Cloud project:
- **Places API** (required for autocomplete)
- **Maps JavaScript API** (required for the component)
- **Geocoding API** (optional, for address validation)

## Step 3: Create API Key
1. Go to [Credentials page](https://console.cloud.google.com/apis/credentials)
2. Click "Create credentials" → "API key"
3. Copy the generated API key

## Step 4: Configure API Key Restrictions (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain: `localhost:3000/*` (for development)
   - Add your production domain: `yourdomain.com/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: Places API, Maps JavaScript API, Geocoding API

## Step 5: Set Environment Variable
Create a `.env.local` file in your project root with:
```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with your real API key.

## Step 6: Restart Development Server
After setting the environment variable:
```bash
npm run dev
```

## Troubleshooting
- Make sure the API key is correct
- Check that all required APIs are enabled
- Verify API key restrictions allow your domain
- Check browser console for error messages
- Ensure you're using HTTPS in production

## Cost Considerations
- Google Maps Platform has usage limits and costs
- Monitor your usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges
- Consider implementing usage quotas







