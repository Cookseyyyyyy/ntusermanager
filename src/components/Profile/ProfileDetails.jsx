import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { verifyEmail, changePassword, getSignInMethodsForEmail } from '../../services/firebase';
import { trackProfileUpdate, trackPasswordChange, trackEmailVerification } from '../../services/analytics';
import SetPasswordForm from './SetPasswordForm';

function ProfileDetails() {
  const { currentUser } = useAuth();
  const { userProfile, updateUserProfile, loading, error, refreshProfile } = useUser();
  
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [signInMethods, setSignInMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  
  useEffect(() => {
    async function fetchSignInMethods() {
      if (currentUser?.email) {
        try {
          const methods = await getSignInMethodsForEmail(currentUser.email);
          setSignInMethods(methods);
        } catch (err) {
          console.error('Error fetching sign-in methods:', err);
        } finally {
          setLoadingMethods(false);
        }
      }
    }
    
    fetchSignInMethods();
  }, [currentUser]);
  
  // Start editing
  const handleEdit = () => {
    setDisplayName(userProfile?.displayName || '');
    setIsEditing(true);
    setSaveError('');
    setSaveSuccess('');
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setSaveError('');
  };
  
  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');
    
    try {
      const userData = {
        displayName
      };
      
      const success = await updateUserProfile(userData);
      
      if (success) {
        setIsEditing(false);
        setSaveSuccess('Profile updated successfully!');
        trackProfileUpdate();
      } else {
        setSaveError('Failed to update profile');
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Send verification email
  const handleVerifyEmail = async () => {
    try {
      await verifyEmail(currentUser);
      setSaveSuccess('Verification email sent!');
      trackEmailVerification();
    } catch (err) {
      setSaveError('Failed to send verification email: ' + err.message);
    }
  };
  
  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      await changePassword(currentUser, newPassword);
      setPasswordSuccess('Password changed successfully!');
      trackPasswordChange();
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError('Failed to change password: ' + err.message);
    }
  };
  
  // Loading state
  if (loading && !userProfile) {
    return <div className="loading">Loading profile...</div>;
  }
  
  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      
      {(error || saveError) && (
        <div className="error-message">
          {error || saveError}
        </div>
      )}
      
      {saveSuccess && (
        <div className="success-message">
          {saveSuccess}
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-section">
          <h3>Account Information</h3>
          
          <div className="profile-details">
            <div className="profile-field">
              <span className="field-label">Email:</span>
              <span className="field-value">{currentUser?.email}</span>
              {currentUser?.emailVerified ? (
                <span className="verified-badge">Verified</span>
              ) : (
                <button 
                  className="btn verify-btn" 
                  onClick={handleVerifyEmail}
                >
                  Verify Email
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="profile-field">
                  <label className="field-label" htmlFor="displayName">Display Name:</label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                
                <div className="profile-actions">
                  <button 
                    type="submit" 
                    className="btn save-btn" 
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    type="button" 
                    className="btn cancel-btn" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-field">
                  <span className="field-label">Display Name:</span>
                  <span className="field-value">
                    {userProfile?.displayName || 'Not set'}
                  </span>
                </div>
                
                <div className="profile-actions">
                  <button 
                    className="btn edit-btn" 
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Security</h3>
          
          {passwordError && (
            <div className="error-message">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="success-message">
              {passwordSuccess}
            </div>
          )}
          
          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange}>
              <div className="profile-field">
                <label className="field-label" htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="profile-field">
                <label className="field-label" htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="profile-actions">
                <button 
                  type="submit" 
                  className="btn save-btn"
                >
                  Change Password
                </button>
                <button 
                  type="button" 
                  className="btn cancel-btn" 
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              className="btn password-btn" 
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </button>
          )}
        </div>
        
        {signInMethods.includes('google.com') && !signInMethods.includes('password') && (
          <SetPasswordForm />
        )}
      </div>
    </div>
  );
}

export default ProfileDetails; 