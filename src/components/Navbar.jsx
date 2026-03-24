import React, { useState } from "react";
import "../CSS/style.css";

const Navbar = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all fields.');
      return;
    }
    setIsLoggedIn(true);
    setIsRegisterOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({ name: '', email: '', phone: '' });
  };

  // inline component replaced

  return (
    <>
      <header className="navbar">
        <div className="container nav-container">
          <div className="logo cursor-pointer" onClick={() => window.location.hash = '#'}>
            <span className="logo-icon">📘</span>
            BS<span className="highlight">GUP</span>
          </div>

          <nav className="nav-links">
            <a href="#courses">Courses</a>
            <a href="#about">About Us</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="nav-actions">
            {!isLoggedIn ? (
              <>
                <a href="#" className="login" onClick={(e) => e.preventDefault()}>Login</a>
                <button className="btn-primary" onClick={() => setIsRegisterOpen(true)}>
                  Sign Up
                </button>
              </>
            ) : (
              <div className="logged-in-menu relative">
                <button className="btn-primary flex items-center gap-2">
                  Hi, {formData.name.split(' ')[0]} ▼
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30 border border-slate-200 hidden group-hover:block">
                  <a href="#" className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">My Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">Payment History</a>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">My Courses</a>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsRegisterOpen(false)}>
          <div className="bg-white p-8 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Register for Beginner Course</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors"
              >
                Start Training
              </button>
            </form>
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="mt-4 w-full text-slate-500 hover:text-slate-700 text-sm py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

