import { useState, useEffect, useRef } from "react";
import { sendChatMessage, analyzeSkinImage } from "../../services/api";
import { uploadImage } from "../../services/cloudinary";
import { saveChatSession, getCurrentUser } from "../../services/firebase";
import dermatologyRAG from "../../services/dermatologyRAG";
import { useNavigate } from "react-router-dom";
import { PhotoIcon, ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, ClipboardDocumentListIcon, DocumentTextIcon, SparklesIcon } from "@heroicons/react/24/outline";
import AnalysisResultCard from "./AnalysisResultCard";
import { formatChatMessage } from "../../utils/textFormatter";

const FloatingChatbot = () => {
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  
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
    if (isOpen) {
      console.log("🔽 Scrolling to bottom of chat");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Set session ID based on authenticated user
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setSessionId(user.uid);
      console.log("🔐 FloatingChatbot - Session ID set to user ID:", user.uid);
    } else {
      console.warn("⚠️ FloatingChatbot - No authenticated user found");
    }
  }, []);

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
    // If opening, focus on input after a short delay to allow animation to complete
    if (!isOpen) {
      setTimeout(() => {
        const inputElement = document.querySelector('#floating-chat-input');
        if (inputElement) inputElement.focus();
      }, 300);
    }
  };

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
      console.log("💾 About to save to Firebase Realtime Database...");
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

      // Speak the response (original response, not enhanced)
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
    const inputElement = document.querySelector('#floating-chat-input');
    if (inputElement) inputElement.focus();
  };

  // Action Buttons Component
  const ActionButtons = () => (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={handleViewPrescription}
        className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs"
      >
        <ClipboardDocumentListIcon className="h-3 w-3" />
        <span>Medications</span>
      </button>
      <button
        onClick={handleGenerateReport}
        className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
      >
        <DocumentTextIcon className="h-3 w-3" />
        <span>Reports</span>
      </button>
      <button
        onClick={handleViewRecommendations}
        className="flex items-center space-x-1 px-2 py-1 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-xs"
      >
        <SparklesIcon className="h-3 w-3" />
        <span>Recommendations</span>
      </button>
      <button
        onClick={handleContinueChatting}
        className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs"
      >
        <ChatBubbleLeftRightIcon className="h-3 w-3" />
        <span>Continue</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Floating Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative">
            {/* Pulse ring animation */}
            <div className="absolute inset-0 w-20 h-20 bg-sky-400 rounded-full animate-pulse-ring"></div>

            <button
              onClick={toggleChat}
              className="relative w-20 h-20 glass-medium hover:glass-strong text-white rounded-2xl shadow-luxury hover:shadow-elegant transition-all duration-300 flex items-center justify-center group animate-float border border-white/20"
              title="Open SynthesisAI Assistant"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded-2xl"></div>
              <ChatBubbleLeftRightIcon className="h-9 w-9 group-hover:scale-110 transition-transform duration-200 relative z-10 text-crystal-white" />
              {/* Notification dot for new features */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-smooth-bounce shadow-elegant">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            </button>
          </div>
        )}

        {/* Expanded Chat Window */}
        {isOpen && (
          <div className="w-[420px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-8rem)] glass-strong rounded-3xl shadow-luxury border border-white/20 flex flex-col overflow-hidden animate-glass-morph">
            {/* Header */}
            <div className="glass-medium p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-crystal-white heading-professional text-lg">SynthesisAI Assistant</h3>
                  <p className="text-crystal-white/80 text-sm">Advanced skin analysis at your fingertips</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="w-10 h-10 glass-light hover:glass-medium rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 border border-white/10"
                title="Close chat"
              >
                <XMarkIcon className="h-5 w-5 text-crystal-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/5 to-white/10">
              {messages.length === 0 && (
                <div className="text-center my-8">
                  <div className="w-20 h-20 glass-light rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                    <span className="text-3xl">👋</span>
                  </div>
                  <p className="text-lg font-semibold text-crystal-white mb-3 heading-professional">Welcome to SynthesisAI</p>
                  <p className="text-sm text-crystal-white/80 mb-6 text-professional">Upload a skin photo or ask me about dermatology for expert analysis!</p>

                  {/* Demo Analysis Result */}
                  <div className="mt-4 text-left">
                    <p className="text-xs text-gray-400 mb-2 text-center">Sample Analysis Result:</p>
                    <AnalysisResultCard
                      analysisData={{
                        top_predictions: [
                          { class: "Tinea Ringworm Candidiasis and other Fungal Infections", probability: 0.32329052686691284 },
                          { class: "Vitiligo", probability: 0.28451967239379883 },
                          { class: "Periorbital_hyperpigmentation", probability: 0.18077172338962555 },
                          { class: "Exanthems and Drug Eruptions", probability: 0.11126469075679779 },
                          { class: "Vascular Tumors", probability: 0.024653954431414604 }
                        ],
                        model: "vit-skin-classifier-finetuned"
                      }}
                    />
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.isUser
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                        : "bg-white text-gray-800 border border-sky-200 shadow-sm"
                    }`}
                  >
                    {/* Display image if present */}
                    {message.image && (
                      <div className="mb-2">
                        <img
                          src={message.image}
                          alt="Uploaded for analysis"
                          className="max-w-full h-auto rounded-lg border border-gray-300"
                          style={{ maxHeight: '150px' }}
                        />
                      </div>
                    )}

                    {/* Display message text */}
                    {message.isUser ? (
                      <div className="whitespace-pre-wrap text-sm">
                        {message.message}
                      </div>
                    ) : (
                      <div className="text-sm">
                        {formatChatMessage(message.message)}
                      </div>
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
                      <ActionButtons />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl p-3 border border-sky-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-red-500 my-2">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm">Error: {error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Image preview section */}
            {selectedImage && (
              <div className="p-3 border-t border-sky-200 bg-sky-50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Selected for analysis"
                      className="w-12 h-12 object-cover rounded-lg border border-sky-300"
                    />
                    <button
                      onClick={clearImageSelection}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Image ready for analysis</p>
                    <button
                      onClick={handleImageAnalysis}
                      disabled={isAnalyzing}
                      className={`mt-1 px-3 py-1 rounded-full text-xs ${
                        isAnalyzing
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-sky-500 hover:bg-sky-600 text-white"
                      } transition-colors`}
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Skin"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-sky-200 bg-white">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    id="floating-chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about skin conditions, upload photos..."
                    className="flex-1 p-2 border border-sky-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-sm"
                    disabled={loading || isListening}
                  />

                  {/* Voice input button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={loading}
                    className={`p-2 rounded-full flex items-center justify-center ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-sky-100 hover:bg-sky-200 text-sky-600"
                    } transition-colors`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
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
                      id="floating-image-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("floating-image-upload").click()}
                      disabled={loading || isAnalyzing}
                      className={`p-2 rounded-full flex items-center justify-center ${
                        selectedImage
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-sky-100 hover:bg-sky-200 text-sky-600"
                      } transition-colors`}
                      title="Upload image for skin analysis"
                    >
                      <PhotoIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Stop voice button */}
                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="p-2 rounded-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                      title="Stop speaking"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                    className={`p-2 rounded-full ${
                      loading || (!input.trim() && !isListening)
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                    } transition-colors`}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingChatbot;
