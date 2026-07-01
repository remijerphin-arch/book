/**
 * Firebase Client Initializer
 * 
 * If you configure Firebase environment variables, you can install the 'firebase' package:
 * npm install firebase
 * 
 * And uncomment the code below to connect to a live Firebase Auth / Firestore instance.
 * By default, this application operates in an elegant Local Demo Mode using LocalStorage.
 */

// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if variables are configured
const hasFirebaseConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const isFirebaseEnabled = !!hasFirebaseConfig;

if (isFirebaseEnabled) {
  console.log("Firebase configuration detected. Initializing live services...");
} else {
  console.log("No Firebase credentials found. 'Unnamed Feels' is running in Local Demo Mode.");
}

// Mock export templates (uncomment if using Firebase library)
/*
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
*/

export const MOCK_FIREBASE_INFO = {
  mode: isFirebaseEnabled ? "live" : "demo",
  configUrl: "Configure NEXT_PUBLIC_FIREBASE_* keys in your .env.local to activate live Firebase sync."
};
