import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { getAdminUserId, fetchAdminDashboard } from '../../utils/adminAnalyticsUtils';

const AdminEnrolledStudents = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const adminId = getAdminUserId();
        const dashboard = await fetchAdminDashboard(adminId);
        
        // Use recent_enrollments from dashboard
        const list = dashboard.recentEnrollments || [];
        setEnrollments(list);
      } catch (err) {
        console.error('Failed to fetch enrolled students:', err);
        setError(err.message || 'Failed to load enrollment data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEnrollments = enrollments.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.course && item.course.toLowerCase().includes(term)) ||
      (item.date && item.date.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-sans">Enrolled Students</h2>
          <p className="text-slate-500 mt-2">View and track all students currently enrolled in courses.</p>
        </div>
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search by student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <p className="text-xl text-slate-500 font-medium animate-pulse">Loading enrollments...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-6 text-center font-semibold">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-sm">
                <tr>
                  <th className="py-4 px-6">Student ID / Email</th>
                  <th className="py-4 px-6">Course Enrolled</th>
                  <th className="py-4 px-6">Enrollment Date</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredEnrollments.map((enrollment, index) => (
                  <tr key={enrollment.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{enrollment.name}</div>
                      {enrollment.userId && (
                        <div className="text-xs text-slate-400">UID: {enrollment.userId}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-medium">{enrollment.course}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {enrollment.date !== '-' ? enrollment.date : 'Recent'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        {enrollment.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredEnrollments.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-slate-500">
                      No enrolled students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrolledStudents;
