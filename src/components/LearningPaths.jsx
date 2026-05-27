import React, { useState } from 'react';
import orgPhoto from '../assets/Images/department.jpg';
import trainingPhoto from '../assets/Images/Training.jpeg';
import itPhoto from '../assets/Images/IT.jpg';

function LearningPaths() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all fields.');
      return;  
    }
    // Simulate registration (localStorage optional)
    localStorage.setItem('registration', JSON.stringify(formData));
    setIsRegisterOpen(false);
    setIsVideoOpen(true);
  };

  // inline component replaced

  return (
    <>
      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
              Explore Our Learning Paths
            </h2>
            <div className="h-1 w-20 bg-[#7c3aed] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {/* Beginner Card (Organization) - Unchanged */}
            <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
              <img 
                src={orgPhoto} 
                alt="Organization Department" 
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
              />
              <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center text-[#7c3aed] mb-5">
                <span className="material-symbols-outlined text-3xl">menu_book</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Organization Department</h3>
              <p className="text-slate-600 leading-relaxed mb-5 text-sm">
                Start from scratch with fundamentals and build a solid foundation in your chosen field. No prior experience required.
              </p>
              <button 
                onClick={() => window.location.hash = '#courses'} 
                className="text-[#7c3aed] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all bg-[#7c3aed]/10 px-4 py-2 rounded-lg hover:bg-[#7c3aed]/20"
              >
                Explore Path <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </article>

            {/* Training Department Card - Updated */}
            <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
              <img 
                src={trainingPhoto} 
                alt="Beginner Training Course" 
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
              />
              <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center text-[#7c3aed] mb-5">
                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Training Department</h3>
              <p className="text-slate-600 leading-relaxed mb-5 text-sm">
                Bridge the gap to professional proficiency with practical projects and advanced workflows for career advancement.
              </p>
              <button
                onClick={() => window.location.hash = '#courses'}
                className="text-[#7c3aed] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all bg-[#7c3aed]/10 px-4 py-2 rounded-lg hover:bg-[#7c3aed]/20"
              >
                Explore Path <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </article>

            {/* Advanced Card - Unchanged */}
            <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
              <img 
                src={itPhoto} 
                alt="It Department" 
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
              />
              <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center text-[#7c3aed] mb-5">
                <span className="material-symbols-outlined text-3xl">trophy</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">It Department</h3>
              <p className="text-slate-600 leading-relaxed mb-5 text-sm">
                Master advanced techniques and leadership skills. Designed for senior roles and specialized expert positions.
              </p>
              <button 
                onClick={() => window.location.hash = '#courses'} 
                className="text-[#7c3aed] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all bg-[#7c3aed]/10 px-4 py-2 rounded-lg hover:bg-[#7c3aed]/20"
              >
                Explore Path <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </article>
          </div>
        </div>
      </section>

      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsRegisterOpen(false)}>
          <div className="bg-white p-8 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Register for Beginner Course</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#7c3aed] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors"
              >
                Start Training
              </button>
            </form>
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="mt-4 text-slate-500 hover:text-slate-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsVideoOpen(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Beginner Course Video</h3>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&showinfo=0&fs=1"
                title="Beginner Training Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation allow-orientation-lock"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LearningPaths;

