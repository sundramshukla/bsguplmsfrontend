import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { getAdminUserId } from '../../utils/quizUtils';

const DEPARTMENTS_MAP = {
  youth_programme: 'Youth Programme',
  adult_programme: 'Adult Programme',
  tech_skill: 'Tech Skill',
  training: 'Youth Programme',
  organisation: 'Adult Programme',
  organization: 'Adult Programme',
  it: 'Tech Skill'
};

const normalizeDepartmentKey = (dept) => {
  if (!dept) return 'youth_programme';
  const lower = dept.toLowerCase().trim();
  if (['youth_programme', 'adult_programme', 'tech_skill'].includes(lower)) {
    return lower;
  }
  if (lower === 'training') return 'youth_programme';
  if (lower === 'organisation' || lower === 'organization') return 'adult_programme';
  if (lower === 'it') return 'tech_skill';
  return 'youth_programme';
};

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
    department: 'youth_programme', user: ''
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
    if (e.target.files && e.target.files.length > 0) {
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
        priceCurrency: '₹',
        isFree: course.price == 0 || course.price == '0' || course.price == '0.00',
        durationValue: durVal,
        durationUnit: durUnit,
        durationHours: dHours,
        durationMinutes: dMins,
        durationSeconds: dSecs,
        department: normalizeDepartmentKey(course.department),
        user: course.user || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '', description: '', priceAmount: '', priceCurrency: '₹', isFree: false, durationValue: '', durationUnit: 'months', durationHours: '', durationMinutes: '', durationSeconds: '', department: 'youth_programme', user: ''
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
    fd.append('price', formData.isFree ? 0 : formData.priceAmount);

    let finalDuration = '';
    if (formData.durationUnit === 'time') {
      const parts = [];
      if (formData.durationHours) parts.push(`${formData.durationHours} hr`);
      if (formData.durationMinutes) parts.push(`${formData.durationMinutes} min`);
      if (formData.durationSeconds) parts.push(`${formData.durationSeconds} sec`);
      finalDuration = parts.join(' ');
      if (!finalDuration) finalDuration = '0 hr';
    } else {
      finalDuration = `${formData.durationValue} ${formData.durationUnit}`;
    }
    fd.append('duration', finalDuration);

    fd.append('department', formData.department);
    const userId = getAdminUserId();

    if (isEditing) {
      fd.append('user_id', userId);
      fd.append('course_id', editingCourse.id);
    } else {
      fd.append('user', userId);
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
        alert(data.error || 'Failed to save course.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const adminUserId = getAdminUserId();
      const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/?course_id=${id}&user_id=${adminUserId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.success);
        fetchCourses();
      } else {
        alert(data.error || 'Failed to delete course.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  return (
    <div className="p-6 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Manage Courses</h2>
          <p className="text-sm text-slate-500 mt-1">Add, update, or remove courses and assign them to departments.</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-[#6d28d9] transition-colors"
        >
          + Add Course
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl text-left">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="priceAmount"
                  value={formData.isFree ? '0' : formData.priceAmount}
                  onChange={handleChange}
                  disabled={formData.isFree}
                  required={!formData.isFree}
                  placeholder="e.g. 499"
                  className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none disabled:bg-slate-100"
                />
              </div>
              <div className="mt-1">
                <label className="inline-flex items-center text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-[#7c3aed] focus:ring-[#7c3aed] mr-2"
                  />
                  Mark as Free Course
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
              <div className="flex gap-2">
                {formData.durationUnit === 'time' ? (
                  <div className="flex gap-1 w-full">
                    <input
                      type="number"
                      name="durationHours"
                      value={formData.durationHours}
                      onChange={handleChange}
                      placeholder="Hrs"
                      className="w-1/3 border border-slate-300 p-2 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                    <input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      placeholder="Mins"
                      className="w-1/3 border border-slate-300 p-2 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                    <input
                      type="number"
                      name="durationSeconds"
                      value={formData.durationSeconds}
                      onChange={handleChange}
                      placeholder="Secs"
                      className="w-1/3 border border-slate-300 p-2 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                  </div>
                ) : (
                  <input
                    type="number"
                    name="durationValue"
                    value={formData.durationValue}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 3"
                    className="w-1/2 border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                  />
                )}
                <select
                  name="durationUnit"
                  value={formData.durationUnit}
                  onChange={handleChange}
                  className="w-1/2 border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                >
                  <option value="time">Time (Hr/Min/Sec)</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none font-medium text-slate-700"
              >
                <option value="youth_programme">Youth Programme</option>
                <option value="adult_programme">Adult Programme</option>
                <option value="tech_skill">Tech Skill</option>
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
                <div className="mb-2">
                  <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {DEPARTMENTS_MAP[course.department] || 'Youth Programme'}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{course.title}</h4>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center text-sm font-semibold bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[#7c3aed]">
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
