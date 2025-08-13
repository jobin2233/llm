import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, setLogLevel } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  updateProfile
} from "firebase/auth";
import { getDatabase, ref, push, set, get, child, orderByChild, equalTo, query as rtdbQuery } from "firebase/database";

// 🔧 Enable Firestore debug logging (optional, dev only)
setLogLevel("debug");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("🔥 Initializing Firebase with config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL,
  hasApiKey: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

console.log("📚 Firestore initialized");
console.log("🔐 Firebase Auth initialized");
console.log("🔥 Realtime Database initialized with URL:", firebaseConfig.databaseURL);

// ===== AUTHENTICATION FUNCTIONS =====

// 🔍 Check if email already exists
export const checkEmailExists = async (email) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return signInMethods.length > 0;
  } catch (error) {
    console.error("❌ Error checking email:", error);
    return false;
  }
};

// 📝 Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    console.log("✅ User created successfully:", user.uid);
    return { success: true, user };
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return { success: false, error: error.message };
  }
};

// 🔑 Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ User signed in successfully:", user.uid);
    return { success: true, user };
  } catch (error) {
    console.error("❌ Error signing in:", error);
    let errorMessage = "Failed to sign in. Please check your credentials.";

    if (error.code === 'auth/user-not-found') {
      errorMessage = "No account found with this email. Please sign up first.";
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address.";
    }

    return { success: false, error: errorMessage };
  }
};

// 🌐 Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("✅ User signed in with Google:", user.uid);
    return { success: true, user };
  } catch (error) {
    console.error("❌ Error signing in with Google:", error);
    let errorMessage = "Failed to sign in with Google.";

    if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = "An account already exists with this email using a different sign-in method.";
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Sign-in popup was closed. Please try again.";
    }

    return { success: false, error: errorMessage };
  }
};

// 🚪 Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("✅ User signed out successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error signing out:", error);
    return { success: false, error: error.message };
  }
};

// 👤 Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// 🔄 Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 🔁 Force token refresh when needed
const refreshAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await user.getIdToken(true);
      console.log("🔄 Firebase auth token refreshed");
      return true;
    } catch (error) {
      console.error("❌ Error refreshing auth token:", error);
      return false;
    }
  }
  return false;
};

// ===== FIRESTORE FUNCTIONS REMOVED =====
// Using Realtime Database instead of Firestore for chat data

// getChatHistory function removed - using Realtime Database getChatSessions instead

// ===== REALTIME DATABASE FUNCTIONS =====

// 💾 Save chat session to Realtime Database
export const saveChatSession = async (sessionId, userMessage, aiResponse, detectedConditions = [], recommendedMedications = []) => {
  try {
    console.log("🔥 Starting saveChatSession with:", {
      sessionId,
      userMessageLength: userMessage?.length,
      aiResponseLength: aiResponse?.length,
      detectedConditions,
      medicationsCount: recommendedMedications?.length
    });

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const sessionRef = ref(rtdb, `chatSessions/${sessionId}`);
    const chatRef = push(child(sessionRef, 'messages'));

    const chatData = {
      timestamp: Date.now(),
      userMessage: userMessage.trim(),
      aiResponse: aiResponse.trim(),
      detectedConditions,
      recommendedMedications,
      sessionDate: new Date().toISOString().split('T')[0]
    };

    console.log("🔥 Saving data to path:", `chatSessions/${sessionId}/messages`);
    console.log("🔥 Data to save:", chatData);

    await set(chatRef, chatData);
    console.log("✅ Chat session saved to Realtime Database successfully");
    return true;
  } catch (error) {
    console.error("❌ Error saving chat session:", error);
    console.error("❌ Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};

// 📊 Save user medical data
export const saveUserMedicalData = async (sessionId, medicalData) => {
  try {
    const userRef = ref(rtdb, `users/${sessionId}/medicalHistory`);
    const recordRef = push(userRef);

    const dataToSave = {
      ...medicalData,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    await set(recordRef, dataToSave);
    console.log("✅ User medical data saved");
    return true;
  } catch (error) {
    console.error("❌ Error saving user medical data:", error);
    return false;
  }
};

// 📤 Get chat sessions for a user
export const getChatSessions = async (sessionId) => {
  try {
    const sessionRef = ref(rtdb, `chatSessions/${sessionId}/messages`);
    const snapshot = await get(sessionRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const sessions = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => a.timestamp - b.timestamp);

      console.log(`✅ Retrieved ${sessions.length} chat sessions`);
      return sessions;
    }

    return [];
  } catch (error) {
    console.error("❌ Error getting chat sessions:", error);
    return [];
  }
};

// 📋 Get user medical history
export const getUserMedicalHistory = async (sessionId) => {
  try {
    const userRef = ref(rtdb, `users/${sessionId}/medicalHistory`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const history = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => b.timestamp - a.timestamp);

      console.log(`✅ Retrieved medical history with ${history.length} records`);
      return history;
    }

    return [];
  } catch (error) {
    console.error("❌ Error getting user medical history:", error);
    return [];
  }
};

// 🏥 Get latest medical summary for reports
export const getLatestMedicalSummary = async (sessionId) => {
  try {
    const sessions = await getChatSessions(sessionId);
    const medicalHistory = await getUserMedicalHistory(sessionId);

    // Extract all detected conditions and medications from chat sessions
    const allConditions = [];
    const allMedications = [];

    sessions.forEach(session => {
      if (session.detectedConditions) {
        allConditions.push(...session.detectedConditions);
      }
      if (session.recommendedMedications) {
        allMedications.push(...session.recommendedMedications);
      }
    });

    // Remove duplicates
    const uniqueConditions = [...new Set(allConditions)];
    const uniqueMedications = [...new Set(allMedications.map(med => med.name))];

    return {
      conditions: uniqueConditions,
      medications: uniqueMedications,
      totalSessions: sessions.length,
      lastVisit: sessions.length > 0 ? new Date(sessions[sessions.length - 1].timestamp).toLocaleDateString() : null,
      medicalHistory
    };
  } catch (error) {
    console.error("❌ Error getting medical summary:", error);
    return {
      conditions: [],
      medications: [],
      totalSessions: 0,
      lastVisit: null,
      medicalHistory: []
    };
  }
};

// 🧪 Test Firebase Realtime Database connection
export const testRealtimeDatabase = async () => {
  try {
    const testRef = ref(rtdb, 'test');
    await set(testRef, {
      message: "Test connection",
      timestamp: Date.now()
    });
    console.log("✅ Realtime Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Realtime Database connection test failed:", error);
    return false;
  }
};

export { db, auth, rtdb, googleProvider };
