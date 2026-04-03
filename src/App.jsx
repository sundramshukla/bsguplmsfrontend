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

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
  const isAdminPath = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  const isAdminRoute = currentHash === '#admin' || currentHash.startsWith('#admin/') || isAdminPath;

  return (
    <div className={`min-h-screen bg-white text-slate-800 flex flex-col ${isAdminRoute ? 'h-screen overflow-hidden' : ''}`}>
      {!isAdminRoute && <Navbar />}
      <main className={`flex-grow ${isAdminRoute ? 'flex overflow-hidden' : ''}`}>
        {isAdminRoute ? <AdminPanel /> : renderContent()}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
