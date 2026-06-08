import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', 
    priceAmount: '', priceCurrency: '₹', isFree: false,
    durationValue: '', durationUnit: 'months', 
    durationHours: '', durationMinutes: '', durationSeconds: '',
    department: 'training', user: ''
  });
  const [file, setFile] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
      const data = await res.json();
      if (data.success && data.data) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  const handleFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleOpenForm = (course = null) => {
    if (course) {
      setEditingCourse(course);
      
      let durVal = '';
      let durUnit = 'months';
      let dHours = '', dMins = '', dSecs = '';
      if (course.duration) {
         if (course.duration.includes('hr') || course.duration.includes('min') || course.duration.includes('sec')) {
            durUnit = 'time';
            const hMatch = course.duration.match(/(\d+)\s*hr/);
            const mMatch = course.duration.match(/(\d+)\s*min/);
            const sMatch = course.duration.match(/(\d+)\s*sec/);
            if (hMatch) dHours = hMatch[1];
            if (mMatch) dMins = mMatch[1];
            if (sMatch) dSecs = sMatch[1];
         } else {
            const parts = course.duration.split(' ');
            if (parts.length >= 2) {
                durVal = parts[0];
                durUnit = parts.slice(1).join(' ').toLowerCase();
            } else {
                durVal = course.duration;
            }
         }
      }

      setFormData({
        title: course.title,
        description: course.description,
        priceAmount: course.price,
        priceCurrency: '₹', // Assuming existing amounts are INR for now
        isFree: course.price == 0 || course.price == '0' || course.price == '0.00',
        durationValue: durVal,
        durationUnit: durUnit,
        durationHours: dHours,
        durationMinutes: dMins,
        durationSeconds: dSecs,
        department: course.department 
          ? course.department.toLowerCase() 
          : 'training', // standardize to backend choices
        user: course.user || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '', description: '', priceAmount: '', priceCurrency: '₹', isFree: false, durationValue: '', durationUnit: 'months', durationHours: '', durationMinutes: '', durationSeconds: '', department: 'training', user: ''
      });
    }
    setFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingCourse;
    
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('price', formData.isFree ? 0 : formData.priceAmount); // Assuming backend expects pure amount
    // If backend wanted currency, we'd do fd.append('currency', formData.priceCurrency);
    
    let finalDuration = '';
    if (formData.durationUnit === 'time') {
      const parts = [];
      if (formData.durationHours) parts.push(`${formData.durationHours} hr`);
      if (formData.durationMinutes) parts.push(`${formData.durationMinutes} min`);
      if (formData.durationSeconds) parts.push(`${formData.durationSeconds} sec`);
      finalDuration = parts.join(' ');
      if (!finalDuration) finalDuration = '0 hr'; // fallback
    } else {
      finalDuration = `${formData.durationValue} ${formData.durationUnit}`;
    }
    fd.append('duration', finalDuration);
    
    fd.append('department', formData.department);
    const userId = localStorage.getItem('adminUserId') || localStorage.getItem('userId') || formData.user || '1';
    fd.append('user_id', userId);
    
    if (isEditing) {
      fd.append('course_id', editingCourse.id);
    } else {
      fd.append('is_active', 'true');
    }
    
    if (file) {
      fd.append('course_profile_pic', file);
    }

    try {
      const url = `${BASE_URL}/bsgupadmin/createcourse/`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (data.success) {
        alert(data.success);
        setShowForm(false);
        fetchCourses();
      } else {
        alert('Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving course');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const userId = localStorage.getItem('adminUserId') || localStorage.getItem('userId') || '1';
      const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/?course_id=${id}&user_id=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.success);
        fetchCourses();
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting course');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Manage Courses</h2>
        <button onClick={() => handleOpenForm()} className="w-full sm:w-auto bg-[#7c3aed] text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-[#6d28d9] font-medium transition-colors text-center">
          + Add New Course
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-slate-200">
          <h3 className="text-xl font-bold mb-6 pb-2 border-b text-slate-700">{editingCourse ? 'Edit Course Details' : 'Create New Course'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Price</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isFree" id="isFree" checked={formData.isFree} onChange={handleChange} className="w-4 h-4 text-[#7c3aed] focus:ring-[#7c3aed] border-slate-300 rounded" />
                  <label htmlFor="isFree" className="text-sm font-medium text-slate-700">Free Course</label>
                </div>
                {!formData.isFree && (
                  <div className="flex">
                    <select name="priceCurrency" value={formData.priceCurrency} onChange={handleChange} className="border border-slate-300 border-r-0 rounded-l p-2.5 bg-slate-50 focus:ring-2 focus:ring-[#7c3aed] focus:outline-none focus:z-10">
                      <option value="₹">Rupees (₹)</option>
                      <option value="$">Dollars ($)</option>
                      <option value="€">Euros (€)</option>
                      <option value="£">Pounds (£)</option>
                    </select>
                    <input type="number" name="priceAmount" placeholder="Amount" value={formData.priceAmount} onChange={handleChange} required={!formData.isFree} className="w-full border border-slate-300 p-2.5 rounded-r focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
              <div className="flex gap-2">
                {formData.durationUnit === 'time' ? (
                  <div className="flex w-3/4 gap-1">
                     <div className="flex flex-col w-1/3">
                        <input type="number" name="durationHours" placeholder="HH" value={formData.durationHours} onChange={handleChange} min="0" className="border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
                        <span className="text-xs text-center text-slate-500 mt-1">Hours</span>
                     </div>
                     <span className="self-center font-bold">:</span>
                     <div className="flex flex-col w-1/3">
                        <input type="number" name="durationMinutes" placeholder="MM" value={formData.durationMinutes} onChange={handleChange} min="0" max="59" className="border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
                        <span className="text-xs text-center text-slate-500 mt-1">Mins</span>
                     </div>
                     <span className="self-center font-bold">:</span>
                     <div className="flex flex-col w-1/3">
                        <input type="number" name="durationSeconds" placeholder="SS" value={formData.durationSeconds} onChange={handleChange} min="0" max="59" className="border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
                        <span className="text-xs text-center text-slate-500 mt-1">Secs</span>
                     </div>
                  </div>
                ) : (
                  <input type="number" name="durationValue" placeholder="E.g. 3" value={formData.durationValue} onChange={handleChange} required min="1" className="w-[48%] border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
                )}
                <select name="durationUnit" value={formData.durationUnit} onChange={handleChange} className={`${formData.durationUnit === 'time' ? 'w-1/4' : 'w-[48%]'} self-start border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none`}>
                  <option value="time">Time</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none">
                <option value="organisation">Organization</option>
                <option value="training">Training</option>
                <option value="it">IT</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded h-24 focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Course Profile Image</label>
              <input type="file" onChange={handleFileChange} className="w-full border border-slate-300 p-2 rounded text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#7c3aed] hover:file:bg-violet-100" accept="image/*" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-800 px-6 py-2.5 rounded font-medium hover:bg-slate-300 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#7c3aed] text-white px-8 py-2.5 rounded font-medium shadow hover:bg-[#6d28d9] transition-colors">Save Course</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-10"><p className="text-xl text-slate-500 font-medium">Loading courses...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border border-slate-200 group">
              {course.course_profile_pic ? (
                <img src={`${BASE_URL}${course.course_profile_pic}`} alt={course.title} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-slate-200 flex items-center justify-center text-slate-400">No Image provided</div>
              )}
              <div className="p-5 flex-grow text-left">
                <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{course.title}</h4>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center text-sm font-semibold bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[#7c3aed]">
                    {/* Display standard Rupee symbol format for display regardless of currency option missing from backend string */}
                    {course.price == 0 || course.price == '0' || course.price == '0.00' ? 'Free' : `₹${course.price}`}
                  </span>
                  <span className="text-slate-500">{course.duration}</span>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-between bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenForm(course)} className="text-[#7c3aed] font-semibold hover:underline">Edit</button>
                <button onClick={() => handleDelete(course.id)} className="text-rose-500 font-semibold hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p className="text-slate-500 text-lg col-span-full text-center py-10">No courses available.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
