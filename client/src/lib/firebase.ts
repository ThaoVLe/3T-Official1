import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Helper function to validate Firebase config
function validateFirebaseConfig(config: any): boolean {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  return requiredFields.every(field => {
    const hasField = typeof config[field] === 'string' && config[field].length > 0;
    if (!hasField) {
      console.error(`Missing or invalid Firebase config field: ${field}`);
    }
    return hasField;
  });
}

// Initialize Firebase with better error handling
function initializeFirebase() {
  try {
    const rawConfigStr = import.meta.env.VITE_FIREBASE_CONFIG;
    if (!rawConfigStr) {
      console.error('Firebase configuration is missing from environment variables');
      return null;
    }

    let firebaseConfig;
    try {
      // Try parsing as JSON first
      firebaseConfig = JSON.parse(rawConfigStr);
    } catch {
      // If not JSON, try to parse the object notation
      const match = rawConfigStr.match(/({[\s\S]*})/);
      if (!match) {
        console.error('Invalid Firebase config format');
        return null;
      }

      // Clean up the string and try to parse it
      const cleanConfig = match[1]
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/'/g, '"')
        .replace(/,(\s*[}\]])/g, '$1');

      try {
        firebaseConfig = JSON.parse(cleanConfig);
      } catch (parseError) {
        console.error('Failed to parse Firebase config:', parseError);
        return null;
      }
    }

    // Ensure required fields are present
    if (!validateFirebaseConfig(firebaseConfig)) {
      console.error('Invalid Firebase config structure:', firebaseConfig);
      return null;
    }

    // Ensure authDomain is properly formatted
    if (!firebaseConfig.authDomain.includes('firebaseapp.com')) {
      firebaseConfig.authDomain = `${firebaseConfig.projectId}.firebaseapp.com`;
    }

    console.log('Initializing Firebase with config:', {
      ...firebaseConfig,
      apiKey: '***' // Hide API key in logs
    });

    const app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
    return app;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

const app = initializeFirebase();
if (!app) {
  console.error('Failed to initialize Firebase app');
}

const auth = app ? getAuth(app) : null;
if (!auth) {
  console.error('Failed to initialize Firebase auth');
}

// Configure Google Provider with required scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

export async function signInWithGoogle() {
  try {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }

    // Configure OAuth consent screen settings
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline',
    });

    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return {
      user: result.user,
      accessToken: credential?.accessToken
    };
  } catch (error) {
    console.error('Google Sign-in Error:', error);
    // Add specific error handling for unauthorized domain
    if ((error as any).code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname;
      throw new Error(`This domain (${currentDomain}) is not authorized. Please add it to the Firebase Console under Authentication > Settings > Authorized domains.`);
    } else if ((error as any).code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.');
    } else if ((error as any).code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if ((error as any).code === 'auth/invalid-oauth-provider') {
      throw new Error('Please make sure Google sign-in is enabled in your Firebase Console under Authentication > Sign-in methods.');
    } else if ((error as any).code === 'auth/operation-not-allowed') {
      throw new Error('Google authentication is not enabled. Please enable it in your Firebase Console and set up the OAuth consent screen in Google Cloud Console.');
    }
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