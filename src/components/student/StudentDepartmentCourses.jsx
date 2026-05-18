import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import Loader from '../Loader';

const StudentDepartmentCourses = ({ department, title }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePaymentCourse, setActivePaymentCourse] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

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

  const handleEnroll = (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    const key = `enrolledCourses_${userId}`;
    const enrolledStr = localStorage.getItem(key) || '[]';
    const enrolled = JSON.parse(enrolledStr);
    
    if (enrolled.includes(course.id)) {
      alert("You are already enrolled in this course!");
      return;
    }
    
    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';
    if (isFree) {
      enrolled.push(course.id);
      localStorage.setItem(key, JSON.stringify(enrolled));
      alert(`Successfully enrolled in "${course.title}" for Free! You can now access it in "Enrolled Courses".`);
    } else {
      setActivePaymentCourse(course);
    }
  };

  const executePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      const userId = localStorage.getItem('userId') || 'guest';
      const key = `enrolledCourses_${userId}`;
      const enrolledStr = localStorage.getItem(key) || '[]';
      const enrolled = JSON.parse(enrolledStr);
      enrolled.push(activePaymentCourse.id);
      localStorage.setItem(key, JSON.stringify(enrolled));
      
      setIsPaying(false);
      alert(`Payment Successful! You are now enrolled in "${activePaymentCourse.title}". You can access it in the "Enrolled Courses" tab.`);
      setActivePaymentCourse(null);
    }, 1500);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">{title} Courses</h2>
        <p className="text-slate-500 mt-2">Explore specialized courses for the {title}.</p>
      </div>

      {loading ? (
        <Loader message="Loading courses..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => {
            const userId = localStorage.getItem('userId') || 'guest';
            const key = `enrolledCourses_${userId}`;
            const enrolledStr = localStorage.getItem(key) || '[]';
            const enrolled = JSON.parse(enrolledStr);
            const isEnrolled = enrolled.includes(course.id);
            const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';

            return (
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
                      {isFree ? 'Free' : `₹${course.price}`}
                    </span>
                    <span className="text-slate-500">{course.duration}</span>
                  </div>
                  <button 
                    onClick={() => handleEnroll(course)}
                    className={`w-full font-semibold py-2 rounded-lg transition-colors ${
                      isEnrolled 
                        ? 'bg-slate-100 text-slate-500 cursor-default' 
                        : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                    }`}
                  >
                     {isEnrolled ? 'Enrolled' : 'View Details & Enroll'}
                  </button>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <p className="text-slate-500 text-lg col-span-full text-center py-10">No courses available in this department yet.</p>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {activePaymentCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-100 relative">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Buy Course</h3>
            <p className="text-slate-500 mb-6">Complete your payment to unlock full access to this course.</p>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Course Title</p>
              <h4 className="text-lg font-bold text-slate-800 mb-3">{activePaymentCourse.title}</h4>
              
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-600">Total Price</span>
                <span className="font-bold text-xl text-emerald-600">₹{activePaymentCourse.price}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={executePayment}
                disabled={isPaying}
                className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPaying ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${activePaymentCourse.price} & Enroll Now`
                )}
              </button>
              <button 
                onClick={() => setActivePaymentCourse(null)}
                disabled={isPaying}
                className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDepartmentCourses;
