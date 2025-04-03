import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  updatePassword,
  sendEmailVerification,
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics - only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Authentication functions
export const loginWithEmail = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => 
  signInWithPopup(auth, googleProvider);

export const logoutUser = () => signOut(auth);

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const changePassword = (user, newPassword) => 
  updatePassword(user, newPassword);

export const verifyEmail = (user) => 
  sendEmailVerification(user);

// Get sign-in methods for an email
export const getSignInMethodsForEmail = (email) => 
  fetchSignInMethodsForEmail(auth, email);

// Link email/password to existing account
export const linkEmailPassword = (user, email, password) => {
  const credential = EmailAuthProvider.credential(email, password);
  return linkWithCredential(user, credential);
};

// Get current user helper function
export const getCurrentUser = () => {
  return auth.currentUser;
};

export { onAuthStateChanged };

export default auth; 