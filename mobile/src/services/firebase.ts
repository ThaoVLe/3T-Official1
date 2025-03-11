import { initializeApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@firebase/auth';
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
    if (!timestamp) return true;

    const lastLoginTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    return (currentTime - lastLoginTime) > SESSION_DURATION;
  } catch (error) {
    console.error('Error checking session:', error);
    return true; // Default to expired on error
  }
};

// Update session timestamp
const updateSessionTimestamp = async () => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, Date.now().toString());
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

//Sign in with email and password
export const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await updateSessionTimestamp();
        return result.user;
    } catch (error) {
        console.error('Email/Password Sign-In Error:', error)
        throw error;
    }
}

//Create user with email and password
export const createUserWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateSessionTimestamp();
        return result.user;
    } catch (error) {
        console.error('Email/Password Sign-Up Error:', error)
        throw error;
    }
}


// Sign out
export const signOut = async () => {
  try {
    await auth.signOut();
    await AsyncStorage.removeItem(SESSION_KEY); // Clear session on logout
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getUserProfile = async (userId: string) => {
  try {
    // Add Firestore implementation here when needed
    // For now, just return user info from auth
    if (auth.currentUser && auth.currentUser.uid === userId) {
      return {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};


export {  auth, signInWithGoogle, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, getCurrentUser, getUserProfile, isSessionExpired };