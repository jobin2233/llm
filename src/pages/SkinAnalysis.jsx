import { useState, useEffect } from "react";
import ImageUpload from "../components/skin-analysis/ImageUpload";
import { BeakerIcon, CheckBadgeIcon, ChartBarIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

const SkinAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    // Component mounted
    return () => {
      // Component unmounted
    };
  }, []);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full mb-4">
          <BeakerIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Skin Analysis
        </h1>
        <p className="text-gray-600 mt-2 max-w-lg mx-auto">
          Our AI-powered tool analyzes your skin and provides personalized recommendations
        </p>
      </div>
      
      {!analysisResult ? (
        <ImageUpload onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <CheckBadgeIcon className="h-8 w-8 text-green-500 mr-2" />
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
              Analysis Results
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="md:w-1/2">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-1 rounded-xl shadow-sm">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Uploaded Image
                  </h3>
                  <div className="relative rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={analysisResult.imageUrl || analysisResult.originalImage} 
                      alt="Uploaded skin image" 
                      className="w-full rounded-lg" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                      <p className="text-white text-xs font-medium">Analyzed with SynthesisAI</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-1 rounded-xl shadow-sm">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Detected Condition
                  </h3>
                  {analysisResult.result && (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-xl font-bold text-gray-800">
                          {analysisResult.result.predicted_class || analysisResult.result.condition || "Analysis complete"}
                        </p>
                      </div>
                      <p className="text-gray-700 mb-4 pl-12">
                        {analysisResult.result.description || "Our AI has analyzed your image. Please see the detailed results below."}
                      </p>
                      
                      {(analysisResult.result.confidence || analysisResult.result.confidence_percentage) && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium text-gray-700">Confidence Level</p>
                            <p className="text-sm font-bold text-blue-600">
                              {analysisResult.result.confidence_percentage || `${Math.round(analysisResult.result.confidence * 100)}%`}
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: analysisResult.result.confidence_percentage || `${analysisResult.result.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Display top predictions if available */}
          {analysisResult.result && analysisResult.result.top_predictions && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-1 rounded-xl shadow-sm">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center text-blue-700">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Top Predictions
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rank</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Condition</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analysisResult.result.top_predictions.map((prediction) => (
                          <tr key={prediction.rank} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                #{prediction.rank}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-900">{prediction.class}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                                    style={{ width: prediction.confidence_percentage }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{prediction.confidence_percentage}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {analysisResult.result && analysisResult.result.recommendations && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-1 rounded-xl shadow-sm">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center text-blue-700">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Display model information if available */}
          {analysisResult.result && analysisResult.result.model && (
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-700">AI Model Information</h4>
                </div>
                <div className="pl-7 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <p>Model: <span className="font-medium">{analysisResult.result.model}</span></p>
                  {analysisResult.result.fine_tuned !== undefined && (
                    <p>Fine-tuned: <span className="font-medium">{analysisResult.result.fine_tuned ? "Yes" : "No"}</span></p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <button
              onClick={() => {
                setAnalysisResult(null);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Analyze Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinAnalysis;
