# Nearby Clinics Feature

## Overview
The Nearby Clinics feature allows users to find dermatology and medical clinics in their area using the SerpAPI Google Maps integration.

## Features
- **Location-based search**: Uses browser geolocation to find nearby clinics
- **Customizable search**: Users can search for specific types of clinics (dermatology, skin doctors, etc.)
- **Detailed clinic information**: Shows ratings, reviews, contact info, and addresses
- **Google Maps integration**: Direct links to view clinics on Google Maps
- **Responsive design**: Works on desktop and mobile devices

## Implementation Details

### Files Added/Modified
1. **`src/services/serpAPI.js`** - SerpAPI integration service
2. **`src/pages/NearbyClinics.jsx`** - Main clinic finder page component
3. **`src/App.jsx`** - Added route for `/nearby-clinics`
4. **`src/components/layout/Navbar.jsx`** - Added navigation link
5. **`.env`** - Added SerpAPI key configuration

### Dependencies Added
- `serpapi` - Official SerpAPI Node.js client

### Environment Variables
```
VITE_SERP_API_KEY=your_serpapi_key_here
```

## Usage

### For Users
1. Navigate to the "Clinics" section in the navigation bar
2. Click "Get Location" to allow location access
3. Optionally modify the search query (default: "dermatology clinic")
4. Click "Search" to find nearby clinics
5. View clinic details and click "View on Maps" to get directions

### For Developers

#### SerpAPI Service Functions
```javascript
import { searchNearbyClinics, getCurrentLocation, formatClinicData } from '../services/serpAPI';

// Get user location
const location = await getCurrentLocation();

// Search for clinics
const results = await searchNearbyClinics(
  location.latitude, 
  location.longitude, 
  "dermatology clinic"
);

// Format results for display
const clinics = formatClinicData(results.local_results);
```

#### API Response Structure
The SerpAPI returns clinic data with the following structure:
```javascript
{
  id: "unique_clinic_id",
  name: "Clinic Name",
  address: "Full Address",
  rating: 4.5,
  reviews: 123,
  type: "Medical Clinic",
  types: ["Dermatology", "Medical Clinic"],
  phone: "+1234567890",
  website: "https://clinic-website.com",
  coordinates: { latitude: 40.123, longitude: -74.456 },
  thumbnail: "image_url"
}
```

## Configuration

### SerpAPI Setup
1. Sign up for a SerpAPI account at https://serpapi.com/
2. Get your API key from the dashboard
3. Add the key to your `.env` file as `VITE_SERP_API_KEY`

### Search Parameters
The search can be customized by modifying these parameters in `searchNearbyClinics()`:
- `query`: Search term (e.g., "dermatology clinic", "skin doctor")
- `zoom`: Map zoom level (default: 14)
- `hl`: Language (default: "en")

## Error Handling
The feature includes comprehensive error handling for:
- Missing API key
- Geolocation permission denied
- Network errors
- No results found
- Invalid API responses

## Security Considerations
- API key is stored as an environment variable
- Geolocation requires user permission
- External links open in new tabs for security

## Future Enhancements
- Filter by clinic type, rating, or distance
- Show clinics on an interactive map
- Save favorite clinics
- Appointment booking integration
- Reviews and ratings from users
- Clinic availability and hours display
