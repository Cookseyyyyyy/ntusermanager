import { createContext, useState, useContext, useEffect } from 'react';
import { getUserProfile, syncUserProfile, updateUserProfile as apiUpdateUserProfile } from '../services/api';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  
  const fetchUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      // First try to sync the user data
      try {
        const syncResponse = await syncUserProfile();
        if (syncResponse.data.status === 'success') {
          setUserProfile(syncResponse.data.data.user);
          setLoading(false);
          return;
        }
      } catch (syncErr) {
        console.log('User sync failed, fetching profile:', syncErr.message);
      }
      
      // If sync fails or doesn't return a user, try getting the profile
      try {
        const response = await getUserProfile();
        if (response.data.status === 'success') {
          setUserProfile(response.data.data.user);
        }
      } catch (profileErr) {
        // If we can't get the profile from the API, create a minimal profile from Firebase auth
        console.log('User profile fetch failed:', profileErr.message);
        setUserProfile({
          email: currentUser.email,
          displayName: currentUser.displayName || '',
          emailVerified: currentUser.emailVerified
        });
      }
    } catch (err) {
      setError('Failed to fetch profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfile = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiUpdateUserProfile(userData);
      
      if (response.data.status === 'success') {
        setUserProfile(response.data.data.user);
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [currentUser]);
  
  const value = {
    userProfile,
    updateUserProfile,
    loading,
    error,
    refreshProfile: fetchUserProfile
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export default UserContext; 