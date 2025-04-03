import axios from 'axios';
import { getCurrentUser, auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = getCurrentUser();
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User API functions
export const getUserProfile = () => api.get('/users/me');
export const syncUserProfile = () => api.post('/users/sync');
export const updateUserProfile = (userData) => api.put('/users/me/profile', userData);
export const updateUserPreferences = (preferences) => api.put('/users/me/preferences', { preferences });

export default api;
