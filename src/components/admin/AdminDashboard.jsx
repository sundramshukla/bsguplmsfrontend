import React, { useState } from 'react';
import AdminCourses from './AdminCourses';
import AdminLessons from './AdminLessons';
import AdminProfile from './AdminProfile';
import AdminAnalytics from './AdminAnalytics';
import AdminQuizzes from './AdminQuizzes';
import AdminTemplates from './AdminTemplates';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans w-full relative overflow-hidden">
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between bg-slate-900 text-white py-4 px-6 shadow-md w-full sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-white hover:text-[#a78bfa] focus:outline-none p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl font-bold">menu</span>
          </button>
          <span className="text-lg font-bold flex items-center gap-2">
            <span>🛡️</span>
            <span><span className="text-[#a78bfa]">Admin</span> Portal</span>
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="text-xs bg-rose-500/20 text-rose-300 px-3.5 py-2 rounded-lg border border-rose-500/30 hover:bg-rose-600 hover:text-white font-bold transition-all"
        >
          Exit Panel
        </button>
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Responsive Slide-in Drawer on Mobile, Fixed Sidebar on Desktop) */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-[#1e293b] text-white flex flex-col flex-shrink-0 shadow-2xl z-40 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="text-4xl mb-2">🛡️</div>
            <div className="text-xl font-bold"><span className="text-[#a78bfa]">Admin</span> Portal</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white focus:outline-none p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex-grow py-6 px-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => handleTabClick('analytics')}
            className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📊</span> Analytics
          </button>
          <button 
            onClick={() => handleTabClick('courses')}
            className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'courses' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📚</span> Manage Courses
          </button>
          <button 
            onClick={() => handleTabClick('lessons')}
             className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'lessons' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>🎥</span> Manage Lessons
          </button>
          <button 
            onClick={() => handleTabClick('quizzes')}
             className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'quizzes' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📝</span> Manage Quizzes
          </button>
          <button 
            onClick={() => handleTabClick('profile')}
             className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'profile' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>👤</span> Profile
          </button>
          <button 
            onClick={() => handleTabClick('templates')}
             className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'templates' ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📜</span> Certificate Templates
          </button>
        </div>

        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 mt-auto hidden md:block">
          <button onClick={onLogout} className="w-full text-center px-4 py-3 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-colors">
            Exit Admin Area
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto relative w-full h-full">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'courses' && <AdminCourses />}
            {activeTab === 'lessons' && <AdminLessons />}
            {activeTab === 'quizzes' && <AdminQuizzes />}
            {activeTab === 'profile' && <AdminProfile />}
            {activeTab === 'templates' && <AdminTemplates />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
