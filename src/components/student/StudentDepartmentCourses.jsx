import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { getEnrolledCourseIds } from '../../utils/enrollmentUtils';
import {
  processCourseEnrollment,
  navigateToPaymentResult,
  appendLocalPaymentHistory
} from '../../utils/paymentUtils';
import Loader from '../Loader';

const StudentDepartmentCourses = ({ department, title }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [activePaymentCourse, setActivePaymentCourse] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const userId = localStorage.getItem('userId') || 'guest';

  const refreshEnrollments = async () => {
    if (!userId || userId === 'guest') {
      setEnrolledCourseIds([]);
      return;
    }
    const ids = await getEnrolledCourseIds(userId);
    setEnrolledCourseIds(ids);
  };

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
    refreshEnrollments();
  }, [department]);

  useEffect(() => {
    const handleEnrollmentChange = () => refreshEnrollments();
    window.addEventListener('enrollmentChange', handleEnrollmentChange);
    return () => window.removeEventListener('enrollmentChange', handleEnrollmentChange);
  }, [userId]);

  const runEnrollment = async (course) => {
    console.log('=== runEnrollment START ===');
    console.log('runEnrollment called with course:', {
      course,
      course_id: course?.id,
      course_course_id: course?.course?.id,
      course_full: JSON.stringify(course)
    });

    setIsPaying(true);
    const finalCourseId = course.id;
    
    console.log('Course ID resolution:', {
      finalCourseId,
    });
    
    try {
      console.log('Calling processCourseEnrollment with courseId:', finalCourseId, 'userId:', userId);
      if (!finalCourseId) throw new Error('finalCourseId is null or undefined');
      if (!userId) throw new Error('userId is null or undefined');
      
      const result = await processCourseEnrollment({
        userId,
        courseId: finalCourseId,
        courseTitle: course.title,
        coursePrice: course.price
      });

      if (result.status === 'already_enrolled') {
        alert(result.message || 'You are already enrolled in this course!');
        await refreshEnrollments();
        return;
      }

      if (result.type === 'paid') {
        appendLocalPaymentHistory(userId, {
          courseTitle: course.title,
          amount: result.amount,
          status: 'Paid'
        });
      }

      await refreshEnrollments();
      console.log('=== runEnrollment SUCCESS with courseId:', finalCourseId, '===');
      navigateToPaymentResult('success', {
        message: result.message,
        courseTitle: course.title,
        amount: result.amount,
        orderId: result.orderId
      });
    } catch (err) {
      console.error('=== runEnrollment FAILED with courseId:', finalCourseId, 'error:', err, '===');
      const errMsg = `Payment error: ${err.message || 'Unknown error'}`;
      console.error(errMsg);
      // eslint-disable-next-line no-alert
      alert(errMsg);
      navigateToPaymentResult('failed', {
        message: err.message || 'Payment failed. Please try again.',
        courseTitle: course.title,
        amount: course.price
      });
    } finally {
      setIsPaying(false);
      setActivePaymentCourse(null);
    }
  };

  const handleEnroll = async (course) => {
    if (!userId || userId === 'guest') {
      alert('Please log in to enroll in this course.');
      return;
    }

    if (enrolledCourseIds.some((id) => id.toString() === course.id.toString())) {
      alert('You are already enrolled in this course!');
      return;
    }

    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';
    if (isFree) {
      await runEnrollment(course);
    } else {
      setActivePaymentCourse(course);
    }
  };

  const executePayment = async () => {
    if (!activePaymentCourse) return;
    console.log('ExecutePayment clicked for:', activePaymentCourse.id || activePaymentCourse.course?.id);
    try {
      // small visible feedback to ensure the click was registered
      // eslint-disable-next-line no-alert
      console.debug('Starting payment flow...');
      await runEnrollment(activePaymentCourse);
    } catch (err) {
      console.error('executePayment error:', err);
      // eslint-disable-next-line no-alert
      alert('Payment flow error: ' + (err.message || 'See console'));
      throw err;
    }
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
            console.log('StudentDepartmentCourses rendering course:', {
              course_id: course.id,
              course_title: course.title,
              course_full: JSON.stringify(course)
            });
            const isEnrolled = enrolledCourseIds.some((id) => id.toString() === course.id.toString());
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
            <p className="text-slate-500 mb-6">You will be redirected to Razorpay to complete your secure payment.</p>
            
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
                  `Pay ₹${activePaymentCourse.price} with Razorpay`
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
