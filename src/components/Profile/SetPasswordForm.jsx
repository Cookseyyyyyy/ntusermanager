import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { linkEmailPassword } from '../../services/firebase';
import { trackPasswordChange } from '../../services/analytics';

function SetPasswordForm() {
  const { currentUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Link email/password to the Google account
      await linkEmailPassword(currentUser, currentUser.email, password);
      setSuccess('Password set successfully! You can now log in using your email and password.');
      setPassword('');
      setConfirmPassword('');
      trackPasswordChange();
    } catch (err) {
      console.error('Error linking email/password:', err);
      if (err.code === 'auth/provider-already-linked') {
        setError('This account already has a password set');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('For security reasons, please log out and log back in before setting a password');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <h3>Set Password for Email Login</h3>
      <p>Set a password to allow logging in with your email address in addition to Google.</p>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {success && (
        <div className="success-message">{success}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="profile-field">
          <label className="field-label" htmlFor="setPassword">Password:</label>
          <input
            type="password"
            id="setPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="profile-field">
          <label className="field-label" htmlFor="confirmSetPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmSetPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="profile-actions">
          <button 
            type="submit" 
            className="btn save-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SetPasswordForm; 