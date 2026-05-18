import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const AdminLessons = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', youtube_url: '', order: 1, sub_lessons: []
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        if (data.success && data.data) {
          setCourses(data.data);
          if (data.data.length > 0) {
            setSelectedCourseId(data.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchLessons();
    }
  }, [selectedCourseId]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-lesson/?course_id=${selectedCourseId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setLessons(data.data);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error('Error fetching lessons', err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        description: lesson.description,
        youtube_url: lesson.youtube_url,
        order: lesson.order,
        sub_lessons: lesson.sub_lessons || []
      });
    } else {
      setEditingLesson(null);
      setFormData({ title: '', description: '', youtube_url: '', order: lessons.length + 1, sub_lessons: [] });
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubLessonChange = (index, field, value) => {
    const newSubLessons = [...formData.sub_lessons];
    newSubLessons[index][field] = value;
    setFormData({ ...formData, sub_lessons: newSubLessons });
  };

  const addSubLesson = () => {
    setFormData({
      ...formData,
      sub_lessons: [...formData.sub_lessons, { title: '', youtube_url: '', description: '' }]
    });
  };

  const removeSubLesson = (index) => {
    const newSubLessons = formData.sub_lessons.filter((_, i) => i !== index);
    setFormData({ ...formData, sub_lessons: newSubLessons });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingLesson;
    
    const payload = {
      course: parseInt(selectedCourseId, 10),
      title: formData.title,
      description: formData.description,
      youtube_url: formData.youtube_url,
      order: parseInt(formData.order, 10),
      sub_lessons: formData.sub_lessons
    };
    
    if (isEditing) {
      payload.id = editingLesson.id;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-lesson/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.success);
        setShowForm(false);
        fetchLessons();
      } else {
        alert('Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving lesson');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-lesson/?lesson_id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.success);
        fetchLessons();
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting lesson');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <h2 className="text-xl font-bold text-slate-800 shrink-0">Target Course</h2>
          <select 
            value={selectedCourseId} 
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border-2 border-slate-200 rounded-lg p-2.5 w-full sm:min-w-[250px] font-medium text-slate-700 focus:border-[#7c3aed] focus:outline-none"
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <button onClick={() => handleOpenForm()} disabled={!selectedCourseId} className="w-full sm:w-auto bg-[#7c3aed] text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-[#6d28d9] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center">
          + Add Lesson
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-slate-200">
          <h3 className="text-xl font-bold mb-6 pb-2 border-b text-slate-700">{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Lesson Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Order Index (e.g. 1, 2, 3)</label>
              <input type="number" name="order" value={formData.order} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">YouTube URL</label>
              <input type="url" name="youtube_url" value={formData.youtube_url} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded h-24 focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"></textarea>
            </div>
            
            <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-slate-700">Sub Lessons</h4>
                <button type="button" onClick={addSubLesson} className="bg-slate-100 text-[#7c3aed] px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors border border-slate-200">
                  + Add Sub Lesson
                </button>
              </div>
              {formData.sub_lessons.map((sl, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 relative">
                  <button type="button" onClick={() => removeSubLesson(idx)} className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold bg-rose-100 w-8 h-8 rounded-full flex items-center justify-center">×</button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sub Lesson Title</label>
                      <input type="text" value={sl.title} onChange={(e) => handleSubLessonChange(idx, 'title', e.target.value)} required className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube URL</label>
                      <input type="url" value={sl.youtube_url} onChange={(e) => handleSubLessonChange(idx, 'youtube_url', e.target.value)} required className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                      <textarea value={sl.description} onChange={(e) => handleSubLessonChange(idx, 'description', e.target.value)} className="w-full border border-slate-300 p-2 rounded h-16 focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"></textarea>
                    </div>
                  </div>
                </div>
              ))}
              {formData.sub_lessons.length === 0 && (
                <p className="text-sm text-slate-500 italic">No sub lessons added yet.</p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-800 px-6 py-2.5 rounded font-medium hover:bg-slate-300 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#7c3aed] text-white px-8 py-2.5 rounded font-medium shadow hover:bg-[#6d28d9] transition-colors">{editingLesson ? 'Update Lesson' : 'Save Lesson'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-10"><p className="text-xl text-slate-500 font-medium">Loading lessons...</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left min-w-[600px] md:min-w-0">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-700 w-20">Order</th>
                <th className="p-4 font-bold text-slate-700">Title</th>
                <th className="p-4 font-bold text-slate-700 hidden md:table-cell">YouTube Link</th>
                <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map(lesson => (
                <tr key={lesson.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-500">{lesson.order}</td>
                  <td className="p-4 font-bold text-slate-800">{lesson.title}</td>
                  <td className="p-4 hidden md:table-cell text-sm truncate max-w-[200px] lg:max-w-md">
                    <a href={lesson.youtube_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 font-medium hover:underline">{lesson.youtube_url}</a>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <button onClick={() => handleOpenForm(lesson)} className="text-[#7c3aed] font-semibold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(lesson.id)} className="text-rose-500 font-semibold hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {lessons.length === 0 && (
                <tr>
                   <td colSpan="4" className="p-10 text-center text-slate-500 text-lg">No lessons found for this course.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;
