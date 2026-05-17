import React, { useState } from 'react';
import AdminCourses from './AdminCourses';
import AdminLessons from './AdminLessons';
import AdminProfile from './AdminProfile';
import AdminAnalytics from './AdminAnalytics';
import AdminQuizzes from './AdminQuizzes';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="flex h-screen bg-slate-100 font-sans w-full">
      {/* Sidebar */}
      <div className="w-72 bg-[#1e293b] text-white flex flex-col flex-shrink-0 shadow-xl z-10">
        <div className="p-8 text-2xl font-bold border-b border-slate-700/50 flex flex-col items-center justify-center bg-slate-900/50">
          <div className="text-4xl mb-2">🛡️</div>
          <div><span className="text-[#a78bfa]">Admin</span> Portal</div>
        </div>
        <div className="flex-grow py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📊</span> Analytics
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'courses' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📚</span> Manage Courses
          </button>
          <button 
            onClick={() => setActiveTab('lessons')}
             className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'lessons' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>🎥</span> Manage Lessons
          </button>
          <button 
            onClick={() => setActiveTab('quizzes')}
             className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'quizzes' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📝</span> Manage Quizzes
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
             className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'profile' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>👤</span> Profile
          </button>
        </div>
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 mt-auto">
          <button onClick={onLogout} className="w-full text-center px-4 py-3 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-colors">
            Exit Admin Area
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto relative w-full h-full">
        {/* Dynamic header could go here, omitting for now to let components own their headers */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'courses' && <AdminCourses />}
            {activeTab === 'lessons' && <AdminLessons />}
            {activeTab === 'quizzes' && <AdminQuizzes />}
            {activeTab === 'profile' && <AdminProfile />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
