import { useState, useEffect } from "react";
import { getChatSessions, getCurrentUser, signOutUser } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/auth');
    } else {
      setUser(currentUser);
      loadChatHistory(currentUser.uid);
    }
  }, [navigate]);

  const loadChatHistory = async (userId) => {
    try {
      setLoading(true);
      console.log("📋 Loading chat sessions for user:", userId);

      const sessions = await getChatSessions(userId);
      console.log("📋 Retrieved sessions:", sessions.length);

      // Convert sessions to display format
      const formattedHistory = sessions.map(session => ({
        id: session.id,
        message: session.userMessage,
        timestamp: new Date(session.timestamp),
        isUser: true
      }));

      setChatHistory(formattedHistory);
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/auth');
    } catch (error) {
      console.error("❌ Error signing out:", error);
    }
  };
  
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-2xl text-white">
                {user?.email?.[0].toUpperCase() || '👤'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user?.displayName || user?.email || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-gray-500 text-sm">
                Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-blue-600">{chatHistory.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Chat Messages</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/medication-report')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              View Medications
            </button>
            <button
              onClick={() => navigate('/user-report')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
            >
              View Reports
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : chatHistory.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chatHistory.slice(0, 10).map((chat, index) => (
              <div key={chat.id || index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">{chat.timestamp.toLocaleString()}</p>
                    <p className="font-medium text-gray-800 mt-1">{chat.message}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                    User
                  </span>
                </div>
              </div>
            ))}
            {chatHistory.length > 10 && (
              <p className="text-center text-gray-500 text-sm pt-4">
                Showing latest 10 messages. View full history in reports.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No chat messages yet</p>
            <button
              onClick={() => navigate('/chatbot')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Chatting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
