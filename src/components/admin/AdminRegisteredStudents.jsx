import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { getAdminUserId, fetchAdminDashboard, fetchStudentActiveStatus, toggleStudentActiveStatus, formatDateDDMMYYYY } from '../../utils/adminAnalyticsUtils';

const AdminRegisteredStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [statusLoading, setStatusLoading] = useState({});
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

        // We scan UIDs 1 to 200 to find all active profiles.
        const scanIds = Array.from({ length: 200 }, (_, i) => i + 1);
        const results = await Promise.all(
          scanIds.map(async (id) => {
            try {
              const res = await fetch(`${BASE_URL}/bsgupadmin/profile/?user_id=${id}`);
              if (!res.ok) return null;
              const data = await res.json();
              
              let profileObj = null;
              if (data && data.data && data.data.id) {
                profileObj = data.data;
              } else if (data && data.id) {
                profileObj = data;
              }
              return profileObj;
            } catch (e) {
              return null;
            }
          })
        );

        const activeProfiles = results.filter(Boolean);
        // Sort by ID descending (newest first)
        activeProfiles.sort((a, b) => b.id - a.id);
        setStudents(activeProfiles);

        // Fetch statuses in parallel for listed profiles
        const profileUserIds = activeProfiles.map(p => p.user).filter(Boolean);
        const statusMap = {};
        await Promise.all(
          profileUserIds.map(async (uid) => {
            const status = await fetchStudentActiveStatus(uid);
            statusMap[uid] = status;
          })
        );
        setStudentStatuses(statusMap);
      } catch (err) {
        console.error('Failed to fetch registered students:', err);
        setError('Failed to load registered student profiles.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleStatus = async (studentId) => {
    if (statusLoading[studentId]) return;
    
    setStatusLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await toggleStudentActiveStatus(studentId);
      if (res.success) {
        setStudentStatuses(prev => ({ ...prev, [studentId]: res.is_active }));
      } else {
        alert('Failed to update student status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating student status.');
    } finally {
      setStatusLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const filteredStudents = students.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.full_name && item.full_name.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term)) ||
      (item.city && item.city.toLowerCase().includes(term)) ||
      (item.state && item.state.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-sans">Registered Students</h2>
          <p className="text-slate-500 mt-2">View and track all registered student profiles on the platform.</p>
        </div>
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <p className="text-xl text-slate-500 font-medium animate-pulse">Loading registered students...</p>
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
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Date of Birth</th>
                  <th className="py-4 px-6">Gender</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6">Registered Date</th>
                  <th className="py-4 px-6 text-center">Status / Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      {student.profile_image ? (
                        <img 
                          src={`${BASE_URL}${student.profile_image}`} 
                          alt={student.full_name} 
                          className="h-10 w-10 object-cover rounded-full border border-slate-250 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-[#7c3aed] text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-800">{student.full_name}</div>
                        <div className="text-xs text-slate-400">UID: {student.user}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{student.email}</td>
                    <td className="py-4 px-6 text-slate-600">{student.date_of_birth ? formatDateDDMMYYYY(student.date_of_birth) : '-'}</td>
                    <td className="py-4 px-6 text-slate-600 capitalize">{student.gender || '-'}</td>
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                      {student.address ? `${student.address}, ${student.city}, ${student.state} - ${student.pincode}` : '-'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {student.created_at ? formatDateDDMMYYYY(student.created_at) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          studentStatuses[student.user] !== false
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {studentStatuses[student.user] !== false ? 'Active' : 'Inactive'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={studentStatuses[student.user] !== false}
                            disabled={statusLoading[student.user]}
                            onChange={() => handleToggleStatus(student.user)}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-500">
                      No registered students found.
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

export default AdminRegisteredStudents;
