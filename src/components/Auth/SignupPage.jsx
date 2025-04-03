import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  
  const { signup, loginGoogle, currentUser, error } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signup(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setSignupError('Failed to create account');
      }
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setSignupError('');
    setIsLoading(true);
    
    try {
      const success = await loginGoogle();
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Create Account</h2>
        
        {(signupError || error) && (
          <div className="error-message">
            {signupError || error}
          </div>
        )}
        
        <form onSubmit={handleEmailSignup}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn login-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          className="btn google-btn" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          Sign up with Google
        </button>
        
        <div className="auth-redirect">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage; 