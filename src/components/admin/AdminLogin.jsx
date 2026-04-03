import React, { useState } from 'react';

const AdminLogin = ({ onLoginSuccess }) => {
  const [mobileNumber, setMobileNumber] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (mobileNumber) {
      // Temporarily bypassing the API as requested to allow full UI testing directly
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 w-full">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-lg border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Admin Access</h2>
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
            className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors"
          >
            Login Directly (Test Mode)
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
