import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const StudentDepartmentCourses = ({ department, title }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        if (data.success && data.data) {
          const filteredCourses = data.data.filter(course => 
             course.department && course.department.toLowerCase() === department.toLowerCase()
          );
          setCourses(filteredCourses);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [department]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">{title} Courses</h2>
        <p className="text-slate-500 mt-2">Explore specialized courses for the {title}.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><p className="text-xl text-slate-500 font-medium">Loading courses...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border border-slate-200">
              {course.course_profile_pic ? (
                <img src={`${BASE_URL}${course.course_profile_pic}`} alt={course.title} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
              )}
              <div className="p-5 flex-grow text-left">
                <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{course.title}</h4>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center text-sm font-semibold bg-slate-50 p-2 rounded border border-slate-100 mb-4">
                  <span className="text-emerald-500">
                    {course.price == 0 || course.price == '0' || course.price == '0.00' ? 'Free' : `₹${course.price}`}
                  </span>
                  <span className="text-slate-500">{course.duration}</span>
                </div>
                <button className="w-full bg-slate-100 text-slate-700 font-semibold py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors">
                   View Details
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-slate-500 text-lg col-span-full text-center py-10">No courses available in this department yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDepartmentCourses;
