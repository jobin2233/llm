import ChatInterface from "../components/chat/ChatInterface";
import FirebaseTest from "../components/FirebaseTest";

const ChatBot = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">AI Dermatology Assistant</h1>
      
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">How can our AI assistant help you?</h2>
        <p className="text-gray-600">
          Our AI assistant can answer your questions about skin conditions, treatments, skincare routines, and product recommendations.
          You can also upload images for instant skin analysis using the camera icon in the chat interface below!
        </p>
        
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-sm text-gray-700">
            <strong>What you can do:</strong>
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
            <li>📸 <strong>Upload skin photos</strong> for instant AI analysis</li>
            <li>💬 Ask about skin conditions like eczema, acne, or rosacea</li>
            <li>🧴 Get personalized product recommendations</li>
            <li>📋 Build custom skincare routines</li>
            <li>🔬 Learn about skincare ingredients and their benefits</li>
            <li>🎤 Use voice input for hands-free interaction</li>
          </ul>
        </div>
      </div>

      {/* Temporary Firebase Test Component */}
      <FirebaseTest />

      <ChatInterface />
    </div>
  );
};

export default ChatBot;
