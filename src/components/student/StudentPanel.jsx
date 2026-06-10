import React, { useState, useEffect } from 'react';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';

const StudentPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const studentAuth = localStorage.getItem('isStudentLoggedIn');
    if (studentAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isStudentLoggedIn', 'true');
    localStorage.setItem('isLoggedIn', 'true');
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', '1');
    }
    window.dispatchEvent(new Event('authChange'));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isStudentLoggedIn');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    window.location.hash = '#';
  };

  if (isLoggedIn) {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  return <StudentLogin onLoginSuccess={handleLoginSuccess} />;
};

export default StudentPanel;
