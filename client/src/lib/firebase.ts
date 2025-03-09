import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Helper function to format config string to proper JSON
function formatConfigString(configStr: string): string {
  try {
    // If it's already valid JSON, return it
    JSON.parse(configStr);
    return configStr;
  } catch {
    // Try to convert JS object notation to JSON
    return configStr
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
      .replace(/'/g, '"'); // Replace single quotes with double quotes
  }
}

// Helper function to validate Firebase config
function validateFirebaseConfig(config: any): boolean {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  return requiredFields.every(field => typeof config[field] === 'string' && config[field].length > 0);
}

// Initialize Firebase with better error handling
function initializeFirebase() {
  try {
    const rawConfigStr = import.meta.env.VITE_FIREBASE_CONFIG;
    console.log('Raw Firebase config:', rawConfigStr); // For debugging

    if (!rawConfigStr) {
      throw new Error('Firebase configuration is missing from environment variables');
    }

    const formattedConfigStr = formatConfigString(rawConfigStr);
    let firebaseConfig;

    try {
      firebaseConfig = JSON.parse(formattedConfigStr);
    } catch (parseError) {
      console.error('Failed to parse Firebase config:', parseError);
      throw new Error('Invalid Firebase configuration format. Must be a valid JSON string.');
    }

    if (!validateFirebaseConfig(firebaseConfig)) {
      console.error('Invalid Firebase config structure:', firebaseConfig);
      throw new Error('Firebase configuration is missing required fields');
    }

    console.log('Firebase initialization successful');
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

const app = initializeFirebase();
const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

// Add Google Drive scope for backup access
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export async function signInWithGoogle() {
  try {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }

    const result = await signInWithPopup(auth, googleProvider);
    // Get Google Drive access token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return {
      user: result.user,
      accessToken: credential?.accessToken
    };
  } catch (error) {
    console.error('Google Sign-in Error:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }

    await signOut(auth);
  } catch (error) {
    console.error('Sign-out Error:', error);
    throw error;
  }
}

export { auth };