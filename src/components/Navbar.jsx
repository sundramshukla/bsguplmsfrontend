import React, { useState, useEffect } from "react";
import "../CSS/style.css";

const Navbar = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  
  // User Data
  const [formData, setFormData] = useState({ name: '', email: '', mobile_number: '' });
  const [loginMobile, setLoginMobile] = useState('');
  
  // OTP flow states
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [authType, setAuthType] = useState(''); // 'register' or 'login'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEvent = () => {
      setIsRegisterOpen(true);
      setIsLoginOpen(false);
      setOtpMode(false);
      setOtp('');
      setFormData({ name: '', email: '', mobile_number: '' });
    };
    window.addEventListener('openRegisterModal', handleEvent);
    return () => window.removeEventListener('openRegisterModal', handleEvent);
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openRegister = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setOtpMode(false);
    setOtp('');
    setFormData({ name: '', email: '', mobile_number: '' });
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setOtpMode(false);
    setOtp('');
    setLoginMobile('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile_number) {
      alert('Please fill all fields.');
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await fetch(`https://softwarebsguplms.pythonanywhere.com/bsgupadmin/register/?mobile_number=${formData.mobile_number}&role=student`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Register response:", data);
        alert(`Development Info: The OTP is ${data.otp}`);
        setAuthType('register');
        setOtpMode(true);
      } else {
        alert("Failed to send OTP for registration.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginMobile) {
      alert('Please provide mobile number.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`https://softwarebsguplms.pythonanywhere.com/bsgupadmin/login/?mobile_number=${loginMobile}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Login response:", data);
        alert(`Development Info: The OTP is ${data.otp}`);
        setAuthType('login');
        setOtpMode(true);
      } else {
        alert("Failed to send OTP for login.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    try {
      setIsLoading(true);
      let url = "";
      let payload = {};

      if (authType === 'register') {
        url = `https://softwarebsguplms.pythonanywhere.com/bsgupadmin/register/?mobile_number=${formData.mobile_number}&role=student`;
        payload = {
            mobile_number: parseInt(formData.mobile_number, 10),
            otp: parseInt(otp, 10),
            role: "student"
        };
      } else if (authType === 'login') {
        url = `https://softwarebsguplms.pythonanywhere.com/bsgupadmin/login/?mobile_number=${loginMobile}`;
        payload = {
            mobile_number: parseInt(loginMobile, 10),
            otp: parseInt(otp, 10)
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // success
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        window.dispatchEvent(new Event('authChange'));
        if (authType === 'login' && !formData.name) {
          // just a fallback if name is not set
          setFormData(prev => ({ ...prev, name: 'Student' }));
        }
        setIsRegisterOpen(false);
        setIsLoginOpen(false);
        setOtpMode(false);
      } else {
        alert("Invalid OTP or error occurred.");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    window.dispatchEvent(new Event('authChange'));
    setFormData({ name: '', email: '', mobile_number: '' });
    setLoginMobile('');
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
                <a href="#" className="login" onClick={(e) => { e.preventDefault(); openLogin(); }}>Login</a>
                <button className="btn-primary" onClick={openRegister}>
                  Sign Up
                </button>
              </>
            ) : (
              <div className="logged-in-menu relative group">
                <button className="btn-primary flex items-center gap-2">
                  Hi, {formData.name ? formData.name.split(' ')[0] : 'Student'} ▼
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30 border border-slate-200 hidden group-hover:block">
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Profile page is under construction!"); }} className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">My Profile</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Payment history is under construction!"); }} className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">Payment History</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("My courses dashboard is under construction!"); }} className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">My Courses</a>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsRegisterOpen(false)}>
          <div className="bg-white p-8 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Register for Beginner Course</h3>
            {!otpMode ? (
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Sending OTP...' : 'Start Training & Get OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP sent to {formData.mobile_number}</label>
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={handleRegisterSubmit} disabled={isLoading} className="text-sm font-semibold text-[#7c3aed] hover:text-[#6d28d9] disabled:opacity-50">
                      Resend OTP
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP & Register'}
                </button>
              </form>
            )}
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="mt-4 w-full text-slate-500 hover:text-slate-700 text-sm py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsLoginOpen(false)}>
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Login to your account</h3>
            {!otpMode ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Sending OTP...' : 'Get OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP sent to {loginMobile}</label>
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={handleLoginSubmit} disabled={isLoading} className="text-sm font-semibold text-[#7c3aed] hover:text-[#6d28d9] disabled:opacity-50">
                      Resend OTP
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
                </button>
              </form>
            )}
            <button
              onClick={() => setIsLoginOpen(false)}
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
