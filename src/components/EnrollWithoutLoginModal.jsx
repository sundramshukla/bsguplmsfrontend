import React, { useState } from 'react';
import { BASE_URL } from '../config';
import { processCourseEnrollment, navigateToPaymentResult } from '../utils/paymentUtils';

const EnrollWithoutLoginModal = ({ isOpen, onClose, courseId }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobile: '',
    full_name: '',
    email: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData, course_id: courseId };
      const res = await fetch(`${BASE_URL}/user/enrollwithoutlogin/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        alert(`Development Info: OTP is ${data.otp || 'sent to mobile'}`);
        setStep(2);
      } else {
        alert('Failed to submit details. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        mobile: formData.mobile.toString(),
        course_id: parseInt(courseId, 10),
        otp: otp.toString()
      };
      const res = await fetch(`${BASE_URL}/user/enrollwithoutlogin/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        alert('Successfully enrolled!');
        
        const userId = data.user_id || data.id || localStorage.getItem('userId') || '3';
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', 'student');
        localStorage.setItem('userId', userId.toString());
        if (data.token || data.jwt || data.access) {
          localStorage.setItem('token', data.token || data.jwt || data.access);
        }

        window.dispatchEvent(new Event('authChange'));
        onClose();
        setStep(1);

        try {
          const result = await processCourseEnrollment({
            userId: userId.toString(),
            courseId,
            courseTitle: formData.full_name ? `Course #${courseId}` : `Course #${courseId}`,
            coursePrice: 0
          });
          navigateToPaymentResult('success', {
            message: result.message,
            courseId
          });
        } catch (enrollErr) {
          console.error(enrollErr);
          navigateToPaymentResult('failed', {
            message: enrollErr.message || 'Enrollment failed',
            courseId
          });
        }
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Enroll in Course</h3>
        
        {step === 1 && (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleFormChange} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full mt-4 bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70">
              {isLoading ? 'Submitting...' : 'Proceed to Enroll'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP sent to {formData.mobile}</label>
              <input type="number" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full mt-4 bg-[#7c3aed] text-white py-3 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-70">
              {isLoading ? 'Verifying...' : 'Verify OTP & Enroll'}
            </button>
          </form>
        )}
        
        <button onClick={handleClose} className="mt-4 w-full text-slate-500 hover:text-slate-700 text-sm py-2">Cancel</button>
      </div>
    </div>
  );
};

export default EnrollWithoutLoginModal;
