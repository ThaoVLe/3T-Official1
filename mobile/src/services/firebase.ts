import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
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
const googleProvider = new GoogleAuthProvider();

// Session constants
const SESSION_KEY = 'auth_session_timestamp';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds


// User management functions
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

// Function to determine if session is expired (24-hour period)
export const isSessionExpired = async () => {
  const user = auth.currentUser;
  if (!user) return true;

  try {
    // Get last login time
    const lastLoginTime = user.metadata.lastSignInTime 
      ? new Date(user.metadata.lastSignInTime).getTime()
      : 0;

    // Calculate time difference (24 hours = 86400000 ms)
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastLoginTime;

    // Session expires after 24 hours
    return timeDifference > SESSION_DURATION_MS;
  } catch (error) {
    console.error('Error checking session expiration:', error);
    // Default to expired on error
    return true;
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
    const result = await signInWithPopup(auth, googleProvider);
    await updateSessionTimestamp();
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
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
    // Clear session timestamp on logout
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

export { 
  auth, 
  signInWithGoogle,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getCurrentUser,
  getUserProfile,
  isSessionExpired
};