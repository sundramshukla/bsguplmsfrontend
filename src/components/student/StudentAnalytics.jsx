import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const StudentAnalytics = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    certificatesEarned: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const userId = localStorage.getItem('userId') || 'guest';
      
      // 1. Get lists from local storage
      const enrolledKey = `enrolledCourses_${userId}`;
      const enrolledList = JSON.parse(localStorage.getItem(enrolledKey) || '[]');
      
      const completedKey = `completedCourses_${userId}`;
      const completedList = JSON.parse(localStorage.getItem(completedKey) || '[]');
      
      const certKey = `earnedCertificates_${userId}`;
      const certList = JSON.parse(localStorage.getItem(certKey) || '[]');

      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        
        if (data.success && data.data) {
          const activeCourseIds = data.data.map(c => c.id.toString());
          
          const validEnrolled = enrolledList.filter(id => activeCourseIds.includes(id.toString()));
          const validCompleted = completedList.filter(id => activeCourseIds.includes(id.toString()));
          const validCerts = certList.filter(id => activeCourseIds.includes(id.toString()));
          
          // Cleanup deleted courses from local storage
          localStorage.setItem(enrolledKey, JSON.stringify(validEnrolled));
          localStorage.setItem(completedKey, JSON.stringify(validCompleted));
          localStorage.setItem(certKey, JSON.stringify(validCerts));

          setStats({
            coursesEnrolled: validEnrolled.length,
            coursesCompleted: validCompleted.length,
            certificatesEarned: validCerts.length
          });
          return;
        }
      } catch (err) {
        console.error("Failed to fetch courses for analytics:", err);
      }

      // Fallback
      setStats({
        coursesEnrolled: enrolledList.length,
        coursesCompleted: completedList.length,
        certificatesEarned: certList.length
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">My Analytics</h2>
        <p className="text-slate-500 mt-2">Track your learning progress and achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => onNavigate && onNavigate('enrolled')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50/5 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📚
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">Enrolled Courses</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.coursesEnrolled}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
            ✅
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed Courses</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.coursesCompleted}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Certificates Earned</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.certificatesEarned}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Learning Activity</h3>
        <div className="h-64 flex items-end space-x-2 w-full mt-4">
           {/* Mock Bar Chart */}
           {[30, 50, 45, 70, 90, 60, 40].map((height, i) => (
             <div key={i} className="flex-1 flex flex-col items-center group">
               <div className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-600 relative" style={{height: `${height}%`}}>
                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{height}%</span>
               </div>
               <span className="text-xs text-slate-500 mt-2">Day {i+1}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
