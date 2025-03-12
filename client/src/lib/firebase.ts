import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Verify required environment variables are present
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.error('Firebase API key is missing');
  throw new Error('Firebase configuration error: API key is missing');
}

if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  console.error('Firebase project ID is missing');
  throw new Error('Firebase configuration error: Project ID is missing');
}

if (!import.meta.env.VITE_FIREBASE_APP_ID) {
  console.error('Firebase app ID is missing');
  throw new Error('Firebase configuration error: App ID is missing');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('Initializing Firebase with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const storage = getStorage(app);

  export { app, auth, storage };
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}