import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZbBN6wIxie8jvPHJ3mLqwrGr64Vu1n-Q",
  authDomain: "nutria-b541a.firebaseapp.com",
  projectId: "nutria-b541a",
  storageBucket: "nutria-b541a.firebasestorage.app",
  messagingSenderId: "47150310665",
  appId: "1:47150310665:web:6a69265c738651c8b99fd8",
  measurementId: "G-3V9YNSP15S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user; // Contains displayName, email, photoURL, uid, etc.
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
