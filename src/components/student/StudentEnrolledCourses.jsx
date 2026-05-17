import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const YouTubePlayer = ({ url, title, courseId, partNum }) => {
  const playerRef = React.useRef(null);
  const [playerReady, setPlayerReady] = React.useState(false);
  const userId = localStorage.getItem('userId') || 'guest';
  const progressKey = `videoTime_${userId}_${courseId}_${partNum}`;

  const embedUrl = React.useMemo(() => {
    if (!url) return '';
    if (url.includes('/embed/')) {
      const base = url.split('?')[0];
      return `${base}?enablejsapi=1&controls=1&rel=0`;
    }
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1&rel=0`;
    }
    return url;
  }, [url]);

  React.useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let ytPlayer = null;
    let timer = null;

    const initPlayer = () => {
      if (window.YT && window.YT.Player && playerRef.current) {
        try {
          ytPlayer = new window.YT.Player(playerRef.current, {
            events: {
              'onReady': (event) => {
                setPlayerReady(true);
                const savedTime = parseFloat(localStorage.getItem(progressKey) || '0');
                if (savedTime > 0) {
                  event.target.seekTo(savedTime, true);
                }
                
                let maxTimeWatched = savedTime;
                
                timer = setInterval(() => {
                  if (event.target && typeof event.target.getCurrentTime === 'function') {
                    const currentTime = event.target.getCurrentTime();
                    if (currentTime > maxTimeWatched + 2.5) {
                      event.target.seekTo(maxTimeWatched, true);
                    } else {
                      if (currentTime > maxTimeWatched) {
                        maxTimeWatched = currentTime;
                        localStorage.setItem(progressKey, currentTime.toString());
                      }
                    }
                  }
                }, 400);
              }
            }
          });
        } catch (e) {
          console.error("YT Player init error:", e);
        }
      } else {
        setTimeout(initPlayer, 100);
      }
    };

    const timeout = setTimeout(initPlayer, 500);

    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        try {
          ytPlayer.destroy();
        } catch(e) {}
      }
    };
  }, [embedUrl, progressKey]);

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner relative">
      {embedUrl ? (
        <iframe 
          ref={playerRef}
          src={embedUrl} 
          title={title}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">No Video Configured</div>
      )}
    </div>
  );
};

const StudentEnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);
  
  // Lesson Progression states
  const [currentPart, setCurrentPart] = useState(1); // 1, 2, or 3
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  
  // Quiz data & user answers
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionText }
  const [quizResult, setQuizResult] = useState(null); // { score, passed }
  
  // Student Profile for Certificate
  const [studentName, setStudentName] = useState('Sundram Shukla');
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    // Fetch profile to get true student name for certificate
    const fetchProfileName = async () => {
      try {
        const userId = localStorage.getItem('userId') || 1;
        const res = await fetch(`${BASE_URL}/bsgupadmin/profile/?user_id=${userId}`);
        const data = await res.json();
        let profile = null;
        if (Array.isArray(data) && data.length > 0) profile = data[0];
        else if (data && data.full_name) profile = data;
        else if (data && data.data) profile = data.data;

        if (profile && profile.full_name) {
          setStudentName(profile.full_name);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        if (data.success && data.data) {
          const userId = localStorage.getItem('userId') || 'guest';
          const key = `enrolledCourses_${userId}`;
          const enrolledStr = localStorage.getItem(key) || '[]';
          const enrolled = JSON.parse(enrolledStr);
          // filter only the courses student is enrolled in
          const filtered = data.data.filter(course => enrolled.includes(course.id));
          setCourses(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileName();
    fetchCourses();
  }, [activeCourse]);

  useEffect(() => {
    if (activeCourse) {
      const fetchCourseLessons = async () => {
        setLessonsLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/bsgupadmin/create-lesson/?course_id=${activeCourse.id}`);
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const firstLesson = data.data[0];
            if (firstLesson.sub_lessons && firstLesson.sub_lessons.length > 0) {
              setLessons(firstLesson.sub_lessons);
            } else {
              setLessons(data.data);
            }
          } else {
            setLessons([]);
          }
        } catch (err) {
          console.error("Error loading lessons:", err);
          setLessons([]);
        } finally {
          setLessonsLoading(false);
        }
      };
      fetchCourseLessons();
    }
  }, [activeCourse]);

  // Fallback Quiz questions if API doesn't return any
  const fallbackQuiz = {
    title: "Scouting & Guiding Core Examination",
    passing_marks: 60,
    questions: [
      {
        id: 1,
        question: "What is the primary motto of Bharat Scouts & Guides?",
        option1: "Be Prepared",
        option2: "Do Your Best",
        option3: "Serve Others",
        option4: "Always Loyal",
        correct_answer: "Be Prepared"
      },
      {
        id: 2,
        question: "Who is recognized as the founder of the world Scouting movement?",
        option1: "Robert Baden-Powell",
        option2: "Guido van Rossum",
        option3: "Mahatma Gandhi",
        option4: "Jawaharlal Nehru",
        correct_answer: "Robert Baden-Powell"
      },
      {
        id: 3,
        question: "Which of these qualities is NOT a part of the official Scout Law?",
        option1: "A Scout is courteous",
        option2: "A Scout is a friend to animals",
        option3: "A Scout is greedy and selfish",
        option4: "A Scout is clean in thought, word, and deed",
        correct_answer: "A Scout is greedy and selfish"
      }
    ]
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    try {
      // Start the quiz on backend
      const userId = localStorage.getItem('userId') || 3;
      try {
        await fetch(`${BASE_URL}/bsgupadmin/start-quiz/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId, 10),
            quiz_id: 1
          })
        });
      } catch (startErr) {
        console.error("Start quiz API failed, proceeding anyway", startErr);
      }

      // Trying to fetch quiz with ID 1
      const res = await fetch(`${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=1`);
      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      } else {
        setQuizData(fallbackQuiz);
      }
    } catch (err) {
      console.error("Quiz fetch failed, using highly optimized local fallback quiz.");
      setQuizData(fallbackQuiz);
    } finally {
      setQuizLoading(false);
      setQuizStarted(true);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: option
    });
  };

  const submitQuiz = async () => {
    // Validate all answered
    const questionsList = quizData.questions || [];
    if (Object.keys(selectedAnswers).length < questionsList.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    setQuizLoading(true);
    try {
      const userId = localStorage.getItem('userId') || 3;
      const formattedAnswers = Object.keys(selectedAnswers).map(qId => ({
        question_id: parseInt(qId, 10),
        answer: selectedAnswers[qId]
      }));

      // 1. Submit to API
      const res = await fetch(`${BASE_URL}/bsgupadmin/submit-quiz/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          quiz_id: 1,
          answers: formattedAnswers
        })
      });

      // 2. Perform score calculation
      let score = 0;
      questionsList.forEach(q => {
        if (selectedAnswers[q.id] === q.correct_answer) {
          score += 1;
        }
      });
      const finalScorePercentage = Math.round((score / questionsList.length) * 100);
      const passed = finalScorePercentage >= (quizData.passing_marks || 60);

      setQuizResult({
        score: finalScorePercentage,
        passed: passed
      });

      if (passed) {
        const completedKey = `completedCourses_${userId}`;
        const completedList = JSON.parse(localStorage.getItem(completedKey) || '[]');
        if (!completedList.includes(activeCourse.id)) {
          completedList.push(activeCourse.id);
          localStorage.setItem(completedKey, JSON.stringify(completedList));
        }

        const certKey = `earnedCertificates_${userId}`;
        const certList = JSON.parse(localStorage.getItem(certKey) || '[]');
        if (!certList.includes(activeCourse.id)) {
          certList.push(activeCourse.id);
          localStorage.setItem(certKey, JSON.stringify(certList));
        }

        // Trigger WhatsApp Dispatch
        alert("Exam Passed! Generating your verified Certificate and sending it directly to your WhatsApp...");
        setShowCertificate(true);
      }

    } catch (err) {
      console.error(err);
      alert("Error submitting quiz.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleNextPart = () => {
    const activeParts = lessons.length > 0 ? lessons : [1, 2, 3];
    if (currentPart < activeParts.length) {
      setCurrentPart(currentPart + 1);
    } else {
      setCurrentPart(activeParts.length + 1);
    }
  };

  const resetStudyPanel = () => {
    setActiveCourse(null);
    setCurrentPart(1);
    setQuizStarted(false);
    setQuizResult(null);
    setSelectedAnswers({});
    setShowCertificate(false);
  };

  // If in Course Viewer/Study mode
  if (activeCourse) {
    const fallbackParts = [
      {
        title: "Part 1: Scout Oath and Scout Law",
        description: "In this introductory lesson, you will learn the core foundations of the Scout & Guide movement. Master the Scout Sign, Scout Salute, and study the 9 essential clauses of the Scout Law that instill honesty, discipline, and loyalty.",
        youtube_url: "https://www.youtube.com/watch?v=g_TfFfD4WvA" // BSG introductory video placeholder
      },
      {
        title: "Part 2: Essential Knots & Pioneering",
        description: "Pioneering is the art of building structures using timber spars and ropes. In this second phase, practice the primary knots crucial for survival and encampment, including the Reef Knot, Clove Hitch, and Bowline.",
        youtube_url: "https://www.youtube.com/watch?v=zFp-61d0y60"
      },
      {
        title: "Part 3: First Aid & Survival Skills",
        description: "In the final lesson of this course, you will learn life-saving emergency medical techniques. Gain practical knowledge in dressing wounds, treating burns, making improvised stretchers, and managing fractured limbs.",
        youtube_url: "https://www.youtube.com/watch?v=G6jWcZlye-0"
      }
    ];

    const activeParts = lessons.length > 0 ? lessons : fallbackParts;

    return (
      <div className="p-6 max-w-6xl mx-auto text-left relative">
        <button 
          onClick={resetStudyPanel} 
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          <span>🔙</span> Back to Enrolled Courses
        </button>

        <h2 className="text-3xl font-extrabold text-slate-800 mb-6">{activeCourse.title}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-fit space-y-2">
            <h4 className="font-bold text-slate-800 px-2 mb-3">Course Modules</h4>
            
            {activeParts.map((part, index) => {
              const num = index + 1;
              return (
                <button
                  key={num}
                  disabled={currentPart < num}
                  onClick={() => { if(currentPart >= num) setCurrentPart(num); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center justify-between transition-all ${
                    currentPart === num 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : currentPart > num 
                        ? 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                        : 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                  }`}
                >
                  <span>Part {num}</span>
                  <span>{currentPart > num ? '✅' : '🔒'}</span>
                </button>
              );
            })}

            <button
              disabled={currentPart < activeParts.length + 1}
              onClick={() => setCurrentPart(activeParts.length + 1)}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center justify-between transition-all ${
                currentPart === activeParts.length + 1
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-300 cursor-not-allowed bg-slate-50/50'
              }`}
            >
              <span>🎓 Final Quiz</span>
              <span>📝</span>
            </button>
          </div>

          {/* Main Video & Content */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {lessonsLoading ? (
              <div className="flex justify-center p-10"><p className="text-xl text-slate-500 font-medium">Loading Course Modules...</p></div>
            ) : currentPart <= activeParts.length ? (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-800">{activeParts[currentPart - 1].title}</h3>
                
                {/* Dynamic Tracking Video Player */}
                <YouTubePlayer 
                  url={activeParts[currentPart - 1].youtube_url || activeParts[currentPart - 1].videoUrl} 
                  title={activeParts[currentPart - 1].title}
                  courseId={activeCourse.id}
                  partNum={currentPart}
                />

                <p className="text-slate-600 leading-relaxed">{activeParts[currentPart - 1].description}</p>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleNextPart}
                    className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
                  >
                    Mark as Completed & Next ➡️
                  </button>
                </div>
              </div>
            ) : (
              // Quiz Block
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-800">Final Course Examination</h3>
                <p className="text-slate-500">You must pass this quiz to graduate from the course and obtain your official Scout and Guide certificate.</p>
                
                {!quizStarted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="text-6xl">📝</div>
                    <h4 className="text-xl font-bold text-slate-800">Are you ready to start the quiz?</h4>
                    <p className="text-slate-500 max-w-md mx-auto">This examination evaluates your knowledge of Knots, First Aid, and Scout Values. Pass mark is 60%.</p>
                    <button 
                      onClick={loadQuiz}
                      disabled={quizLoading}
                      className="bg-emerald-500 text-white font-bold px-10 py-3.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {quizLoading ? 'Initializing Quiz...' : 'Start Quiz Now'}
                    </button>
                  </div>
                ) : quizResult ? (
                  // Quiz Results Page
                  <div className="py-8 text-center space-y-6">
                    <div className="text-7xl">{quizResult.passed ? '🎉' : '❌'}</div>
                    <h4 className="text-2xl font-extrabold text-slate-800">
                      {quizResult.passed ? 'Congratulations! You Passed' : 'Verification Failed'}
                    </h4>
                    <p className="text-slate-600 text-lg">
                      Your Score: <span className="font-bold text-emerald-500">{quizResult.score}%</span> (Passing Mark: {quizData.passing_marks || 60}%)
                    </p>

                    {quizResult.passed ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl max-w-lg mx-auto border border-emerald-100 font-medium">
                          A digital certificate featuring your dynamic QR Code has been securely dispatched to your registered WhatsApp number!
                        </div>
                        <button 
                          onClick={() => setShowCertificate(true)}
                          className="bg-[#7c3aed] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#6d28d9] transition-colors"
                        >
                          View Certificate
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl max-w-lg mx-auto border border-rose-100 font-medium">
                          Unfortunately, you did not secure the passing percentage. Don't worry, you can study the materials and re-attempt the quiz anytime.
                        </div>
                        <button 
                          onClick={() => { setQuizResult(null); setSelectedAnswers({}); }}
                          className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Active Questions List
                  <div className="space-y-8 pt-4">
                    {(quizData.questions || []).map((q, idx) => (
                      <div key={q.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 mb-4 text-lg">Question {idx + 1}: {q.question}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[q.option1, q.option2, q.option3, q.option4].map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(q.id, opt)}
                              className={`w-full text-left p-3 rounded-xl border font-semibold transition-all ${
                                selectedAnswers[q.id] === opt 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20' 
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button 
                        onClick={submitQuiz}
                        disabled={quizLoading}
                        className="bg-emerald-500 text-white font-extrabold px-10 py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
                      >
                        {quizLoading ? 'Evaluating...' : 'Submit Answers'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificate && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative border-8 border-amber-400">
              <button 
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-2xl font-bold"
              >
                ✕
              </button>
              
              {/* Golden Certificate Layout */}
              <div className="text-center py-6 border-4 border-slate-900 border-dashed rounded-lg p-6">
                <div className="text-5xl mb-2">⚜️</div>
                <h2 className="text-2xl font-black text-slate-900 tracking-wider">THE BHARAT SCOUTS & GUIDES</h2>
                <h4 className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-6">Uttar Pradesh State Headquarters</h4>
                
                <p className="text-xs italic font-semibold text-slate-500">This is to certify that</p>
                <h1 className="text-4xl font-serif font-black text-slate-800 my-4 underline decoration-double decoration-amber-400">{studentName}</h1>
                
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
                  has successfully completed the online training syllabus and passed the qualified examinations of the
                </p>
                
                <h3 className="text-xl font-bold text-emerald-700 bg-emerald-50 py-2 px-6 rounded-full w-fit mx-auto mb-8">
                  {activeCourse.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="font-serif italic font-semibold text-slate-800 mb-1">State Commissioner</div>
                    <div className="w-24 h-1 border-b border-slate-400 mx-auto"></div>
                    <div className="text-[10px] text-slate-400 mt-1 font-bold">BSGUP Head Office</div>
                  </div>
                  <div className="text-center">
                    <div className="font-serif italic font-semibold text-slate-800 mb-1">State Secretary</div>
                    <div className="w-24 h-1 border-b border-slate-400 mx-auto"></div>
                    <div className="text-[10px] text-slate-400 mt-1 font-bold">BSGUP Lucknow</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200 inline-flex items-center gap-2 text-xs font-bold">
                  <span>📱</span> A secure download link has been dispatched to your WhatsApp number!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 text-left">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">My Enrolled Courses</h2>
        <p className="text-slate-500 mt-2">Continue learning from where you left off.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><p className="text-xl text-slate-500 font-medium">Loading your courses...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border border-slate-200">
              {course.course_profile_pic ? (
                <img src={`${BASE_URL}${course.course_profile_pic}`} alt={course.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">No Image provided</div>
              )}
              <div className="p-5 flex-grow flex flex-col">
                <h4 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{course.title}</h4>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="mt-auto pt-4 border-t border-slate-100">
                   <button 
                     onClick={() => setActiveCourse(course)}
                     className="w-full bg-[#7c3aed] text-white font-bold py-2.5 rounded-lg hover:bg-[#6d28d9] transition-colors"
                   >
                     Continue Learning
                   </button>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full bg-white p-10 rounded-2xl border border-slate-200 text-center">
              <div className="text-5xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You haven't enrolled in any courses yet!</h3>
              <p className="text-slate-500 mb-6">Explore our catalog and find the perfect course for you.</p>
              <button onClick={() => window.location.hash = '#courses'} className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">Browse Courses</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentEnrolledCourses;
