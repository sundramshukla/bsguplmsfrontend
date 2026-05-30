import React, { useState, useEffect } from "react";
import "../CSS/style.css";
import { BASE_URL } from '../config';

const Navbar = () => {
  const [toast, setToast] = useState(null);
  const showAlert = (msg) => {
    const isError = msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('please');
    setToast({ msg, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 4000);
  };

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // User Data
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // OTP flow states
  const [otpMode, setOtpMode] = useState(false);
  const [profileMode, setProfileMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [authType, setAuthType] = useState(''); // 'register' or 'login'
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password flow states
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpMode, setForgotOtpMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const handleEvent = () => {
      setIsRegisterOpen(true);
      setIsLoginOpen(false);
      setOtpMode(false);
      setProfileMode(false);
      setForgotOtpMode(false);
      setIsForgotPasswordOpen(false);
      setOtp('');
      setFormData({ name: '', email: '', password: '' });
    };
    window.addEventListener('openRegisterModal', handleEvent);
    return () => window.removeEventListener('openRegisterModal', handleEvent);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setFormData({ name: '', email: '', password: '' });
      } else {
        const fetchProfileName = async () => {
          try {
            const userId = localStorage.getItem('userId');
            if (userId) {
              const res = await fetch(`${BASE_URL}/bsgupadmin/profile/?user_id=${userId}`);
              const data = await res.json();
              let profile = null;
              if (Array.isArray(data) && data.length > 0) profile = data[0];
              else if (data && data.full_name) profile = data;
              else if (data && data.data) profile = data.data;

              if (profile && profile.full_name) {
                setFormData(prev => ({ ...prev, name: profile.full_name }));
              }
            }
          } catch (err) {
            console.error(err);
          }
        };
        fetchProfileName();
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    handleAuthChange(); // run initially

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const openRegister = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setOtpMode(false);
    setProfileMode(false);
    setForgotOtpMode(false);
    setIsForgotPasswordOpen(false);
    setOtp('');
    setFormData({ name: '', email: '', password: '' });
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setOtpMode(false);
    setProfileMode(false);
    setForgotOtpMode(false);
    setIsForgotPasswordOpen(false);
    setOtp('');
    setLoginEmail('');
    setLoginPassword('');
  };

  const processAuthSuccess = async (data, authType, emailStr) => {
        // Helper to extract JWT token deeply from response
        const extractToken = (obj) => {
           if (typeof obj === 'string' && obj.startsWith('eyJ')) return obj;
           if (typeof obj === 'object' && obj !== null) {
              if (obj.access && typeof obj.access === 'string') return obj.access;
              if (obj.token && typeof obj.token === 'string') return obj.token;
              for (const key in obj) {
                 if (typeof obj[key] === 'string' && obj[key].startsWith('eyJ')) return obj[key];
                 if (typeof obj[key] === 'object') {
                    const nested = extractToken(obj[key]);
                    if (nested) return nested;
                 }
              }
           }
           return null;
        };

        const parseJwt = (t) => {
           try { return JSON.parse(atob(t.split('.')[1])); } catch (e) { return null; }
        };

        const token = extractToken(data);
        let returnedUserId = null;
        let isAdmin = false;

        if (token) {
           localStorage.setItem('token', token);
           const decoded = parseJwt(token);
           if (decoded) {
              returnedUserId = decoded.user_id || decoded.id || decoded.user;
              const decodedStr = JSON.stringify(decoded).toLowerCase();
              if (decoded.role === 'admin' || decoded.isAdmin || decodedStr.includes('admin')) {
                 isAdmin = true;
              }
           }
        }

        if (!returnedUserId) {
          if (data) {
            returnedUserId = data.user_id || data.id || data.user || data.userId;
            if (!returnedUserId && data.data) {
               returnedUserId = data.data.user_id || data.data.id || data.data.user;
            }
            if (!returnedUserId && data.user_details) {
               returnedUserId = data.user_details.id || data.user_details.user_id;
            }
          }
        }

        if (isAdmin) {
           localStorage.setItem('isAdminLoggedIn', 'true');
           localStorage.setItem('adminToken', token || '');
           localStorage.setItem('isLoggedIn', 'true');
           if (returnedUserId) {
              localStorage.setItem('adminUserId', returnedUserId.toString());
              localStorage.setItem('userId', returnedUserId.toString());
           }
           setIsLoggedIn(true);
           window.dispatchEvent(new Event('authChange'));
           setIsRegisterOpen(false);
           setIsLoginOpen(false);
           setOtpMode(false);
           setProfileMode(false);
           showAlert("Welcome, Administrator!");
           return;
        }
        
        if (returnedUserId) {
           localStorage.setItem('userId', returnedUserId.toString());
        } else {
           console.warn("Could not find user ID in response or token:", data);
        }

        // Check if student is already fully registered with a profile
        if (authType === 'login') {
           let profileExists = false;
           let profileName = '';
           if (returnedUserId) {
             try {
               const pRes = await fetch(`${BASE_URL}/bsgupadmin/profile/?user_id=${returnedUserId}`);
               if (pRes.ok) {
                 const pData = await pRes.json();
                 let profileObj = null;
                 if (Array.isArray(pData) && pData.length > 0) profileObj = pData[0];
                 else if (pData && pData.full_name) profileObj = pData;
                 else if (pData && pData.data) profileObj = pData.data;

                 if (profileObj && profileObj.full_name) {
                   profileExists = true;
                   profileName = profileObj.full_name;
                 }
               }
             } catch (err) {
               console.error("Profile check failed:", err);
             }
           }

           if (profileExists) {
             // Profile exists: log in directly to portal
             setIsLoggedIn(true);
             localStorage.setItem('isLoggedIn', 'true');
             localStorage.setItem('isStudentLoggedIn', 'true');
             if (profileName) {
               setFormData(prev => ({ ...prev, name: profileName }));
             }
             window.dispatchEvent(new Event('authChange'));
             setIsRegisterOpen(false);
             setIsLoginOpen(false);
             setOtpMode(false);
             setProfileMode(false);
             window.location.hash = '#student';
           } else {
             // No profile: show Complete Profile form
             setOtpMode(false);
             setProfileMode(true);
             setIsLoginOpen(false);
             setIsRegisterOpen(true);
           }
        } else if (authType === 'register') {
           setIsRegisterOpen(false);
           setOtpMode(false);
           setIsLoginOpen(true);
           showAlert("Registration successful! Please login with your email and password to continue.");
        } else {
           // Fallback if authType is somehow missing
           setIsLoggedIn(true);
           localStorage.setItem('isLoggedIn', 'true');
           localStorage.setItem('isStudentLoggedIn', 'true');
           window.dispatchEvent(new Event('authChange'));
           if (!formData.name && data && data.full_name) {
             setFormData(prev => ({ ...prev, name: data.full_name }));
           }
           setIsRegisterOpen(false);
           setIsLoginOpen(false);
           setOtpMode(false);
           window.location.hash = '#student';
        }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showAlert('Please provide email and password.');
      return;
    }
    
    try {
      setIsLoading(true);
      const url = `${BASE_URL}/bsgupadmin/registerthroughemail/?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}&role=student`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Register response:", data);
        showAlert(`Development Info: The OTP is ${data.otp || 'sent'}`);
        setAuthType('register');
        setOtpMode(true);
      } else {
        showAlert("Failed to send OTP for registration. Check email/password.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showAlert('Please provide email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/bsgupadmin/loginthroughemail/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Login response:", data);
        setAuthType('login');
        await processAuthSuccess(data, 'login', loginEmail);
      } else {
        showAlert("Invalid credentials or login failed.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      showAlert("Please enter OTP");
      return;
    }

    try {
      setIsLoading(true);
      if (authType !== 'register') {
        return;
      }
      
      const url = `${BASE_URL}/bsgupadmin/registerthroughemail/?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}&role=student`;
      const payload = {
          email: formData.email,
          otp: otp
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        await processAuthSuccess(data, 'register', formData.email);
      } else {
        showAlert("Invalid OTP or error occurred.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId') || 1;
      const payload = {
        user: parseInt(userId, 10),
        ...profileData
      };
      
      const res = await fetch(`${BASE_URL}/bsgupadmin/profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isStudentLoggedIn', 'true');
        setFormData(prev => ({ ...prev, name: profileData.full_name }));
        window.dispatchEvent(new Event('authChange'));
        
        setIsRegisterOpen(false);
        setProfileMode(false);
        window.location.hash = '#student';
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Profile saving error:", errorData);
        showAlert("Failed to save profile. Please check the inputs.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error saving profile");
    } finally {
      setIsLoading(false);
    }
  };

  const openForgotPassword = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsForgotPasswordOpen(true);
    setForgotOtpMode(false);
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showAlert('Please provide email.');
      return;
    }

    try {
      setIsLoading(true);
      const url = `${BASE_URL}/bsgupadmin/forgetpassword/?email=${encodeURIComponent(forgotEmail)}`;
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        showAlert(`Development Info: The OTP is ${data.otp || 'sent'}`);
        setForgotOtpMode(true);
      } else {
        showAlert("Failed to send OTP for reset password. Check your email.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      showAlert('Please provide OTP and new password.');
      return;
    }

    try {
      setIsLoading(true);
      const url = `${BASE_URL}/bsgupadmin/forgetpassword/?email=${encodeURIComponent(forgotEmail)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otp, new_password: newPassword })
      });
      if (res.ok) {
        showAlert("Password reset successfully! Please login with your new password.");
        setIsForgotPasswordOpen(false);
        setForgotOtpMode(false);
        openLogin();
      } else {
        showAlert("Invalid OTP or error occurred.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isStudentLoggedIn');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminUserId');
    window.dispatchEvent(new Event('authChange'));
    setFormData({ name: '', email: '', password: '' });
    setLoginEmail('');
    setLoginPassword('');
    window.location.hash = '#';
  };

  return (
    <>
      <header className="navbar relative">
        <div className="container nav-container flex justify-between items-center px-4 md:px-0">
          <div className="logo cursor-pointer flex items-center gap-2" onClick={() => { window.location.hash = '#'; setIsMobileMenuOpen(false); }}>
            <span className="logo-icon text-2xl">📘</span>
            <span className="text-xl font-bold text-slate-900">BS<span className="highlight">GUP</span></span>
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
                <a href="#" className="login font-semibold hover:text-[#7c3aed]" onClick={(e) => { e.preventDefault(); openLogin(); }}>Login</a>
                <button className="btn-primary" onClick={openRegister}>
                  Sign Up
                </button>
              </>
            ) : (
              <div className="logged-in-menu relative group">
                <button className="btn-primary flex items-center gap-2">
                  Hi, {formData.name ? formData.name.split(' ')[0] : 'Student'} ▼
                </button>
                <div className="absolute right-0 top-full pt-2 w-48 z-30 hidden group-hover:block">
                  <div className="bg-white rounded-lg shadow-lg py-2 border border-slate-200">
                    <a href="#student" className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">My Profile</a>
                    <a href="#student" className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">Payment History</a>
                    <a href="#student" className="block px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">Student Dashboard</a>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden flex items-center text-slate-800 focus:outline-none p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <span className="material-symbols-outlined text-2xl font-bold">close</span>
            ) : (
              <span className="material-symbols-outlined text-2xl font-bold">menu</span>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col p-6 space-y-5 bg-white">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#courses" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-base font-bold text-slate-800 hover:text-[#7c3aed] transition-colors py-1 flex items-center gap-2 border-b border-slate-50 pb-2"
                >
                  <span>📚</span> Courses
                </a>
                <a 
                  href="#about" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-base font-bold text-slate-800 hover:text-[#7c3aed] transition-colors py-1 flex items-center gap-2 border-b border-slate-50 pb-2"
                >
                  <span>🏢</span> About Us
                </a>
                <a 
                  href="#testimonials" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-base font-bold text-slate-800 hover:text-[#7c3aed] transition-colors py-1 flex items-center gap-2 border-b border-slate-50 pb-2"
                >
                  <span>💬</span> Testimonials
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-base font-bold text-slate-800 hover:text-[#7c3aed] transition-colors py-1 flex items-center gap-2 border-b border-slate-50 pb-2"
                >
                  <span>📞</span> Contact
                </a>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                {!isLoggedIn ? (
                  <>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); openLogin(); }} 
                      className="text-center py-3 rounded-xl border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Login
                    </a>
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); openRegister(); }} 
                      className="w-full bg-[#7c3aed] text-white py-3 rounded-xl font-bold hover:bg-[#6d28d9] transition-all shadow-md active:scale-95"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-sm font-bold text-[#7c3aed] mb-1">
                      👤 Logged in as: <span className="text-slate-800">{formData.name || 'Student'}</span>
                    </div>
                    <a 
                      href="#student" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center gap-2 py-2 text-sm font-bold text-slate-700 hover:text-[#7c3aed] transition-colors"
                    >
                      My Profile
                    </a>
                    <a 
                      href="#student" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center gap-2 py-2 text-sm font-bold text-slate-700 hover:text-[#7c3aed] transition-colors"
                    >
                      Payment History
                    </a>
                    <a 
                      href="#student" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center gap-2 py-2 text-sm font-bold text-slate-700 hover:text-[#7c3aed] transition-colors"
                    >
                      Student Dashboard
                    </a>
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} 
                      className="w-full text-center mt-2 py-2.5 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors shadow-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-sm tracking-wide transition-all transform animate-in slide-in-from-top-5 fade-in duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}


      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsRegisterOpen(false)}>
          <div className="bg-white p-8 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{profileMode ? 'Complete Your Profile' : 'Register for BSGUP'}</h3>
            {!otpMode && !profileMode && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Sending OTP...' : 'Get OTP'}
                </button>
              </form>
            )}
            
            {otpMode && !profileMode && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP sent to {formData.email}</label>
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
                  {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
                </button>
              </form>
            )}

            {profileMode && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" name="full_name" value={profileData.full_name} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" name="date_of_birth" value={profileData.date_of_birth} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select name="gender" value={profileData.gender} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input type="text" name="city" value={profileData.city} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <input type="text" name="state" value={profileData.state} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                    <input type="text" name="pincode" value={profileData.pincode} onChange={handleProfileChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Saving Profile...' : 'Complete Registration'}
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
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={openForgotPassword} className="text-sm font-semibold text-[#7c3aed] hover:text-[#6d28d9]">
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            <button
              onClick={() => setIsLoginOpen(false)}
              className="mt-4 w-full text-slate-500 hover:text-slate-700 text-sm py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsForgotPasswordOpen(false)}>
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Reset Password</h3>
            {!forgotOtpMode ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
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
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP sent to {forgotEmail}</label>
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
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
