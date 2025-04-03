import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import ProfileDetails from '../Profile/ProfileDetails';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<ProfileDetails />} />
          <Route path="/profile" element={<ProfileDetails />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard; 