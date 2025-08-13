// SerpAPI configuration
const SERP_API_KEY = import.meta.env.VITE_SERP_API_KEY;
const SERP_API_BASE_URL = "https://serpapi.com/search.json";

/**
 * Search for dermatology or skin care clinics using SerpAPI
 * @param {Object} options - Search options
 * @param {string} options.locationName - Location name (e.g., "Kochi, Kerala")
 * @param {string} options.coordinates - Coordinates in format "lat,lng" (e.g., "10.008,76.361")
 * @param {string} options.query - Search query (default: "dermatology clinic")
 * @returns {Promise<Object>} - Search results from SerpAPI
 */
export const searchClinics = async ({ locationName = null, coordinates = null, query = "dermatology clinic" }) => {
  console.log("🏥 Searching for clinics...", { locationName, coordinates, query });

  if (!SERP_API_KEY) {
    throw new Error("SerpAPI key is not configured. Please add VITE_SERP_API_KEY to your environment variables.");
  }

  if (!locationName && !coordinates) {
    throw new Error("You must provide either locationName or coordinates");
  }

  try {
    // Prepare the base query object
    const params = new URLSearchParams({
      engine: "google_maps",
      q: query,
      api_key: SERP_API_KEY,
      type: "search",
      hl: "en"
    });

    // Add either coordinates or locationName
    if (coordinates) {
      // coordinates should be like: "40.7455096,-74.0083012"
      params.append('ll', `@${coordinates},14z`);
    } else if (locationName) {
      params.append('location', locationName); // e.g., "Kochi, Kerala"
    }

    const url = `${SERP_API_BASE_URL}?${params.toString()}`;
    console.log("📤 Sending request to SerpAPI:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("❌ SerpAPI Error:", data.error);
      throw new Error(data.error);
    }

    console.log("✅ SerpAPI Response received:", data);
    return data;
  } catch (error) {
    console.error("❌ Error searching for clinics:", error);
    throw error;
  }
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<Object>} - Object containing latitude and longitude
 */
export const getCurrentLocation = () => {
  console.log("📍 Getting user's current location...");
  
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("✅ Location obtained:", { latitude, longitude });
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error("❌ Error getting location:", error);
        let errorMessage = "Unable to retrieve your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions in your browser and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your internet connection.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again or check your GPS/location settings.";
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 30000, // Increased to 30 seconds
        maximumAge: 600000 // 10 minutes - allow cached location
      }
    );
  });
};

/**
 * Search for facilities based on medical condition and location
 * @param {Object} options - Search options
 * @param {string} options.locationName - Location name (e.g., "Kochi, Kerala")
 * @param {string} options.coordinates - Coordinates in format "lat,lng" (e.g., "10.008,76.361")
 * @param {string} options.condition - Medical condition (e.g., "covid19", "pneumonia", "dermatology")
 * @returns {Promise<Array>} - Array of formatted facility data
 */
export const searchFacilitiesByCondition = async ({ locationName = null, coordinates = null, condition }) => {
  console.log("🏥 Searching for facilities by condition...", { locationName, coordinates, condition });

  let nearbyFacilities = [];
  let searchTerms = [];

  // Define search terms based on condition
  switch (condition.toLowerCase()) {
    case "covid19":
    case "covid-19":
    case "covid":
      searchTerms = [
        "covid testing center",
        "diagnostic center",
        "medical laboratory",
        "hospital"
      ];
      break;
    case "pneumonia":
      searchTerms = [
        "hospital",
        "medical center",
        "healthcare facility"
      ];
      break;
    case "dermatology":
    case "skin":
      searchTerms = [
        "dermatology clinic",
        "skin care clinic",
        "skin doctor",
        "dermatologist"
      ];
      break;
    default:
      searchTerms = [
        `${condition} clinic`,
        `${condition} doctor`,
        "medical center",
        "hospital"
      ];
  }

  // Try each search term until we find results
  for (const term of searchTerms) {
    try {
      console.log(`🔍 Trying search term: "${term}"`);
      const results = await searchClinics({
        locationName,
        coordinates,
        query: term
      });

      if (results.local_results && results.local_results.length > 0) {
        // Limit to top 5 results for cleaner display
        nearbyFacilities = results.local_results.slice(0, 5).map((place, index) => ({
          name: place.title || "Unknown Facility",
          place_id: place.place_id || `facility-${index}`,
          vicinity: place.address || "Address not available",
          condition: condition,
          type: term.includes("covid")
            ? "COVID Testing Center"
            : term.includes("hospital")
            ? "Hospital/Medical Facility"
            : term.includes("dermatology") || term.includes("skin")
            ? "Dermatology/Skin Care Clinic"
            : "Medical Clinic",
          rating: place.rating || null,
          reviews: place.reviews || 0,
          phone: place.phone || null,
          website: place.website || null,
          coordinates: place.gps_coordinates || null,
          thumbnail: place.thumbnail || null
        }));

        // If we found facilities, break out of the loop
        if (nearbyFacilities.length > 0) {
          console.log(`✅ Found ${nearbyFacilities.length} facilities with term: "${term}"`);
          break;
        }
      }
    } catch (error) {
      console.log(`❌ Error with search term "${term}":`, error.message);
      continue;
    }
  }

  // If no facilities found after trying all terms
  if (nearbyFacilities.length === 0) {
    const conditionName = condition.toLowerCase() === "covid19" ? "COVID testing centers" : `${condition} facilities`;
    nearbyFacilities.push({
      name: `Could not find nearby ${conditionName}.`,
      place_id: "",
      vicinity: `Try searching for '${conditionName} near me' in your browser`,
      condition: condition,
      type: "No Results",
      rating: null,
      reviews: 0
    });
  }

  return nearbyFacilities;
};

/**
 * Format clinic data for display
 * @param {Array} localResults - Array of clinic results from SerpAPI
 * @returns {Array} - Formatted clinic data
 */
export const formatClinicData = (localResults) => {
  if (!localResults || !Array.isArray(localResults)) {
    return [];
  }

  return localResults.map((clinic, index) => ({
    id: clinic.place_id || `clinic-${index}`,
    name: clinic.title || "Unknown Clinic",
    address: clinic.address || "Address not available",
    rating: clinic.rating || null,
    reviews: clinic.reviews || 0,
    type: clinic.type || "Medical Clinic",
    types: clinic.types || [],
    phone: clinic.phone || null,
    website: clinic.website || null,
    hours: clinic.hours || null,
    coordinates: clinic.gps_coordinates || null,
    placeId: clinic.place_id || null,
    thumbnail: clinic.thumbnail || null,
    position: clinic.position || index + 1
  }));
};

export default {
  searchClinics,
  searchFacilitiesByCondition,
  getCurrentLocation,
  formatClinicData
};
