import React, { useState, useEffect } from "react";
import Navbar from './Navbar';
import Footer from './Footer';
import { BASE_URL } from '../config';
import Loader from './Loader';

const DEPARTMENTS_MAP = {
  organisation: 'Organization',
  training: 'Training',
  it: 'IT'
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const cardsPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        if (data.success && data.data) {
          const formattedCourses = data.data.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            image: c.course_profile_pic ? `${BASE_URL}${c.course_profile_pic}` : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop",
            duration: c.duration || "4 Weeks",
            level: "Beginner", // hardcoded as fallback but can be dynamic if backend adds it
            department: DEPARTMENTS_MAP[c.department] || "Organization",
            price: c.price
          }));
          // sort by ID descending so newest is first
          setCourses(formattedCourses.sort((a,b) => b.id - a.id));
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const filteredCourses = activeFilter === 'All' 
    ? courses 
    : courses.filter(course => course.department === activeFilter);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCourses.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(filteredCourses.length / cardsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLoggedInEnroll = (course) => {
    const userId = localStorage.getItem('userId') || '3';
    const key = `enrolledCourses_${userId}`;
    const enrolledStr = localStorage.getItem(key) || '[]';
    const enrolled = JSON.parse(enrolledStr);

    if (enrolled.includes(course.id)) {
      alert("You are already enrolled in this course!");
      window.location.hash = '#student';
      return;
    }

    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';

    if (isFree) {
      enrolled.push(course.id);
      localStorage.setItem(key, JSON.stringify(enrolled));
      alert(`Successfully enrolled in "${course.title}" for Free! You can now start learning.`);
      window.location.hash = '#student';
      window.dispatchEvent(new Event('storage'));
    } else {
      const confirmPayment = window.confirm(`Proceed to secure payment of ₹${course.price} to enroll in "${course.title}"?`);
      if (confirmPayment) {
        enrolled.push(course.id);
        localStorage.setItem(key, JSON.stringify(enrolled));
        
        // Track payment history
        const paymentKey = `paymentHistory_${userId}`;
        const paymentHistory = JSON.parse(localStorage.getItem(paymentKey) || '[]');
        paymentHistory.push({
          id: Date.now(),
          courseTitle: course.title,
          amount: course.price,
          date: new Date().toLocaleDateString(),
          status: 'Success'
        });
        localStorage.setItem(paymentKey, JSON.stringify(paymentHistory));

        alert(`Payment of ₹${course.price} Successful! You are now enrolled in "${course.title}".`);
        window.location.hash = '#student';
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  return (
    <div className="pt-8 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Available Courses for Beginners
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Browse our comprehensive collection of training programs designed to develop leadership, character, and practical skills.
          </p>
          <div className="h-1 w-20 bg-[#7c3aed] mx-auto rounded-full mt-6" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['All', 'Organization', 'Training', 'IT'].map(dept => (
            <button
              key={dept}
              onClick={() => setActiveFilter(dept)}
              className={`px-5 py-2 rounded-full font-medium transition-colors ${
                activeFilter === dept
                  ? 'bg-[#7c3aed] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {dept === 'All' ? 'All Departments' : `${dept} Department`}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <Loader message="Loading courses..." />
        ) : filteredCourses.length === 0 ? (
          <div className="flex justify-center p-12">
            <p className="text-xl text-slate-500 font-medium">No courses available for this department.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentCards.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-slate-100 flex flex-col">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3 text-sm text-slate-500 font-medium whitespace-nowrap overflow-hidden">
                    <div className="flex gap-2 items-center">
                      <span className="bg-[#7c3aed]/10 text-[#7c3aed] px-3 py-1 rounded-full text-xs truncate max-w-[100px]" title={course.level}>
                        {course.level}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs truncate max-w-[120px]" title={`${course.department} Dept`}>
                        {course.department} Dept
                      </span>
                    </div>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {course.duration}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 flex-1">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-[#7c3aed]">
                      {course.price == 0 || course.price == '0' || course.price == '0.00' ? 'Free' : `₹${course.price}`}
                    </span>
                  </div>
                  {isLoggedIn ? (
                    <button 
                      onClick={() => handleLoggedInEnroll(course)}
                      className="w-full bg-[#10b981] text-white py-2.5 rounded-lg font-semibold hover:bg-[#059669] transition-colors"
                    >
                      {course.price == 0 || course.price == '0' || course.price == '0.00' ? 'Start Free Course' : 'Enroll & Pay'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        alert("Please sign up or log in to enroll in this course!");
                        window.dispatchEvent(new Event('openRegisterModal'));
                      }}
                      className="w-full bg-[#7c3aed] text-white py-2.5 rounded-lg font-semibold hover:bg-[#6d28d9] transition-all hover:scale-[1.02] shadow-md shadow-purple-500/10 active:scale-95"
                    >
                      Sign Up & Enroll
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                currentPage === 1 
                  ? 'text-slate-400 bg-slate-100 cursor-not-allowed' 
                  : 'text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                  currentPage === index + 1
                    ? 'bg-[#7c3aed] text-white'
                    : 'text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                currentPage === totalPages 
                  ? 'text-slate-400 bg-slate-100 cursor-not-allowed' 
                  : 'text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
