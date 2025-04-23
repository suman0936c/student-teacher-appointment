// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuVOvfSlqMdA88mMfqj1F_xD_5Z2mJcr4",
  authDomain: "student-teacher-appointm-89647.firebaseapp.com",
  projectId: "student-teacher-appointm-89647",
  storageBucket: "student-teacher-appointm-89647.firebasestorage.app",
  messagingSenderId: "57556310264",
  appId: "1:57556310264:web:62ae021456350d04e2430d",
  measurementId: "G-P71YSXKGKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage }; 