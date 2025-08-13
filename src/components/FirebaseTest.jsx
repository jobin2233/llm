import { useState } from 'react';
import { testRealtimeDatabase, saveChatSession, getCurrentUser } from '../services/firebase';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult('🧪 Starting comprehensive Firebase test...\n\n');

    try {
      // Test 1: Check environment variables
      setTestResult(prev => prev + '1️⃣ Checking environment variables...\n');
      const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
      setTestResult(prev => prev + `   Database URL: ${dbUrl ? 'SET' : 'MISSING'}\n`);
      if (dbUrl) {
        setTestResult(prev => prev + `   URL: ${dbUrl}\n`);
      }
      setTestResult(prev => prev + '\n');

      // Test 2: Basic connection
      setTestResult(prev => prev + '2️⃣ Testing basic Realtime Database connection...\n');
      const connectionTest = await testRealtimeDatabase();
      setTestResult(prev => prev + `   Result: ${connectionTest ? '✅ SUCCESS' : '❌ FAILED'}\n\n`);

      // Test 3: Get current user
      setTestResult(prev => prev + '3️⃣ Checking authentication...\n');
      const user = getCurrentUser();
      setTestResult(prev => prev + `   User: ${user ? `✅ ${user.email} (${user.uid})` : '❌ No user logged in'}\n\n`);

      // Test 4: Try to save a chat session
      setTestResult(prev => prev + '4️⃣ Testing chat session save...\n');
      if (user) {
        const testData = {
          sessionId: user.uid,
          userMessage: 'Test user message for debugging',
          aiResponse: 'Test AI response with medication recommendations',
          conditions: ['test_condition'],
          medications: [{ name: 'Test Medication', rating: 8.5 }]
        };

        setTestResult(prev => prev + `   Saving with sessionId: ${testData.sessionId}\n`);

        const saveTest = await saveChatSession(
          testData.sessionId,
          testData.userMessage,
          testData.aiResponse,
          testData.conditions,
          testData.medications
        );

        setTestResult(prev => prev + `   Save result: ${saveTest ? '✅ SUCCESS' : '❌ FAILED'}\n`);

        if (saveTest) {
          setTestResult(prev => prev + '   ✅ Data should now appear in Firebase Console!\n');
          setTestResult(prev => prev + `   📍 Check: chatSessions/${user.uid}/messages\n`);
        }
      } else {
        setTestResult(prev => prev + '   ⚠️ Cannot test save - please sign in first\n');
      }

      setTestResult(prev => prev + '\n🎯 Test completed! Check Firebase Console to verify data.\n');

    } catch (error) {
      setTestResult(prev => prev + `\n❌ Unexpected error: ${error.message}\n`);
      setTestResult(prev => prev + `   Stack: ${error.stack}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">Firebase Connection Test</h3>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Run Firebase Test'}
      </button>

      {testResult && (
        <div className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
