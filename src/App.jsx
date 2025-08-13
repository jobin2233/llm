import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChange } from "./services/firebase";
import Home from "./pages/Home";
import SkinAnalysis from "./pages/SkinAnalysis";
import ChatBot from "./pages/ChatBot";
import Profile from "./pages/Profile";
import MedicationReport from "./pages/MedicationReport";
import UserReport from "./pages/UserReport";
import Recommendations from "./pages/Recommendations";
import NearbyClinics from "./pages/NearbyClinics";
import SerpAPITest from "./components/debug/SerpAPITest";
import Auth from "./components/Auth";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import FloatingChatbot from "./components/chat/FloatingChatbot";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log("🔐 Auth state changed:", user ? `User: ${user.email}` : "No user");
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SynthesisAI...</p>
        </div>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <Navbar user={user} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/auth"
              element={user ? <Navigate to="/" replace /> : <Auth />}
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <ChatBot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medication-report"
              element={
                <ProtectedRoute>
                  <MedicationReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-report"
              element={
                <ProtectedRoute>
                  <UserReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nearby-clinics"
              element={
                <ProtectedRoute>
                  <NearbyClinics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-serpapi"
              element={
                <ProtectedRoute>
                  <SerpAPITest />
                </ProtectedRoute>
              }
            />
            {/* Redirect old skin-analysis route to chatbot */}
            <Route
              path="/skin-analysis"
              element={<Navigate to="/chatbot" replace />}
            />
          </Routes>
        </main>
        <Footer />

        {/* Floating Chatbot - Available on all pages except auth */}
        {user && <FloatingChatbot />}
      </div>
    </Router>
  );
}

export default App;