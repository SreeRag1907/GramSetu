// Firebase Configuration for GramSetu
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDGlIIkSKCY5Qgp4RFcudjy0Cvp6oKcRm0",
  authDomain: "tourism-465310.firebaseapp.com",
  projectId: "tourism-465310",
  storageBucket: "tourism-465310.firebasestorage.app",
  messagingSenderId: "234923563150",
  appId: "1:234923563150:web:9367703904cf5805a591df",
  measurementId: "G-RHE9P5BG48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
