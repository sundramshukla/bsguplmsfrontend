import React, { useState } from 'react';
import StudentAnalytics from './StudentAnalytics';
import StudentEnrolledCourses from './StudentEnrolledCourses';
import StudentDepartmentCourses from './StudentDepartmentCourses';
import StudentProfile from './StudentProfile';
import StudentPaymentHistory from './StudentPaymentHistory';
import StudentContact from './StudentContact';

const StudentDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans w-full relative overflow-hidden">
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between bg-[#0f172a] text-white py-4 px-6 shadow-md w-full sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-white hover:text-emerald-400 focus:outline-none p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl font-bold">menu</span>
          </button>
          <span className="text-lg font-bold flex items-center gap-2">
            <span>🎓</span>
            <span><span className="text-emerald-400">Student</span> Portal</span>
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-600 hover:text-white font-bold transition-all"
        >
          Logout
        </button>
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-[#0f172a] text-white flex flex-col flex-shrink-0 shadow-2xl z-40 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="text-4xl mb-2">🎓</div>
            <div className="text-center font-bold text-xl"><span className="text-emerald-400">Student</span> Portal</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white focus:outline-none p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <div className="p-4 border-b border-slate-700/50">
          <button onClick={() => window.location.href = '/'} className="w-full text-center px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2">
            <span>🔙</span> Back to Website
          </button>
        </div>
        <div className="flex-grow py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => handleTabClick('analytics')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📊</span> My Analytics
          </button>
          <button 
            onClick={() => handleTabClick('enrolled')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'enrolled' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📚</span> Enrolled Courses
          </button>
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">Departments</p>
          </div>
          <button 
            onClick={() => handleTabClick('dept_org')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'dept_org' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>🏢</span> Organization Dept
          </button>
          <button 
            onClick={() => handleTabClick('dept_training')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'dept_training' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>🏋️‍♂️</span> Training Dept
          </button>
          <button 
            onClick={() => handleTabClick('dept_it')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'dept_it' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>💻</span> IT Dept
          </button>
          
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">Account</p>
          </div>
          <button 
            onClick={() => handleTabClick('profile')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>👤</span> My Profile
          </button>
          <button 
            onClick={() => handleTabClick('payment')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'payment' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>💳</span> Payment History
          </button>
          <button 
            onClick={() => handleTabClick('contact')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'contact' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📞</span> Contact BSGUP
          </button>
        </div>
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 mt-auto hidden md:block">
          <button onClick={onLogout} className="w-full text-center px-4 py-3 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-colors">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto relative w-full h-full bg-slate-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {activeTab === 'analytics' && <StudentAnalytics onNavigate={handleTabClick} />}
            {activeTab === 'enrolled' && <StudentEnrolledCourses />}
            {activeTab === 'dept_org' && <StudentDepartmentCourses department="organisation" title="Organization Department" />}
            {activeTab === 'dept_training' && <StudentDepartmentCourses department="training" title="Training Department" />}
            {activeTab === 'dept_it' && <StudentDepartmentCourses department="it" title="IT Department" />}
            {activeTab === 'profile' && <StudentProfile />}
            {activeTab === 'payment' && <StudentPaymentHistory />}
            {activeTab === 'contact' && <StudentContact />}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
