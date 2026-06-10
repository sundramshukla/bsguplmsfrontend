import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import Loader from '../Loader';

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

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const getUserId = () => {
    let uId = localStorage.getItem('userId');
    if (!uId || uId === 'undefined' || uId === 'null' || isNaN(parseInt(uId, 10))) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          
          const decoded = parseJwt(token);
          const findUserId = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            const directKeys = ['user_id', 'userId', 'id', 'pk', 'uid', 'student_id', 'studentId'];
            for (const key of directKeys) {
              if (obj[key] !== undefined && obj[key] !== null) {
                const val = parseInt(obj[key], 10);
                if (!isNaN(val)) return val;
              }
            }
            if (obj.user && typeof obj.user === 'object') return findUserId(obj.user);
            if (obj.student && typeof obj.student === 'object') return findUserId(obj.student);
            if (obj.data && typeof obj.data === 'object') return findUserId(obj.data);
            if (obj.user_details && typeof obj.user_details === 'object') return findUserId(obj.user_details);
            if (obj.user !== undefined && obj.user !== null) {
              const val = parseInt(obj.user, 10);
              if (!isNaN(val)) return val;
            }
            return null;
          };
          const extractedId = findUserId(decoded);
          if (extractedId) {
            uId = extractedId.toString();
            localStorage.setItem('userId', uId);
          }
        } catch (e) {
          console.error("Failed to decode token for userId backup:", e);
        }
      }
    }
    return uId && uId !== 'undefined' && uId !== 'null' ? parseInt(uId, 10) : 1;
  };

  const userId = getUserId();

  const [formData, setFormData] = useState({
    full_name: '', email: '', date_of_birth: '', gender: '',
    address: '', city: '', state: '', pincode: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/profile/?user_id=${userId}`);
      const data = await res.json();
      let profileData = null;
      if (Array.isArray(data) && data.length > 0) {
        profileData = data[0];
      } else if (data && data.id) {
        profileData = data;
      } else if (data && data.data) {
        profileData = data.data;
      }

      if (profileData && profileData.id) {
        localStorage.setItem('profileId', profileData.id.toString());
        localStorage.setItem('studentEmail', profileData.email || '');
        localStorage.setItem('studentName', profileData.full_name || '');
        setProfile(profileData);
        setFile(null);
        setFormData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          date_of_birth: profileData.date_of_birth || '',
          gender: profileData.gender || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          pincode: profileData.pincode || ''
        });
        setIsEditing(false);
      } else {
        setProfile(null);
        setFile(null);
        // Try to pre-fill email from localStorage or token
        let emailVal = localStorage.getItem('studentEmail') || '';
        if (!emailVal) {
          const token = localStorage.getItem('token');
          if (token) {
            const decoded = parseJwt(token);
            if (decoded && decoded.email) {
              emailVal = decoded.email;
              localStorage.setItem('studentEmail', emailVal);
            }
          }
        }
        setFormData(prev => ({
          ...prev,
          email: prev.email || emailVal
        }));
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const isUpdating = profile !== null;

    const fd = new FormData();
    fd.append('user', parseInt(userId, 10));
    fd.append('full_name', formData.full_name);
    fd.append('email', formData.email);
    fd.append('date_of_birth', formData.date_of_birth);
    fd.append('gender', formData.gender);
    fd.append('address', formData.address);
    fd.append('city', formData.city);
    fd.append('state', formData.state);
    fd.append('pincode', formData.pincode);
    if (file) {
      fd.append('profile_image', file);
    }

    try {
      const method = isUpdating ? 'PUT' : 'POST';
      const res = await fetch(`${BASE_URL}/bsgupadmin/profile/`, {
        method,
        body: fd
      });

      if (res.ok) {
        alert(isUpdating ? "Profile updated successfully" : "Profile created successfully");
        setFile(null);
        fetchProfile();
      } else {
        alert("Action failed. Please check inputs.");
      }
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading Profile..." fullPage={true} />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>
        {profile && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-emerald-600 font-medium transition-colors">
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>

            <div className="md:col-span-2 flex items-center gap-4 border-t border-slate-100 pt-4 mt-2">
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500 shadow-md" />
              ) : profile && profile.profile_image ? (
                <img src={`${BASE_URL}${profile.profile_image}`} alt="Current" className="h-16 w-16 rounded-full object-cover border border-slate-300 shadow-sm" />
              ) : (
                <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold text-xs border border-dashed border-slate-300">No Photo</div>
              )}
              <div className="flex-grow">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Photo</label>
                <input type="file" onChange={handleFileChange} className="w-full border border-slate-300 p-2 rounded text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" accept="image/*" />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              {profile && (
                <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-800 px-6 py-2.5 rounded font-medium hover:bg-slate-300 transition-colors">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={saving} className="bg-emerald-500 text-white px-8 py-2.5 rounded font-medium shadow hover:bg-emerald-600 transition-colors disabled:opacity-70">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-6">
            {profile.profile_image ? (
              <img src={`${BASE_URL}${profile.profile_image}`} alt={profile.full_name} className="h-24 w-24 rounded-full object-cover shadow-md border-2 border-emerald-500" />
            ) : (
              <div className="h-24 w-24 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-inner">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{profile.full_name}</h3>
              <p className="text-slate-500 font-medium">{profile.email}</p>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-sm text-slate-500 font-semibold mb-1">Date of Birth</p>
              <p className="text-lg text-slate-800 font-medium">{profile.date_of_birth}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-semibold mb-1">Gender</p>
              <p className="text-lg text-slate-800 font-medium capitalize">{profile.gender}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-500 font-semibold mb-1">Address</p>
              <p className="text-lg text-slate-800 font-medium">{profile.address}, {profile.city}, {profile.state} - {profile.pincode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
