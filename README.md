# SynthesisAI - Smart Skin Analysis Platform

A comprehensive dermatology consultation platform with AI-powered skin analysis, medication recommendations, and detailed medical reporting.

## Features

- 🔐 **Firebase Authentication**: Secure user accounts with email/password and Google sign-in
- 🤖 **AI Chatbot**: Interactive dermatology assistant with voice input/output
- 📸 **Skin Analysis**: Upload images for instant AI-powered skin condition analysis
- 💊 **Medication Reports**: Comprehensive prescription recommendations based on detected conditions
- 📋 **User Reports**: Detailed medical history and consultation summaries
- 🔍 **RAG System**: Retrieval-Augmented Generation using comprehensive dermatology database
- 🔥 **Firebase Integration**: Real-time data storage and synchronization
- 🛡️ **Protected Routes**: Secure access to user-specific data and features
- 📱 **Modern UI**: Responsive design inspired by modern skincare websites
- 🚫 **Duplicate Prevention**: Prevents users from creating multiple accounts

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase Realtime Database, Firestore
- **AI Integration**: Custom API endpoints for skin analysis
- **Image Processing**: Cloudinary integration
- **Icons**: Heroicons
- **Routing**: React Router DOM

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd newtitle
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication**, **Realtime Database**, and **Firestore** in your project
3. Set up Authentication providers:
   - Enable **Email/Password** authentication
   - Enable **Google** authentication (optional)
4. Copy `.env.example` to `.env` and fill in your Firebase configuration:

```bash
cp .env.example .env
```

### 3. Firebase Realtime Database Rules

Set up the following rules in your Firebase Realtime Database:

```json
{
  "rules": {
    "chatSessions": {
      "$sessionId": {
        ".read": true,
        ".write": true,
        "messages": {
          "$messageId": {
            ".validate": "newData.hasChildren(['timestamp', 'userMessage', 'aiResponse'])"
          }
        }
      }
    },
    "users": {
      "$userId": {
        ".read": true,
        ".write": true,
        "medicalHistory": {
          "$recordId": {
            ".validate": "newData.hasChildren(['timestamp', 'date'])"
          }
        }
      }
    }
  }
}
```

### 4. Authentication Security Rules

Set up the following rules in your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chatHistory/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

**Important**: Update your Realtime Database rules to include user authentication:

```json
{
  "rules": {
    "chatSessions": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

### 5. Start Development Server

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.jsx      # Main chat interface with action buttons
│   │   ├── FloatingChatbot.jsx    # Floating chat widget
│   │   └── AnalysisResultCard.jsx # Skin analysis results display
│   ├── layout/
│   │   ├── Navbar.jsx             # Navigation with report links
│   │   └── Footer.jsx
│   └── Auth.tsx                   # Authentication component
├── pages/
│   ├── ChatBot.jsx                # Main chatbot page
│   ├── MedicationReport.jsx       # Medication/prescription report
│   ├── UserReport.jsx             # Comprehensive user medical report
│   ├── Home.jsx
│   └── Profile.jsx
├── services/
│   ├── firebase.js                # Firebase configuration and functions
│   ├── dermatologyRAG.js          # RAG system for medication recommendations
│   ├── api.js                     # External API integrations
│   └── cloudinary.js              # Image upload service
└── dermatology_database.json      # Comprehensive medication database
```

## Key Features Explained

### 1. RAG System (Retrieval-Augmented Generation)

The `dermatologyRAG.js` service provides:
- Automatic condition detection from user queries
- Medication recommendations based on detected conditions
- Comprehensive database of 89+ dermatological medications
- Intelligent search and filtering capabilities

### 2. Enhanced Chatbot

The chatbot now includes:
- **Action Buttons**: After each AI response, users can:
  - View Prescription (→ Medication Report)
  - Generate Report (→ User Report)
  - Continue Chatting
- **Firebase Integration**: All conversations are stored in real-time
- **RAG Integration**: Automatic medication recommendations

### 3. Medication Report

Features include:
- Detected conditions overview
- Recommended medications with ratings and mechanisms
- Patient information summary
- Print and share functionality
- Modern, clinical design

### 4. User Report

Comprehensive medical overview with:
- Consultation history
- Detected conditions timeline
- Reported symptoms analysis
- Visit frequency metrics
- Medical disclaimer and safety information

## Database Schema

### Realtime Database Structure

```
chatSessions/
  {sessionId}/
    messages/
      {messageId}/
        timestamp: number
        userMessage: string
        aiResponse: string
        detectedConditions: array
        recommendedMedications: array
        sessionDate: string

users/
  {userId}/
    medicalHistory/
      {recordId}/
        timestamp: number
        date: string
        conditions: array
        medications: array
        symptoms: array
```

## Medication Database

The `dermatology_database.json` contains:
- **12 categories** of dermatological conditions
- **89+ medications** with detailed information
- **Ratings** based on efficacy and clinical acceptance
- **Mechanisms of action** and specific uses
- **Comprehensive coverage** of common skin conditions

## Building for Production

Create a production build:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using React, Firebase, and AI.
