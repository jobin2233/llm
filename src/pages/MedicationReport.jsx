import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatSessions, getLatestMedicalSummary, getCurrentUser } from '../services/firebase';
import dermatologyRAG from '../services/dermatologyRAG';
import PDFGenerator from '../services/pdfGenerator';
import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ShareIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const MedicationReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentConditions, setRecentConditions] = useState([]);
  const [autoRecommendations, setAutoRecommendations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setSessionId(user.uid);
      loadMedicationReport(user.uid);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const loadMedicationReport = async (userSessionId) => {
    try {
      setLoading(true);

      if (!userSessionId) {
        console.error("No session ID provided");
        return;
      }

      // Get chat sessions and medical summary
      const medicalSummary = await getLatestMedicalSummary(userSessionId);
      const chatSessions = await getChatSessions(userSessionId);
      
      // Get medication recommendations for detected conditions
      const recommendations = dermatologyRAG.getMedicationsForConditions(medicalSummary.conditions);

      // Extract recent conditions from latest chat sessions (last 10 sessions)
      const recentSessions = chatSessions.slice(-10);
      const recentConditionsSet = new Set();

      recentSessions.forEach(session => {
        if (session.detectedConditions) {
          session.detectedConditions.forEach(condition => {
            recentConditionsSet.add(condition);
          });
        }
      });

      const recentConditionsArray = Array.from(recentConditionsSet);
      setRecentConditions(recentConditionsArray);

      // Get automatic recommendations for recent conditions
      const autoRecs = dermatologyRAG.getMedicationsForConditions(recentConditionsArray);
      setAutoRecommendations(autoRecs);

      // Combine all data for the report
      const reportData = {
        patientInfo: {
          sessionId: userSessionId,
          reportDate: new Date().toLocaleDateString(),
          lastVisit: medicalSummary.lastVisit,
          totalConsultations: medicalSummary.totalSessions
        },
        detectedConditions: medicalSummary.conditions,
        medicationRecommendations: recommendations,
        recentInteractions: chatSessions.slice(-5), // Last 5 interactions
        summary: {
          totalMedications: recommendations.reduce((acc, rec) => acc + rec.medications.length, 0),
          conditionsCount: medicalSummary.conditions.length
        }
      };
      
      setReportData(reportData);
    } catch (error) {
      console.error('Error loading medication report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      // Detect conditions from search query
      const detectedConditions = dermatologyRAG.detectConditions(searchQuery);

      // Search for medications by name
      const medicationSearch = dermatologyRAG.searchMedications(searchQuery);

      // Get recommendations for detected conditions
      const conditionRecommendations = dermatologyRAG.getMedicationsForConditions(detectedConditions);

      setSearchResults({
        query: searchQuery,
        detectedConditions,
        medicationSearch: medicationSearch.slice(0, 10), // Top 10 search results
        conditionRecommendations,
        totalResults: medicationSearch.length + conditionRecommendations.reduce((acc, rec) => acc + rec.medications.length, 0)
      });
    } catch (error) {
      console.error('Error searching medications:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Refresh recent conditions
  const handleRefresh = async () => {
    if (!sessionId) return;

    setRefreshing(true);
    try {
      await loadMedicationReport(sessionId);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;

    try {
      setPdfGenerating(true);

      // Prepare data for PDF generation
      const pdfData = {
        patientInfo: reportData.patientInfo,
        detectedConditions: recentConditions,
        medications: reportData.medications || []
      };

      // Create PDF generator instance
      const pdfGenerator = new PDFGenerator();

      // Generate the PDF
      const pdf = pdfGenerator.generateMedicationReport(pdfData);

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `SynthesisAI-Medication-Report-${date}.pdf`;

      // Save the PDF
      pdfGenerator.savePDF(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Medication Report - SynthesisAI',
          text: 'My dermatology medication report from SynthesisAI',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your medication report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">No medication data found. Please have a consultation first.</p>
          <button
            onClick={() => navigate('/chatbot')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Smart Medications</h1>
                <p className="text-gray-600">AI-powered medication search and automatic recommendations</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Medications Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <MagnifyingGlassIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Search Medications</h2>
                <p className="text-gray-600">Find medications by disease or condition name</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter disease or condition (e.g., acne, eczema, psoriasis...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {searchLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5" />
                )}
                <span>{searchLoading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults && searchResults.totalResults > 0 && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Search Results for "{searchResults.query}" ({searchResults.totalResults} results)
                </h3>

                {/* Detected Conditions */}
                {searchResults.detectedConditions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Detected Conditions:</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {searchResults.detectedConditions.map((condition, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          {condition.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Condition-based Recommendations */}
                {searchResults.conditionRecommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Recommended Medications:</h4>
                    <div className="space-y-4">
                      {searchResults.conditionRecommendations.map((conditionRec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-900 mb-3 capitalize">
                            For {conditionRec.condition.replace('_', ' ')}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {conditionRec.medications.map((medication, medIndex) => (
                              <div key={medIndex} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="font-medium text-gray-900">{medication.name}</div>
                                <div className="text-sm text-gray-600">Rating: {medication.rating}/10</div>
                                <div className="text-xs text-gray-500 mt-1">{medication.mechanism_of_action}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Medication Search */}
                {searchResults.medicationSearch.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Medication Search Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.medicationSearch.map((medication, index) => (
                        <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="font-medium text-gray-900">{medication.name}</div>
                          <div className="text-sm text-gray-600">Rating: {medication.rating}/10</div>
                          <div className="text-xs text-gray-500 mt-1">{medication.category}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Automatic Condition Detection Section */}
        {recentConditions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <SparklesIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Auto-Detected Conditions</h2>
                  <p className="text-gray-600">Based on your recent chat conversations</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Recent Conditions from Chat:</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {recentConditions.map((condition, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {condition.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {autoRecommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Automatic Medication Recommendations:</h3>
                <div className="space-y-4">
                  {autoRecommendations.map((conditionRec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                        For {conditionRec.condition.replace('_', ' ')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {conditionRec.medications.map((medication, medIndex) => (
                          <div key={medIndex} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200">
                            <div className="font-medium text-gray-900">{medication.name}</div>
                            <div className="text-sm text-gray-600">Rating: {medication.rating}/10</div>
                            <div className="text-xs text-gray-500 mt-1">{medication.mechanism_of_action}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patient Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
              <p className="text-gray-600">Report generated on {reportData.patientInfo.reportDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Last Visit</p>
                  <p className="font-semibold text-gray-900">
                    {reportData.patientInfo.lastVisit || 'No visits yet'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <BeakerIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Consultations</p>
                  <p className="font-semibold text-gray-900">{reportData.patientInfo.totalConsultations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Conditions Identified</p>
                  <p className="font-semibold text-gray-900">{reportData.summary.conditionsCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detected Conditions */}
        {reportData.detectedConditions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Detected Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.detectedConditions.map((condition, index) => (
                <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 capitalize">
                      {condition.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medication Recommendations */}
        {reportData.medicationRecommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recommended Medications</h3>
            <div className="space-y-6">
              {reportData.medicationRecommendations.map((conditionRec, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    For {conditionRec.condition.replace('_', ' ')}
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {conditionRec.medications.map((medication, medIndex) => (
                      <div key={medIndex} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{medication.name}</h5>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {medication.rating}/10
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Mechanism:</strong> {medication.mechanism_of_action || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Uses:</strong> {medication.specific_uses || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Important Medical Disclaimer</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                This report is generated based on AI analysis and should not replace professional medical advice. 
                Always consult with a qualified healthcare provider before starting, stopping, or changing any medication. 
                The recommendations provided are for informational purposes only and may not be suitable for your specific condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationReport;
