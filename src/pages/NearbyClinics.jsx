import { useState, useEffect } from "react";
import { MapPinIcon, PhoneIcon, StarIcon, ClockIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { searchFacilitiesByCondition, getCurrentLocation } from "../services/serpAPI";

const NearbyClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("dermatology");

  // Get user location on component mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      const coordinates = `${location.latitude},${location.longitude}`;
      await searchClinics(selectedCondition, null, coordinates);
    } catch (err) {
      setError(err.message);
      console.error("Error getting location:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchClinics = async (condition, locationName = null, coordinates = null) => {
    setLoading(true);
    setError(null);

    try {
      // Use condition-based search with either location name or coordinates
      const facilities = await searchFacilitiesByCondition({
        locationName,
        coordinates,
        condition
      });

      const formattedClinics = facilities.map((facility, index) => ({
        id: facility.place_id || `facility-${index}`,
        name: facility.name,
        address: facility.vicinity,
        rating: facility.rating,
        reviews: facility.reviews,
        type: facility.type,
        types: [facility.type],
        phone: facility.phone,
        website: facility.website,
        coordinates: facility.coordinates,
        placeId: facility.place_id,
        thumbnail: facility.thumbnail,
        position: index + 1
      }));

      setClinics(formattedClinics);
    } catch (err) {
      setError(err.message);
      console.error("Error searching clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (userLocation) {
      const coordinates = `${userLocation.latitude},${userLocation.longitude}`;
      await searchClinics(selectedCondition, null, coordinates);
    } else {
      setError("Please allow location access to search for nearby clinics.");
    }
  };

  const openInMaps = (clinic) => {
    if (clinic.coordinates) {
      const { latitude, longitude } = clinic.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(clinic.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(url, '_blank');
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }
    
    return stars;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Nearby Dermatology Clinics</h1>
        <p className="text-gray-600">Discover dermatology clinics and skin care specialists near you</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Medical Condition - Fixed to Dermatology */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for Dermatology / Skin Care Clinics
            </label>
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
              🏥 Finding dermatology clinics and skin care specialists near you
            </div>
          </div>

          {/* Current Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Access
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <MapPinIcon className="h-4 w-4" />
                Get Current Location
              </button>
              {userLocation && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                  ✅ Location obtained
                </div>
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || !userLocation}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Searching..." : "Search Dermatology Clinics"}
            </button>
          </div>
        </form>
        
        {/* Location Status */}
        {userLocation && (
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              Current location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Searching for nearby clinics...</span>
        </div>
      )}

      {/* Results */}
      {!loading && clinics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Found {clinics.length} clinic{clinics.length !== 1 ? 's' : ''} nearby
          </h2>
          
          {clinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Clinic Image */}
                {clinic.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={clinic.thumbnail}
                      alt={clinic.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>
                )}
                
                {/* Clinic Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{clinic.name}</h3>
                      <p className="text-gray-600 mb-2">{clinic.type}</p>
                      
                      {/* Rating */}
                      {clinic.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {renderStars(clinic.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {clinic.rating} ({clinic.reviews} reviews)
                          </span>
                        </div>
                      )}
                      
                      {/* Address */}
                      <div className="flex items-start gap-2 mb-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{clinic.address}</span>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {clinic.phone && (
                          <a
                            href={`tel:${clinic.phone}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            {clinic.phone}
                          </a>
                        )}
                        
                        {clinic.website && (
                          <a
                            href={clinic.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <GlobeAltIcon className="h-4 w-4" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Position Badge */}
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      #{clinic.position}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openInMaps(clinic)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View on Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && clinics.length === 0 && userLocation && (
        <div className="text-center py-12">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
          <p className="text-gray-600">Try adjusting your search terms or search radius.</p>
        </div>
      )}
    </div>
  );
};

export default NearbyClinics;
