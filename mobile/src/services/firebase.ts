import { initializeApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
    await auth.signOut();
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

export {  auth, signInWithGoogle, signOut, getCurrentUser, isSessionExpired };