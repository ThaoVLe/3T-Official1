import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword as fbCreateUser,
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - you should place these in environment variables in production
const firebaseConfig = {
  apiKey: "AIzaSyDJKkQQzE-rLXYT0hcNSVVeTFDEJzKHdAw",  // This is a placeholder - replace with your own
  authDomain: "personaljournal-app.firebaseapp.com",
  projectId: "personaljournal-app",
  storageBucket: "personaljournal-app.appspot.com",
  messagingSenderId: "123456789012", // Added messagingSenderId - required for some Firebase features
  appId: "1:123456789012:web:123456789abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export auth functions
const createUserWithEmailAndPassword = (email, password) => {
  return fbCreateUser(auth, email, password);
};

const signInWithEmailAndPassword = (email, password) => {
  return fbSignIn(auth, email, password);
};


const onAuthStateChanged = (callback) => {
  return fbOnAuthStateChanged(auth, callback);
};

// Session management constants
const SESSION_KEY = 'auth_session_timestamp';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Function to check if session is expired
export const isSessionExpired = async () => {
  try {
    const timestamp = await AsyncStorage.getItem(SESSION_KEY);
    if (!timestamp) {
      console.log('No session timestamp found');
      return true;
    }

    const lastLoginTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const isExpired = (currentTime - lastLoginTime) > SESSION_DURATION;
    console.log('Session expired:', isExpired);
    return isExpired;
  } catch (error) {
    console.error('Error checking session:', error);
    return true; // Default to expired on error
  }
};

// Update session timestamp
const updateSessionTimestamp = async () => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
    console.log('Session timestamp updated');
  } catch (error) {
    console.error('Error updating session:', error);
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await updateSessionTimestamp(); // Update session timestamp after successful login
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await fbSignOut(auth);
    await AsyncStorage.removeItem(SESSION_KEY); // Clear session on logout
    console.log('User signed out and session cleared');
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export {  auth, signInWithGoogle, signOut, getCurrentUser, isSessionExpired, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged };