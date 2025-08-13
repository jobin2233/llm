import axios from "axios";

// Create a specific instance for the Lightning AI API
const lightningApi = axios.create({
  baseURL: "https://8000-dep-01jxc6xsyaq85hd97ceg4596cv-d.cloudspaces.litng.ai",
  headers: {
    "Content-Type": "application/json"
  }
});

// Add request interceptor for logging
lightningApi.interceptors.request.use(request => {
  console.log('🚀 Lightning API Request:', { 
    url: request.url, 
    method: request.method, 
    data: request.data,
    headers: request.headers
  });
  return request;
});

// Add response interceptor for logging
lightningApi.interceptors.response.use(
  response => {
    console.log('✅ Lightning API Response:', { 
      status: response.status, 
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('❌ Lightning API Error:', { 
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response'
    });
    return Promise.reject(error);
  }
);

// Keep the original API instance for other endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("🔌 API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add request interceptor for logging
api.interceptors.request.use(request => {
  console.log('🚀 API Request:', { 
    url: request.url, 
    method: request.method, 
    data: request.data,
    headers: request.headers
  });
  return request;
});

// Add response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log('✅ API Response:', { 
      status: response.status, 
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('❌ API Error:', { 
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response'
    });
    return Promise.reject(error);
  }
);

// Analyze skin image
export const analyzeSkinImage = async (imageData) => {
  console.log("📊 Starting skin image analysis...");
  console.log("📷 Image data length:", imageData ? imageData.length : 0);
  
  try {
    console.log("📤 Sending image data to backend...");
    const response = await api.post("/predict", { image_data: imageData });
    console.log("📥 Analysis complete!", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error analyzing skin image:", error);
    console.error("📋 Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? error.response.data : null
    });
    throw error;
  }
};

// Send message to chatbot using Lightning AI endpoint with few-shot prompting
export const sendChatMessage = async (message, chatHistory = []) => {
  console.log("💬 Sending chat message to Lightning AI:", message);
  console.log("📜 Chat history length:", chatHistory.length);

  try {
    console.log("📤 Sending message to Lightning AI endpoint...");
    console.log("🔗 Full URL:", "https://8000-dep-01jxc6xsyaq85hd97ceg4596cv-d.cloudspaces.litng.ai/predict");

    // Few-shot prompting strategy for dermatological diagnostic AI
    const fewShotPrompt = `You are a dermatological diagnostic AI. Follow this response pattern exactly:

CORRECT RESPONSE EXAMPLE:
User: "I have red bumps on my face"
Response: "**Condition:** Acne vulgaris. **Causes:** Excess sebum production, follicular hyperkeratinization, C. acnes colonization, and inflammatory response."

INCORRECT RESPONSE (DO NOT DO THIS):
User: "I have red bumps on my face"
Response: "**Condition:** Acne. **Treatment:** Use benzoyl peroxide..."

Your role: Identify the skin condition and explain its underlying causes only.

Always use the format:
**Condition:** [Disease name]
**Causes:** [Pathophysiological mechanisms and contributing factors]

User: "${message}"
Response:`;

    // Create payload with few-shot prompting
    const payload = {
      message: fewShotPrompt,
      chat_history: []
    };

    console.log("📦 Request payload with few-shot prompting:", payload);

    const response = await lightningApi.post("/predict", payload);
    console.log("📥 Chat response received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error sending chat message to Lightning AI:", error);
    console.error("📋 Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? error.response.data : null
    });
    throw error;
  }
};

export default api;