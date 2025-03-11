import { initializeApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
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
    return timeDifference > 86400000;
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

// Export Firebase auth instances and methods
export { 
  auth, 
  signInWithGoogle,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};