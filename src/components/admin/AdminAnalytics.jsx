import React, { useState, useEffect } from 'react';
import {
  getAdminUserId,
  fetchAdminDashboard,
  fetchAdminEnrollmentRecords,
  fetchAdminCourses,
  buildDepartmentStats,
  sortRecentEnrollments,
  formatCompletionRate,
  formatRevenue
} from '../../utils/adminAnalyticsUtils';

const AdminAnalytics = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coursesCount, setCoursesCount] = useState(0);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState(0);
  const [registeredStudentsCount, setRegisteredStudentsCount] = useState(0);
  const [completionRate, setCompletionRate] = useState('0%');
  const [totalRevenue, setTotalRevenue] = useState('₹ 0.00');
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([
    { name: 'Training', value: 0, color: 'bg-blue-500' },
    { name: 'Organization', value: 0, color: 'bg-purple-500' },
    { name: 'IT', value: 0, color: 'bg-emerald-500' }
  ]);

  useEffect(() => {
    const fetchRealAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const adminUserId = getAdminUserId();
        if (!adminUserId) {
          throw new Error('Admin session not found. Please log in again.');
        }

        const [dashboard, courses, enrollmentRecords] = await Promise.all([
          fetchAdminDashboard(adminUserId),
          fetchAdminCourses(),
          fetchAdminEnrollmentRecords(adminUserId)
        ]);

        setRegisteredStudentsCount(dashboard.registeredStudents);
        setEnrolledStudentsCount(dashboard.enrolledStudents);
        setCoursesCount(dashboard.totalCourses);
        setLessonsCount(dashboard.totalLessons);
        setCompletionRate(formatCompletionRate(dashboard.completionRate));
        setTotalRevenue(formatRevenue(dashboard.totalRevenue));

        const recent =
          dashboard.recentEnrollments.length > 0
            ? dashboard.recentEnrollments
            : sortRecentEnrollments(enrollmentRecords);

        setRecentEnrollments(recent.slice(0, 5));

        if (dashboard.departmentEnrollments) {
          setDepartmentStats([
            {
              name: 'Training',
              value: dashboard.departmentEnrollments.training ?? dashboard.departmentEnrollments.Training ?? 0,
              color: 'bg-blue-500'
            },
            {
              name: 'Organization',
              value:
                dashboard.departmentEnrollments.organisation ??
                dashboard.departmentEnrollments.organization ??
                dashboard.departmentEnrollments.Organization ??
                0,
              color: 'bg-purple-500'
            },
            {
              name: 'IT',
              value: dashboard.departmentEnrollments.it ?? dashboard.departmentEnrollments.IT ?? 0,
              color: 'bg-emerald-500'
            }
          ]);
        } else {
          setDepartmentStats(buildDepartmentStats(enrollmentRecords, courses));
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
        setError(err.message || 'Failed to load analytics from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRealAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <p className="text-xl text-slate-500 font-medium animate-pulse">Loading analytics from server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-6 text-center font-semibold">
          {error}
        </div>
      </div>
    );
  }

  const totalDepartmentEnrollments = departmentStats.reduce((sum, dept) => sum + dept.value, 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h2>
        <p className="text-slate-500 mt-2">Overview of student registrations, enrollments, and platform activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-left">
        <div 
          onClick={() => onNavigate && onNavigate('registered_students')}
          className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Registered Students</p>
            <h3 className="text-2xl font-bold text-slate-800">{registeredStudentsCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('enrolled_students')}
          className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
            🎓
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Enrolled Students</p>
            <h3 className="text-2xl font-bold text-slate-800">{enrolledStudentsCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('courses')}
          className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center text-2xl">
            📚
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Courses</p>
            <h3 className="text-2xl font-bold text-slate-800">{coursesCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('lessons')}
          className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl">
            🎥
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Lessons</p>
            <h3 className="text-2xl font-bold text-slate-800">{lessonsCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('enrolled_students')}
          className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center text-2xl">
            📈
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completion Rate</p>
            <h3 className="text-2xl font-bold text-slate-800">{completionRate}</h3>
          </div>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('payment_history')}
          className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
            💰
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalRevenue}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1 text-left">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Enrollments by Department</h3>
          <div className="space-y-6">
            {departmentStats.map((dept) => (
              <div key={dept.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">{dept.name}</span>
                  <span className="text-sm font-bold text-slate-900">{dept.value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${dept.color}`}
                    style={{
                      width:
                        totalDepartmentEnrollments > 0
                          ? `${(dept.value / totalDepartmentEnrollments) * 100}%`
                          : '0%'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 col-span-1 lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-slate-100 text-left">
            <h3 className="text-xl font-bold text-slate-800">Recent Enrollments</h3>
          </div>
          {recentEnrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm font-semibold">
                  <tr>
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Course Name</th>
                    <th className="py-4 px-6">Enrollment Date</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800">{enrollment.name}</td>
                      <td className="py-4 px-6 text-slate-600">{enrollment.course}</td>
                      <td className="py-4 px-6 text-slate-600">{enrollment.date}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          {enrollment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 font-medium">
              No recent enrollments to show.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
