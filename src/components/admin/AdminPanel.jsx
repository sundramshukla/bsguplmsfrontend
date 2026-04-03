import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('isAdminLoggedIn');
    if (adminAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isAdminLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
  };

  if (isLoggedIn) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
};

export default AdminPanel;
