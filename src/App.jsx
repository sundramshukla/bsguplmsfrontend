import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import HomePage from './components/HomePage.jsx'
import Footer from './components/Footer.jsx'
import CoursesPage from './components/CoursesPage.jsx'
import AboutSection from './components/AboutSection.jsx'
import Testimonials from './components/Testimonials.jsx'
import ContactSection from './components/ContactSection.jsx'
import AdminPanel from './components/admin/AdminPanel.jsx'
import StudentPanel from './components/student/StudentPanel.jsx'

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(localStorage.getItem('isAdminLoggedIn') === 'true');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAdminLoggedIn(localStorage.getItem('isAdminLoggedIn') === 'true');
    };
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const renderContent = () => {
    switch(currentHash) {
      case '#courses':
        return <CoursesPage />;
      case '#about':
        return <AboutSection />;
      case '#testimonials':
        return <Testimonials />;
      case '#contact':
        return <ContactSection />;
      default:
        return <HomePage />;
    }
  };
  const isAdminRoute = isAdminLoggedIn;
  const isStudentPath = window.location.pathname === '/student' || window.location.pathname.startsWith('/student/');
  const isStudentRoute = currentHash === '#student' || currentHash.startsWith('#student/') || isStudentPath;

  const isFullScreenApp = isAdminRoute || isStudentRoute;

  return (
    <div className={`min-h-screen bg-white text-slate-800 flex flex-col ${isFullScreenApp ? 'h-screen overflow-hidden' : ''}`}>
      {!isFullScreenApp && <Navbar />}
      <main className={`flex-grow ${isFullScreenApp ? 'flex overflow-hidden' : ''}`}>
        {isAdminRoute ? <AdminPanel /> : isStudentRoute ? <StudentPanel /> : renderContent()}
      </main>
      {!isFullScreenApp && <Footer />}
    </div>
  )
}

export default App
