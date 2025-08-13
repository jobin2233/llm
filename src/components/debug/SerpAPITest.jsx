import { useState } from "react";
import { searchClinics, getCurrentLocation, formatClinicData } from "../../services/serpAPI";

const SerpAPITest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testSerpAPI = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Test with sample coordinates (New York City)
      const latitude = 40.7455096;
      const longitude = -74.0083012;
      
      console.log("Testing SerpAPI with coordinates:", { latitude, longitude });
      
      const coordinates = `${latitude},${longitude}`;
      const results = await searchClinics({
        coordinates: coordinates,
        query: "dermatology clinic"
      });
      const formattedResults = formatClinicData(results.local_results || []);
      
      setTestResult({
        success: true,
        rawResults: results,
        formattedResults: formattedResults,
        totalResults: formattedResults.length
      });
      
      console.log("SerpAPI test successful:", results);
    } catch (err) {
      setError(err.message);
      console.error("SerpAPI test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const testLocationName = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      console.log("Testing SerpAPI with location name: Kochi, Kerala");

      const results = await searchClinics({
        locationName: "Kochi, Kerala",
        query: "dermatology clinic"
      });
      const formattedResults = formatClinicData(results.local_results || []);

      setTestResult({
        success: true,
        rawResults: results,
        formattedResults: formattedResults,
        totalResults: formattedResults.length,
        searchMethod: "Location Name: Kochi, Kerala"
      });

      console.log("Location name test successful:", results);
    } catch (err) {
      setError(err.message);
      console.error("Location name test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const testGeolocation = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const location = await getCurrentLocation();
      setTestResult({
        success: true,
        location: location,
        message: "Geolocation test successful"
      });
      console.log("Geolocation test successful:", location);
    } catch (err) {
      setError(err.message);
      console.error("Geolocation test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">SerpAPI Integration Test</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testSerpAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test SerpAPI (NYC Coordinates)"}
          </button>

          <button
            onClick={testLocationName}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test SerpAPI (Kochi, Kerala)"}
          </button>

          <button
            onClick={testGeolocation}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Geolocation"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <h3 className="text-red-800 font-medium">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {testResult && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-green-800 font-medium mb-2">Test Results:</h3>
          <pre className="text-sm text-green-700 overflow-auto max-h-96">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SerpAPITest;
