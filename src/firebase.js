// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjNtPzruCXwsEemj0N-2PLrYK1hyysbsE",
  authDomain: "e-commerce-be504.firebaseapp.com",
  projectId: "e-commerce-be504",
  storageBucket: "e-commerce-be504.firebasestorage.app",
  messagingSenderId: "18259284663",
  appId: "1:18259284663:web:1fc594cc48ed77b53e3332",
  measurementId: "G-14ZVSS1SSF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
