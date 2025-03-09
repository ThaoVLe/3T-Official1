import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Helper function to format config string to proper JSON
function formatConfigString(configStr: string): string {
  try {
    // If it's already valid JSON, return it
    JSON.parse(configStr);
    console.log('Config is already valid JSON');
    return configStr;
  } catch {
    console.log('Converting JS object notation to JSON...');
    // Try to convert JS object notation to JSON
    const formattedStr = configStr
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/\s+/g, '') // Remove whitespace
      .replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas

    console.log('Formatted string:', formattedStr);
    try {
      // Verify the formatted string is valid JSON
      JSON.parse(formattedStr);
      console.log('Successfully formatted to valid JSON');
      return formattedStr;
    } catch (error) {
      // If that fails, try to manually parse the object structure
      const config = {
        apiKey: configStr.match(/apiKey:\s*["']([^"']+)["']/)?.[1],
        authDomain: configStr.match(/authDomain:\s*["']([^"']+)["']/)?.[1],
        projectId: configStr.match(/projectId:\s*["']([^"']+)["']/)?.[1],
        storageBucket: configStr.match(/storageBucket:\s*["']([^"']+)["']/)?.[1],
        messagingSenderId: configStr.match(/messagingSenderId:\s*["']([^"']+)["']/)?.[1],
        appId: configStr.match(/appId:\s*["']([^"']+)["']/)?.[1],
        measurementId: configStr.match(/measurementId:\s*["']([^"']+)["']/)?.[1]
      };

      // Convert the parsed object to a JSON string
      return JSON.stringify(config);
    }
  }
}

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

    console.log('Raw config string:', rawConfigStr); // Debug log

    // Format and clean the config string
    const formattedConfigStr = formatConfigString(rawConfigStr);
    console.log('Formatted config string:', formattedConfigStr); // Debug log

    let firebaseConfig;
    try {
      firebaseConfig = JSON.parse(formattedConfigStr);
      console.log('Parsed config:', firebaseConfig); // Debug log
    } catch (parseError) {
      console.error('Failed to parse Firebase config:', parseError);
      console.error('Attempted to parse:', formattedConfigStr);
      return null;
    }

    if (!validateFirebaseConfig(firebaseConfig)) {
      console.error('Invalid Firebase config structure:', firebaseConfig);
      return null;
    }

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

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export async function signInWithGoogle() {
  try {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }

    const result = await signInWithPopup(auth, googleProvider);
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