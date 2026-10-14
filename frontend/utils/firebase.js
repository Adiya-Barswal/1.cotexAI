// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-c6328.firebaseapp.com",
  projectId: "cortexai-c6328",
  storageBucket: "cortexai-c6328.firebasestorage.app",
  messagingSenderId: "336835274539",
  appId: "1:336835274539:web:dd018dd17f8d09c975476e",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
