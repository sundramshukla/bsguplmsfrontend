import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const StudentEnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we fetch all courses and pick a few randomly to simulate enrolled courses.
    // In a real app, there would be an endpoint like /student/enrolled-courses
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        if (data.success && data.data) {
          // just slice first 2 for dummy
          setCourses(data.data.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">My Enrolled Courses</h2>
          <p className="text-slate-500 mt-2">Continue learning from where you left off.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><p className="text-xl text-slate-500 font-medium">Loading your courses...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border border-slate-200">
              {course.course_profile_pic ? (
                <img src={`${BASE_URL}${course.course_profile_pic}`} alt={course.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">No Image provided</div>
              )}
              <div className="p-5 flex-grow flex flex-col">
                <h4 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{course.title}</h4>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="mt-auto">
                   <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                     <div className="bg-emerald-500 h-2 rounded-full" style={{width: '45%'}}></div>
                   </div>
                   <p className="text-xs text-slate-500 text-right mb-4">45% Completed</p>
                   <button className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition-colors">
                     Continue Learning
                   </button>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full bg-white p-10 rounded-2xl border border-slate-200 text-center">
              <div className="text-5xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You haven't enrolled in any courses yet!</h3>
              <p className="text-slate-500 mb-6">Explore our catalog and find the perfect course for you.</p>
              <button className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">Browse Courses</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentEnrolledCourses;
