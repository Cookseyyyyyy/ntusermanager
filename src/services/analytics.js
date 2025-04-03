import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

// Check if analytics is available (browser environment)
const isAnalyticsAvailable = () => {
  return analytics !== null && typeof window !== 'undefined';
};

// Log events to Firebase Analytics
export const trackEvent = (eventName, eventParams = {}) => {
  if (isAnalyticsAvailable()) {
    logEvent(analytics, eventName, eventParams);
  }
};

// Common analytics events
export const trackLogin = (method) => {
  trackEvent('login', { method });
};

export const trackLogout = () => {
  trackEvent('logout');
};

export const trackProfileUpdate = () => {
  trackEvent('profile_update');
};

export const trackPasswordChange = () => {
  trackEvent('password_change');
};

export const trackEmailVerification = () => {
  trackEvent('email_verification_sent');
};

export default {
  trackEvent,
  trackLogin,
  trackLogout,
  trackProfileUpdate,
  trackPasswordChange,
  trackEmailVerification,
}; 