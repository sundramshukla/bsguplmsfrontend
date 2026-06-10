import React, { useState } from 'react';
import { BASE_URL } from '../../config';

const parseJwt = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
};

const AdminLogin = ({ onLoginSuccess }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (mobileNumber !== '9935266755') {
      alert("Access Denied: You are not authorized to access the admin panel.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/bsgupadmin/login/?mobile_number=${mobileNumber}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Development Info: The OTP is ${data.otp}`);
        setOtpMode(true);
      } else {
        alert("Failed to send OTP.");
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
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/bsgupadmin/login/?mobile_number=${mobileNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mobile_number: parseInt(mobileNumber, 10),
            otp: parseInt(otp, 10)
        })
      });

      if (res.ok) {
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

        

        const token = extractToken(data);
        let returnedUserId = null;
        
        if (token) {
           localStorage.setItem('adminToken', token);
           const decoded = parseJwt(token);
           if (decoded) {
              returnedUserId = decoded.user_id || decoded.id || decoded.user;
           }
        }

        if (!returnedUserId && data) {
            returnedUserId = data.user_id || data.id || data.user || data.userId;
            if (!returnedUserId && data.data) {
               returnedUserId = data.data.user_id || data.data.id || data.data.user;
            }
        }
        
        if (returnedUserId) {
           localStorage.setItem('adminUserId', returnedUserId.toString());
           localStorage.setItem('userId', returnedUserId.toString());
        }

        onLoginSuccess();
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 w-full">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-lg border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Admin Access</h2>
        {!otpMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="w-full mt-4 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <span>🔙</span> Back to Website
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
