import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add Google Drive scope for backup access
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export async function signInWithGoogle() {
  try {
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
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out Error:', error);
    throw error;
  }
}

export { auth };
