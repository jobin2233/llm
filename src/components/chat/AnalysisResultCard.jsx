import React from 'react';

const AnalysisResultCard = ({ analysisData, originalImage }) => {
  if (!analysisData) return null;

  // Handle the new format with top_predictions
  if (analysisData.top_predictions && analysisData.top_predictions.length > 0) {
    // Sort by confidence (highest first)
    const sortedPredictions = analysisData.top_predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // Show top 5 results

    return (
      <div className="mt-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🔬</span>
            </div>
            <h4 className="font-semibold text-white text-sm">Skin Analysis Results</h4>
          </div>
        </div>

        {/* Image */}
        {originalImage && (
          <div className="p-3 border-b border-sky-200">
            <img
              src={originalImage}
              alt="Analyzed skin"
              className="w-full max-w-xs h-auto rounded-lg border border-sky-300 mx-auto"
            />
          </div>
        )}

        {/* Results */}
        <div className="p-3 space-y-2">
          {sortedPredictions.map((prediction, index) => {
            const confidence = (prediction.probability * 100).toFixed(1);
            const isTopResult = index === 0;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  isTopResult
                    ? 'bg-gradient-to-r from-sky-100 to-blue-100 border-sky-300 shadow-sm'
                    : 'bg-white border-sky-200 hover:bg-sky-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isTopResult
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                      : 'bg-sky-200 text-sky-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${
                      isTopResult ? 'text-sky-800' : 'text-gray-700'
                    }`}>
                      {prediction.class}
                    </p>
                    {isTopResult && (
                      <p className="text-xs text-sky-600">Most likely condition</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    isTopResult ? 'text-sky-700' : 'text-gray-600'
                  }`}>
                    {confidence}%
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isTopResult
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600'
                          : 'bg-sky-400'
                      }`}
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with model info */}
        <div className="bg-sky-50 border-t border-sky-200 p-2">
          <div className="flex items-center justify-between text-xs text-sky-600">
            <span>🤖 AI Model: {analysisData.model || 'vit-skin-classifier'}</span>
            <span>✅ Analysis Complete</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for old format
  return (
    <div className="mt-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-200 p-4">
      <h4 className="font-semibold text-sky-800 mb-3 text-sm flex items-center">
        <span className="mr-2">🔬</span>
        Analysis Results
      </h4>
      
      {originalImage && (
        <img
          src={originalImage}
          alt="Analyzed skin"
          className="w-full max-w-xs h-auto rounded-lg mb-3 border border-sky-300"
        />
      )}
      
      <div className="text-xs text-sky-700 bg-white p-3 rounded-lg border border-sky-200">
        <pre className="whitespace-pre-wrap font-mono">
          {JSON.stringify(analysisData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AnalysisResultCard;
