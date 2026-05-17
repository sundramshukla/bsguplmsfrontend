import React, { useState, useEffect } from "react";
import "../CSS/style.css";
import { BASE_URL } from '../config';

const Navbar = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  
  // User Data
  const [formData, setFormData] = useState({ name: '', email: '', mobile_number: '' });
  const [loginMobile, setLoginMobile] = useState('');
  
  // OTP flow states
  const [otpMode, setOtpMode] = useState(false);
  const [profileMode, setProfileMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [authType, setAuthType] = useState(''); // 'register' or 'login'
  const [isLoading, setIsLoading] = useState(false);

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
      setOtp('');
      setFormData({ name: '', email: '', mobile_number: '' });
    };
    window.addEventListener('openRegisterModal', handleEvent);
    return () => window.removeEventListener('openRegisterModal', handleEvent);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setFormData({ name: '', email: '', mobile_number: '' });
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
    setOtp('');
    setFormData({ name: '', email: '', mobile_number: '' });
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setOtpMode(false);
    setProfileMode(false);
    setOtp('');
    setLoginMobile('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mobile_number) {
      alert('Please provide mobile number.');
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/bsgupadmin/register/?mobile_number=${formData.mobile_number}&role=student`, {
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
      const res = await fetch(`${BASE_URL}/bsgupadmin/login/?mobile_number=${loginMobile}`, {
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
        url = `${BASE_URL}/bsgupadmin/register/?mobile_number=${formData.mobile_number}&role=student`;
        payload = {
            mobile_number: parseInt(formData.mobile_number, 10),
            otp: parseInt(otp, 10),
            role: "student"
        };
      } else if (authType === 'login') {
        url = `${BASE_URL}/bsgupadmin/login/?mobile_number=${loginMobile}`;
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
        const data = await res.json().catch(() => ({}));
        
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
        
        if (token) {
           localStorage.setItem('token', token);
           const decoded = parseJwt(token);
           if (decoded) {
              returnedUserId = decoded.user_id || decoded.id || decoded.user;
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
        
        if (returnedUserId) {
           localStorage.setItem('userId', returnedUserId);
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
           alert("Registration successful! Please login with your mobile number to continue.");
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
        alert("Failed to save profile. Please check the inputs.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isStudentLoggedIn');
    window.dispatchEvent(new Event('authChange'));
    setFormData({ name: '', email: '', mobile_number: '' });
    setLoginMobile('');
    window.location.hash = '#';
  };

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
        </div>
      </header>

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsRegisterOpen(false)}>
          <div className="bg-white p-8 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{profileMode ? 'Complete Your Profile' : 'Register for Beginner Course'}</h3>
            {!otpMode && !profileMode && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                  {isLoading ? 'Sending OTP...' : 'Get OTP'}
                </button>
              </form>
            )}
            
            {otpMode && !profileMode && (
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
