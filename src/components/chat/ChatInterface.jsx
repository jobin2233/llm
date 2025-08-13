import { useState, useEffect, useRef } from "react";
import { sendChatMessage, analyzeSkinImage } from "../../services/api";
import { uploadImage } from "../../services/cloudinary";
import { saveChatSession, getCurrentUser, testRealtimeDatabase } from "../../services/firebase";
import dermatologyRAG from "../../services/dermatologyRAG";
import { useNavigate } from "react-router-dom";
import { PhotoIcon, ClipboardDocumentListIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import AnalysisResultCard from "./AnalysisResultCard";
import { formatChatMessage } from "../../utils/textFormatter";

const ChatInterface = () => {
  // State variables
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  // Remove the isExpanded state since we want it to always be displayed normally
  // const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Set session ID based on authenticated user
  useEffect(() => {
    const user = getCurrentUser();
    console.log("🔐 Current user from Firebase:", user);

    if (user) {
      setSessionId(user.uid);
      console.log("🔐 Session ID set to user ID:", user.uid);

      // Test Firebase Realtime Database connection
      console.log("🧪 Testing Firebase Realtime Database connection...");
      testRealtimeDatabase().then(result => {
        console.log("🧪 Firebase Realtime Database test result:", result);
        if (!result) {
          console.error("❌ Realtime Database test failed - check your Firebase configuration!");
        }
      }).catch(error => {
        console.error("❌ Error during Realtime Database test:", error);
      });
    } else {
      console.warn("⚠️ No authenticated user found - user must be logged in to save data");
    }
  }, []);
  
  // Speech recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  
  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Speech recognized:", transcript);
      setInput(transcript);
      
      // Auto-submit after voice input
      if (transcript.trim()) {
        handleSubmit(new Event('submit'));
      }
    };
    
    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
      setIsListening(false);
      setError(`Speech recognition error: ${event.error}`);
    };
    
    recognition.onend = () => {
      console.log("🎤 Speech recognition ended");
      setIsListening(false);
    };
  }
  
  // Speech synthesis setup
  const synth = window.speechSynthesis;
  
  // Check if speech synthesis is speaking
  useEffect(() => {
    if (synth) {
      const checkSpeaking = () => {
        setIsSpeaking(synth.speaking);
      };
      
      // Check speaking status every 100ms
      const interval = setInterval(checkSpeaking, 100);
      return () => clearInterval(interval);
    }
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    console.log("🔽 Scrolling to bottom of chat");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Remove the toggleChat function since we don't need it anymore
  // const toggleChat = () => {
  //   setIsExpanded(!isExpanded);
  //   // If expanding, focus on input after a short delay to allow animation to complete
  //   if (!isExpanded) {
  //     setTimeout(() => {
  //       const inputElement = document.querySelector('#chat-input');
  //       if (inputElement) inputElement.focus();
  //     }, 300);
  //   }
  // };
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognition) {
      setError("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      recognition.stop();
      console.log("🎤 Stopping speech recognition");
    } else {
      try {
        recognition.start();
        setError(null);
        console.log("🎤 Starting speech recognition");
        setIsListening(true);
      } catch (error) {
        console.error("❌ Error starting speech recognition:", error);
        setError("Could not start speech recognition");
      }
    }
  };
  
  // Stop speech synthesis
  const stopSpeaking = () => {
    if (synth && synth.speaking) {
      console.log("🔊 Stopping speech");
      synth.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Speak text using speech synthesis
  const speakResponse = (text) => {
    if (!synth) {
      console.error("❌ Speech synthesis not supported");
      return;
    }
    
    // Cancel any ongoing speech
    if (synth.speaking) {
      console.log("🔊 Cancelling previous speech");
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice (optional - uses default voice if not set)
    const voices = synth.getVoices();
    if (voices.length > 0) {
      // Try to find a female voice
      const femaleVoice = voices.find(voice => 
        voice.name.includes('female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Zira')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }
    
    // Set speech properties
    utterance.rate = 1.0;  // Speed: 0.1 to 10
    utterance.pitch = 1.0; // Pitch: 0 to 2
    utterance.volume = 1.0; // Volume: 0 to 1
    
    // Update speaking state when speech starts/ends
    utterance.onstart = () => {
      console.log("🔊 Speech started");
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log("🔊 Speech ended");
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error("❌ Speech synthesis error:", event);
      setIsSpeaking(false);
    };
    
    console.log("🔊 Speaking response");
    synth.speak(utterance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Chat form submitted");
    
    if (!input.trim() || loading) {
      console.log("⚠️ Form submission ignored:", {
        emptyInput: !input.trim(),
        loading
      });
      return;
    }

    const userMessage = input.trim();
    console.log("💬 User message:", userMessage);
    setInput("");
    setError(null);
    
    // Add user message to UI only (no Firebase)
    const newUserMessage = {
      id: Date.now().toString(),
      message: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    console.log("➕ Adding user message to UI:", newUserMessage);
    setMessages(prev => [...prev, newUserMessage]);
    
    try {
      console.log("⏳ Setting loading state to true");
      setLoading(true);
      
      // Send message to backend API endpoint
      console.log("🚀 Sending message to Lightning AI API endpoint");
      console.log("🔗 Endpoint URL: https://8000-dep-01jxc6xsyaq85hd97ceg4596cv-d.cloudspaces.litng.ai/predict");
      console.log("📦 Request payload:", { message: userMessage, chat_history: [] });
      
      const response = await sendChatMessage(userMessage, []);
      console.log("✅ Received response from backend:", response);

      // Get medication recommendations using RAG
      const ragRecommendations = dermatologyRAG.getComprehensiveRecommendations(userMessage);
      console.log("🔍 RAG recommendations:", ragRecommendations);

      // Combine AI response with medication recommendations if conditions detected
      let enhancedResponse = response.response || "Sorry, I couldn't process your request.";

      if (ragRecommendations.detectedConditions.length > 0) {
        const medicationInfo = dermatologyRAG.formatRecommendationsForChat(ragRecommendations);
        enhancedResponse += "\n\n" + medicationInfo;
      }

      // Add assistant response to UI
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        message: enhancedResponse,
        isUser: false,
        timestamp: new Date(),
        detectedConditions: ragRecommendations.detectedConditions,
        recommendedMedications: ragRecommendations.conditionBasedRecommendations.flatMap(rec => rec.medications),
        showActionButtons: true
      };

      console.log("➕ Adding assistant message to UI:", assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);

      // Save to Firebase Realtime Database
      console.log("💾 About to save to Firebase...");
      console.log("💾 SessionId available:", !!sessionId, sessionId);
      console.log("💾 User message length:", userMessage?.length);
      console.log("💾 AI response length:", enhancedResponse?.length);
      console.log("💾 Detected conditions:", ragRecommendations.detectedConditions);
      console.log("💾 Medications count:", ragRecommendations.conditionBasedRecommendations.flatMap(rec => rec.medications).length);

      if (sessionId) {
        console.log("💾 ✅ SessionId exists, proceeding with save...");
        try {
          const saveResult = await saveChatSession(
            sessionId,
            userMessage,
            enhancedResponse,
            ragRecommendations.detectedConditions,
            ragRecommendations.conditionBasedRecommendations.flatMap(rec => rec.medications)
          );
          console.log("💾 ✅ Save completed with result:", saveResult);

          if (!saveResult) {
            console.error("❌ Save returned false - check Firebase console for errors!");
          }
        } catch (saveError) {
          console.error("❌ Exception during save:", saveError);
        }
      } else {
        console.warn("⚠️ No sessionId available, skipping Firebase save");
        console.warn("⚠️ This usually means user is not authenticated");
      }

      // Speak the response
      speakResponse(response.response || "Sorry, I couldn't process your request.");
      
    } catch (error) {
      console.error("❌ Error sending message:", error);
      console.error("📋 Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response ? error.response.data : null
      });
      
      setError(error.message || "An unknown error occurred");
      
      // Add error message to UI
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        message: "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      console.log("⚠️ Adding error message to UI:", errorMessage);
      setMessages(prev => [...prev, errorMessage]);
      
      // Speak the error message
      speakResponse(errorMessage.message);
      
    } finally {
      console.log("⏳ Setting loading state to false");
      setLoading(false);
    }
  };

  // Image upload handlers
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please select an image file");
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Add user message with image to chat
      const imageMessage = {
        id: Date.now().toString(),
        message: "I've uploaded an image for skin analysis",
        isUser: true,
        timestamp: new Date(),
        image: imagePreview,
        imageFile: selectedImage
      };

      setMessages(prev => [...prev, imageMessage]);

      // Upload image to Cloudinary
      const uploadResult = await uploadImage(selectedImage);

      if (!uploadResult) {
        throw new Error("Failed to upload image");
      }

      // Convert image to base64 for analysis
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64data = reader.result;

        // Send to backend for analysis
        const analysisResult = await analyzeSkinImage(base64data);

        // Add analysis result as assistant message
        const analysisMessage = {
          id: (Date.now() + 1).toString(),
          message: formatAnalysisResult(analysisResult),
          isUser: false,
          timestamp: new Date(),
          analysisData: analysisResult,
          originalImage: imagePreview
        };

        setMessages(prev => [...prev, analysisMessage]);
        speakResponse("I've completed your skin analysis. Here are the results.");

        // Clear image selection
        setSelectedImage(null);
        setImagePreview("");
        setIsAnalyzing(false);
      };

      reader.onerror = () => {
        throw new Error("Failed to process image");
      };
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError("Error processing image: " + (error.message || "Unknown error"));
      setIsAnalyzing(false);
    }
  };

  const formatAnalysisResult = (result) => {
    if (!result) return "Sorry, I couldn't analyze your image. Please try again.";

    // Handle the new format with top_predictions
    if (result.top_predictions && result.top_predictions.length > 0) {
      let response = "🔬 **Skin Analysis Results**\n\n";

      // Sort by confidence (highest first) and display only disease name and confidence
      const sortedPredictions = result.top_predictions
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5); // Show top 5 results

      sortedPredictions.forEach((prediction, index) => {
        const confidence = (prediction.probability * 100).toFixed(1);
        response += `${index + 1}. **${prediction.class}** - ${confidence}%\n`;
      });

      return response;
    }

    // Fallback for old format
    let response = "Here's your skin analysis:\n\n";

    if (result.skin_type) {
      response += `🔍 **Skin Type**: ${result.skin_type}\n`;
    }

    if (result.conditions && result.conditions.length > 0) {
      response += `⚠️ **Detected Conditions**: ${result.conditions.join(", ")}\n`;
    }

    if (result.recommendations && result.recommendations.length > 0) {
      response += `💡 **Recommendations**:\n`;
      result.recommendations.forEach((rec, index) => {
        response += `${index + 1}. ${rec}\n`;
      });
    }

    if (result.confidence_score) {
      response += `\n📊 **Confidence Score**: ${(result.confidence_score * 100).toFixed(1)}%`;
    }

    return response;
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview("");
    setError(null);
  };

  // Action button handlers
  const handleViewPrescription = () => {
    navigate('/medication-report');
  };

  const handleGenerateReport = () => {
    navigate('/user-report');
  };

  const handleViewRecommendations = () => {
    navigate('/recommendations');
  };

  const handleContinueChatting = () => {
    // Focus on input field
    const inputElement = document.querySelector('#chat-input');
    if (inputElement) inputElement.focus();
  };

  // Action Buttons Component
  const ActionButtons = ({ messageId }) => (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        onClick={handleViewPrescription}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
      >
        <ClipboardDocumentListIcon className="h-4 w-4" />
        <span>Medications</span>
      </button>
      <button
        onClick={handleGenerateReport}
        className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
      >
        <DocumentTextIcon className="h-4 w-4" />
        <span>Reports</span>
      </button>
      <button
        onClick={handleViewRecommendations}
        className="flex items-center space-x-2 px-3 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
      >
        <SparklesIcon className="h-4 w-4" />
        <span>Recommendations</span>
      </button>
      <button
        onClick={handleContinueChatting}
        className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" />
        <span>Continue Chatting</span>
      </button>
    </div>
  );

  // Define CSS for glassmorphism effect
  const glassmorphismStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', // For Safari
    borderRadius: '16px 16px 0 0',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    transition: 'all 0.3s ease-in-out',
  };

  // Define gradient background for navbar
  const gradientBackground = {
    background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0"
      style={{ zIndex: 1000, transition: 'all 0.3s ease-in-out' }}
    >
      {/* Chat interface always expanded */}
      <div 
        className="w-full overflow-hidden"
        style={glassmorphismStyle}
        ref={chatContainerRef}
      >
        {/* Expanded chat interface */}
        <div className="flex flex-col h-[70vh] max-h-[500px]">
          {/* Header with title */}
          <div 
            className="flex justify-between items-center p-3 text-white"
            style={gradientBackground}
          >
            <h3 className="font-medium">Chat Assistant</h3>
          </div>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/80">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 my-8">
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isUser
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      : "bg-white/90 text-gray-800 border border-gray-200"
                  } shadow-sm`}
                >
                  {/* Display image if present */}
                  {message.image && (
                    <div className="mb-2">
                      <img
                        src={message.image}
                        alt="Uploaded for analysis"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}

                  {/* Display message text */}
                  {message.isUser ? (
                    <div className="whitespace-pre-wrap">
                      {message.message}
                    </div>
                  ) : (
                    formatChatMessage(message.message)
                  )}

                  {/* Display analysis results if present */}
                  {message.analysisData && (
                    <AnalysisResultCard
                      analysisData={message.analysisData}
                      originalImage={message.originalImage}
                    />
                  )}

                  {/* Display action buttons for AI responses */}
                  {!message.isUser && message.showActionButtons && (
                    <ActionButtons messageId={message.id} />
                  )}
                </div>
              </div>
            ))}
            
            {error && (
              <div className="text-center text-red-500 my-2">
                <p>Error: {error}</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview section */}
          {selectedImage && (
            <div className="p-3 border-t border-gray-200 bg-white/90">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Selected for analysis"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={clearImageSelection}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Image ready for analysis</p>
                  <button
                    onClick={handleImageAnalysis}
                    disabled={isAnalyzing}
                    className={`mt-1 px-3 py-1 rounded text-sm ${
                      isAnalyzing
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    } transition-colors`}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Skin"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white/90">
            <div className="flex space-x-2">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                disabled={loading || isListening}
              />
              
              {/* Voice input button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`p-2 rounded-lg flex items-center justify-center ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } transition-colors`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isListening ? (
                    <>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </>
                  ) : (
                    <>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </>
                  )}
                </svg>
              </button>

              {/* Image upload button */}
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("image-upload").click()}
                  disabled={loading || isAnalyzing}
                  className={`p-2 rounded-lg flex items-center justify-center ${
                    selectedImage
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  } transition-colors`}
                  title="Upload image for skin analysis"
                >
                  <PhotoIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Stop voice button */}
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="p-2 rounded-lg flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                  title="Stop speaking"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading || (!input.trim() && !isListening)}
                className={`p-2 rounded-lg ${
                  loading || (!input.trim() && !isListening)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                } transition-colors`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
