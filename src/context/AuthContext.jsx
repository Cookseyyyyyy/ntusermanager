import { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithEmail, loginWithGoogle, logoutUser } from '../services/firebase';
import { trackLogin, trackLogout } from '../services/analytics';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const login = async (email, password) => {
    try {
      setError('');
      await loginWithEmail(email, password);
      trackLogin('email');
      return true;
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      
      // Handle Firebase specific error codes
      let errorMessage = 'Login failed';
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
      return false;
    }
  };
  
  const loginGoogle = async () => {
    try {
      setError('');
      await loginWithGoogle();
      trackLogin('google');
      return true;
    } catch (err) {
      console.error('Google login error:', err.code, err.message);
      
      // Handle Firebase specific error codes
      let errorMessage = 'Login with Google failed';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google sign-in was cancelled';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      setError('');
      await logoutUser();
      trackLogout();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };
  
  const value = {
    currentUser,
    login,
    loginGoogle,
    logout,
    error,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext; 