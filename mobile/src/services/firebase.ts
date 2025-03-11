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

// Session constants
const SESSION_KEY = 'auth_session_timestamp';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Check if session is expired
export const isSessionExpired = async (): Promise<boolean> => {
  try {
    const sessionTimestamp = await AsyncStorage.getItem(SESSION_KEY);
    
    // If no timestamp exists, session is expired
    if (!sessionTimestamp) return true;
    
    const lastLoginTime = parseInt(sessionTimestamp, 10);
    const currentTime = Date.now();
    
    // Check if more than 24 hours have passed
    return (currentTime - lastLoginTime) > SESSION_DURATION_MS;
  } catch (error) {
    console.error('Session check error:', error);
    return true; // If there's an error, force login
  }
};

// Update session timestamp
export const updateSessionTimestamp = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to update session timestamp:', error);
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Update session timestamp on successful login
    await updateSessionTimestamp();
    
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
    // Clear session timestamp on logout
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};