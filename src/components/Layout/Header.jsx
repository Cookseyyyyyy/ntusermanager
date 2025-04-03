import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

function Header() {
  const { currentUser, logout } = useAuth();
  const { userProfile } = useUser();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>User Dashboard</h1>
      </div>
      
      <div className="header-right">
        {currentUser && (
          <div className="user-info">
            <span className="welcome-message">
              Welcome, {userProfile?.displayName || currentUser.email}
            </span>
            <button 
              className="btn logout-btn" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header; 