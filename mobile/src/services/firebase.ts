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
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Firebase configuration - you should place these in environment variables in production
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore


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

// Function to check if session is expired by checking database
export const isSessionExpired = async (userId) => {
  try {
    if (!userId) {
      console.log('No user ID provided');
      return true;
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const lastLogin = userDoc.data().last_login;
      if (!lastLogin) return true;

      // Convert Firebase timestamp to JS Date
      const lastLoginDate = lastLogin.toDate();
      const currentDate = new Date();

      // Check if it's been more than 24 hours (86400000 ms) since last login
      return currentDate.getTime() - lastLoginDate.getTime() > 86400000;
    }
    return true; // No last_login record, treat as expired
  } catch (error) {
    console.error('Error checking session expiry:', error);
    return true; // On error, treat as expired for security
  }
};

// Update last login in database
export const updateLastLogin = async (userId) => {
  try {
    // Update last login timestamp
    // This implementation will depend on how your backend is set up
    console.log('Updating last login for user:', userId);

    // Update the user's last login timestamp
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      last_login: serverTimestamp()
    });

    console.log('Last login timestamp updated successfully');
  } catch (error) {
    console.error('Failed to update last login:', error);
  }
};
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