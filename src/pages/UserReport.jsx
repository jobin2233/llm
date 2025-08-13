import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatSessions, getLatestMedicalSummary, getUserMedicalHistory, getCurrentUser } from '../services/firebase';
import PDFGenerator from '../services/pdfGenerator';
import {
  UserCircleIcon,
  CalendarDaysIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ShareIcon,
  ArrowLeftIcon,
  ClockIcon,
  BeakerIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const UserReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setSessionId(user.uid);
      loadUserReport(user.uid);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const loadUserReport = async (userSessionId) => {
    try {
      setLoading(true);

      if (!userSessionId) {
        console.error("No session ID provided");
        return;
      }

      // Get comprehensive user data
      const medicalSummary = await getLatestMedicalSummary(userSessionId);
      const chatSessions = await getChatSessions(userSessionId);
      const medicalHistory = await getUserMedicalHistory(userSessionId);
      
      // Process chat sessions to extract symptoms and concerns
      const symptoms = [];
      const concerns = [];
      
      chatSessions.forEach(session => {
        // Extract potential symptoms from user messages
        const userMessage = session.userMessage.toLowerCase();
        
        // Common symptom keywords
        const symptomKeywords = ['itchy', 'red', 'dry', 'oily', 'burning', 'painful', 'swollen', 'rash', 'bumps', 'spots', 'acne', 'pimples'];
        symptomKeywords.forEach(keyword => {
          if (userMessage.includes(keyword) && !symptoms.includes(keyword)) {
            symptoms.push(keyword);
          }
        });
        
        // Extract concerns
        if (userMessage.includes('worried') || userMessage.includes('concerned') || userMessage.includes('help')) {
          concerns.push(session.userMessage.substring(0, 100) + '...');
        }
      });
      
      // Calculate visit frequency
      const visitDates = chatSessions.map(session => new Date(session.timestamp).toDateString());
      const uniqueVisitDates = [...new Set(visitDates)];
      
      const reportData = {
        userInfo: {
          sessionId: userSessionId,
          reportDate: new Date().toLocaleDateString(),
          firstVisit: chatSessions.length > 0 ? new Date(chatSessions[0].timestamp).toLocaleDateString() : null,
          lastVisit: medicalSummary.lastVisit,
          totalVisits: uniqueVisitDates.length,
          totalInteractions: chatSessions.length
        },
        medicalOverview: {
          detectedConditions: medicalSummary.conditions,
          reportedSymptoms: symptoms.slice(0, 10), // Top 10 symptoms
          primaryConcerns: concerns.slice(0, 5), // Top 5 concerns
          medicationsDiscussed: medicalSummary.medications
        },
        visitHistory: chatSessions.map(session => ({
          date: new Date(session.timestamp).toLocaleDateString(),
          time: new Date(session.timestamp).toLocaleTimeString(),
          summary: session.userMessage.substring(0, 150) + '...',
          aiResponse: session.aiResponse.substring(0, 200) + '...',
          conditions: session.detectedConditions || [],
          medications: session.recommendedMedications || []
        })).reverse(), // Most recent first
        healthMetrics: {
          conditionsCount: medicalSummary.conditions.length,
          symptomsCount: symptoms.length,
          medicationsCount: medicalSummary.medications.length,
          consultationFrequency: uniqueVisitDates.length > 1 ? 
            Math.round((new Date() - new Date(chatSessions[0].timestamp)) / (1000 * 60 * 60 * 24) / uniqueVisitDates.length) : 0
        }
      };
      
      setReportData(reportData);
    } catch (error) {
      console.error('Error loading user report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;

    try {
      setPdfGenerating(true);

      // Create PDF generator instance
      const pdfGenerator = new PDFGenerator();

      // Generate the PDF
      const pdf = pdfGenerator.generateUserReport(reportData);

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `SynthesisAI-Medical-Report-${date}.pdf`;

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
          title: 'User Medical Report - SynthesisAI',
          text: 'My comprehensive medical report from SynthesisAI',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your medical report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">No medical data found. Please have a consultation first.</p>
          <button
            onClick={() => navigate('/chatbot')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
                <h1 className="text-3xl font-bold text-gray-900">User Medical Report</h1>
                <p className="text-gray-600">Comprehensive health overview and consultation history</p>
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
                className="flex items-center space-x-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <UserCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Patient Overview</h2>
              <p className="text-gray-600">Report generated on {reportData.userInfo.reportDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">First Visit</p>
                  <p className="font-semibold text-gray-900">
                    {reportData.userInfo.firstVisit || 'No visits yet'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Visits</p>
                  <p className="font-semibold text-gray-900">{reportData.userInfo.totalVisits}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <HeartIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Conditions</p>
                  <p className="font-semibold text-gray-900">{reportData.healthMetrics.conditionsCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <BeakerIcon className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Interactions</p>
                  <p className="font-semibold text-gray-900">{reportData.userInfo.totalInteractions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Detected Conditions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-red-500 mr-2" />
              Diagnosed Conditions
            </h3>
            {reportData.medicalOverview.detectedConditions.length > 0 ? (
              <div className="space-y-3">
                {reportData.medicalOverview.detectedConditions.map((condition, index) => (
                  <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
                    <span className="font-medium text-gray-900 capitalize">
                      {condition.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No conditions detected yet</p>
            )}
          </div>

          {/* Reported Symptoms */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Reported Symptoms
            </h3>
            {reportData.medicalOverview.reportedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reportData.medicalOverview.reportedSymptoms.map((symptom, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm capitalize">
                    {symptom}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No symptoms reported yet</p>
            )}
          </div>
        </div>

        {/* Visit History */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Consultation History</h3>
          {reportData.visitHistory.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reportData.visitHistory.slice(0, 10).map((visit, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{visit.date}</span>
                    <span className="text-sm text-gray-500">{visit.time}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Query:</strong> {visit.summary}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Response:</strong> {visit.aiResponse}
                  </div>
                  {visit.conditions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {visit.conditions.map((condition, condIndex) => (
                        <span key={condIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {condition}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No consultation history available</p>
          )}
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Medical Disclaimer</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                This report is generated based on AI analysis of your interactions and should not replace professional medical advice. 
                Always consult with a qualified healthcare provider for proper diagnosis and treatment. 
                The information provided is for educational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReport;
