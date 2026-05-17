import React, { useState } from 'react';
import StudentAnalytics from './StudentAnalytics';
import StudentEnrolledCourses from './StudentEnrolledCourses';
import StudentDepartmentCourses from './StudentDepartmentCourses';
import StudentProfile from './StudentProfile';
import StudentPaymentHistory from './StudentPaymentHistory';
import StudentContact from './StudentContact';

const StudentDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="flex h-screen bg-slate-50 font-sans w-full">
      {/* Sidebar */}
      <div className="w-72 bg-[#0f172a] text-white flex flex-col flex-shrink-0 shadow-xl z-10">
        <div className="p-8 text-2xl font-bold border-b border-slate-700/50 flex flex-col items-center justify-center bg-slate-900/50">
          <div className="text-4xl mb-2">🎓</div>
          <div className="text-center"><span className="text-emerald-400">Student</span> Portal</div>
        </div>
        <div className="p-4 border-b border-slate-700/50">
          <button onClick={() => window.location.href = '/'} className="w-full text-center px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2">
            <span>🔙</span> Back to Website
          </button>
        </div>
        <div className="flex-grow py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📊</span> My Analytics
          </button>
          <button 
            onClick={() => setActiveTab('enrolled')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'enrolled' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📚</span> Enrolled Courses
          </button>
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">Departments</p>
          </div>
          <button 
            onClick={() => setActiveTab('dept_org')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'dept_org' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>🏢</span> Organization Dept
          </button>
          <button 
            onClick={() => setActiveTab('dept_training')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'dept_training' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>🏋️‍♂️</span> Training Dept
          </button>
          <button 
            onClick={() => setActiveTab('dept_it')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'dept_it' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>💻</span> IT Dept
          </button>
          
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">Account</p>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>👤</span> My Profile
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'payment' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>💳</span> Payment History
          </button>
          <button 
            onClick={() => setActiveTab('contact')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${activeTab === 'contact' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <span>📞</span> Contact BSGUP
          </button>
        </div>
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 mt-auto">
          <button onClick={onLogout} className="w-full text-center px-4 py-3 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-colors">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto relative w-full h-full bg-slate-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {activeTab === 'analytics' && <StudentAnalytics />}
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
