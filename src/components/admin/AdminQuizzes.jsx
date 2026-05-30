import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { fetchQuizForCourse, fetchQuizById, saveCourseQuizMapping, syncCourseQuizMappings } from '../../utils/quizUtils';

const AdminQuizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState(null);
  const [checkingQuiz, setCheckingQuiz] = useState(false);

  // Quiz Form states
  const [quizForm, setQuizForm] = useState({
    title: 'Python Final Quiz',
    total_marks: 100,
    passing_marks: 60,
    duration: 30
  });

  // Question Form states
  const [quizIdForQuestion, setQuizIdForQuestion] = useState('1');
  const [questionForm, setQuestionForm] = useState({
    question: 'Which framework is used with Python?',
    option1: 'Laravel',
    option2: 'Django',
    option3: 'Spring',
    option4: 'React',
    correct_answer: 'Django'
  });

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [filterCourseId, setFilterCourseId] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [isStep1Open, setIsStep1Open] = useState(true);
  const [isStep2Open, setIsStep2Open] = useState(false);
  const [isAllQuizzesOpen, setIsAllQuizzesOpen] = useState(true);

  const fetchAllExistingQuizzes = async (coursesList) => {
    setQuizzesLoading(true);
    const quizzesFound = [];
    try {
      const promises = coursesList.map(async (course) => {
        try {
          const quizResult = await fetchQuizForCourse(course.id, course.title);
          if (!quizResult) return null;

          const qId = quizResult.quizId || localStorage.getItem(`quiz_id_course_${course.id}`);
          if (!qId) return null;

          return {
            id: qId.toString(),
            courseId: course.id.toString(),
            title: quizResult.title || `Quiz #${qId}`,
            courseTitle: course.title,
            total_marks: 100,
            passing_marks: quizResult.passing_marks || 60,
            duration: quizResult.duration || 30,
            questions: quizResult.questions || []
          };
        } catch (e) {
          // Ignore
        }
        return null;
      });

      const results = await Promise.all(promises);
      results.forEach(q => {
        if (q) quizzesFound.push(q);
      });
    } catch (err) {
      console.error("Error fetching all quizzes:", err);
    }
    setAllQuizzes(quizzesFound);
    setQuizzesLoading(false);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        if (data.success && data.data) {
          setCourses(data.data);
          if (data.data.length > 0) {
            setSelectedCourseId(data.data[0].id.toString());
          }
          fetchAllExistingQuizzes(data.data);
          syncCourseQuizMappings(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const checkQuizForCourse = async (courseId) => {
    setCheckingQuiz(true);
    setExistingQuiz(null);
    try {
      const quizResult = await fetchQuizForCourse(courseId, courses.find(c => c.id.toString() === courseId.toString())?.title || '');

      if (quizResult) {
        const qId = quizResult.quizId || localStorage.getItem(`quiz_id_course_${courseId}`);
        const foundQuiz = {
          id: qId.toString(),
          title: quizResult.title || 'Course Final Quiz',
          total_marks: 100,
          passing_marks: quizResult.passing_marks || 60,
          duration: quizResult.duration || 30
        };
        setExistingQuiz(foundQuiz);
        setQuizForm({
          title: foundQuiz.title,
          total_marks: foundQuiz.total_marks,
          passing_marks: foundQuiz.passing_marks,
          duration: foundQuiz.duration
        });
        setQuizIdForQuestion(qId.toString());
        saveCourseQuizMapping(courseId, qId);
        setCheckingQuiz(false);
        return;
      }
    } catch (err) {
      console.error("Failed to check existing quiz:", err);
    }

    // Default values if no existing quiz found
    const courseTitle = courses.find(c => c.id.toString() === courseId.toString())?.title || 'Course';
    setQuizForm({
      title: `${courseTitle} Final Quiz`,
      total_marks: 100,
      passing_marks: 60,
      duration: 30
    });

    const cachedQuizId = localStorage.getItem(`quiz_id_course_${courseId}`);
    if (cachedQuizId) {
      setExistingQuiz({
        id: cachedQuizId,
        title: `Quiz #${cachedQuizId}`,
        total_marks: 100,
        passing_marks: 60,
        duration: 30
      });
      setQuizIdForQuestion(cachedQuizId.toString());
      saveCourseQuizMapping(courseId, cachedQuizId);
    } else {
      setQuizIdForQuestion('');
    }
    setCheckingQuiz(false);
  };

  useEffect(() => {
    if (selectedCourseId) {
      checkQuizForCourse(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleQuizChange = (e) => {
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  };

  const handleEditQuizFromList = (quiz) => {
    if (quiz.courseId) {
      setSelectedCourseId(quiz.courseId);
    } else {
      const foundCourse = courses.find(c => c.title === quiz.courseTitle);
      if (foundCourse) {
        setSelectedCourseId(foundCourse.id.toString());
      }
    }
    setQuizForm({
      title: quiz.title,
      total_marks: quiz.total_marks,
      passing_marks: quiz.passing_marks,
      duration: quiz.duration
    });
    setExistingQuiz({
      id: quiz.id,
      title: quiz.title,
      total_marks: quiz.total_marks,
      passing_marks: quiz.passing_marks,
      duration: quiz.duration
    });
    setQuizIdForQuestion(quiz.id.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionChange = (e) => {
    setQuestionForm({ ...questionForm, [e.target.name]: e.target.value });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const isEditing = !!existingQuiz;
    try {
      const adminUserId = localStorage.getItem('adminUserId') || localStorage.getItem('userId') || 2;
      const payload = {
        user_id: parseInt(adminUserId, 10),
        course_id: parseInt(selectedCourseId, 10),
        title: quizForm.title,
        total_marks: parseInt(quizForm.total_marks, 10),
        passing_marks: parseInt(quizForm.passing_marks, 10),
        duration: parseInt(quizForm.duration, 10)
      };

      if (isEditing) {
        payload.id = parseInt(existingQuiz.id, 10);
        payload.quiz_id = parseInt(existingQuiz.id, 10);
      }

      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok || data.success) {
        alert(data.message || data.success || (isEditing ? "Quiz Updated Successfully!" : "Quiz Created Successfully!"));
        const newQuizId = (data.data?.quiz_id || data.quiz_id || data.id || (isEditing ? existingQuiz.id : "1")).toString();
        saveCourseQuizMapping(selectedCourseId, newQuizId);
        setQuizIdForQuestion(newQuizId);
        setExistingQuiz({
          id: newQuizId,
          title: quizForm.title,
          total_marks: quizForm.total_marks,
          passing_marks: quizForm.passing_marks,
          duration: quizForm.duration
        });

        // Reload existing quizzes list to show updated details
        const coursesRes = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const coursesData = await coursesRes.json();
        if (coursesData.success && coursesData.data) {
          fetchAllExistingQuizzes(coursesData.data);
        }
      } else {
        alert(data.error || "Failed to save quiz.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const adminUserId = localStorage.getItem('adminUserId') || localStorage.getItem('userId') || 2;
      const payload = {
        user_id: parseInt(adminUserId, 10),
        quiz_id: parseInt(quizIdForQuestion, 10),
        question: questionForm.question,
        option1: questionForm.option1,
        option2: questionForm.option2,
        option3: questionForm.option3,
        option4: questionForm.option4,
        correct_answer: questionForm.correct_answer
      };

      const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok || data.success) {
        alert(data.message || data.success || "Question Added Successfully!");

        const refreshed = await fetchQuizById(quizIdForQuestion);
        if (refreshed) {
          setAllQuizzes(prev => prev.map(q => {
            if (q.id.toString() === quizIdForQuestion.toString()) {
              return { ...q, questions: refreshed.questions };
            }
            return q;
          }));
        } else {
          const newQuestionObj = {
            id: data.data?.question_id || data.question_id || Date.now().toString(),
            question: questionForm.question,
            option1: questionForm.option1,
            option2: questionForm.option2,
            option3: questionForm.option3,
            option4: questionForm.option4,
            correct_answer: questionForm.correct_answer
          };

          setAllQuizzes(prev => prev.map(q => {
            if (q.id.toString() === quizIdForQuestion.toString()) {
              return {
                ...q,
                questions: [...(q.questions || []), newQuestionObj]
              };
            }
            return q;
          }));
        }

        setQuestionForm({
          question: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correct_answer: ''
        });
      } else {
        alert(data.error || "Failed to add question.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding question.");
    } finally {
      setIsLoading(false);
    }
  };

  const [activeAddQuestionQuizId, setActiveAddQuestionQuizId] = useState(null);
  const [activeEditQuestionId, setActiveEditQuestionId] = useState(null);
  const [modalQuestionForm, setModalQuestionForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_answer: ''
  });

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this entire quiz?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/?quiz_id=${quizId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok || data.success) {
        alert(data.message || data.success || "Quiz Deleted Successfully!");
        setAllQuizzes(prev => prev.filter(q => q.id !== quizId.toString()));
        if (existingQuiz && existingQuiz.id.toString() === quizId.toString()) {
          setExistingQuiz(null);
        }
      } else {
        alert(data.error || "Failed to delete quiz.");
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
      alert("Error deleting quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (quizId, questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/?question_id=${questionId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok || data.success) {
        alert(data.message || data.success || "Question Deleted Successfully!");
        setAllQuizzes(prev => prev.map(q => {
          if (q.id.toString() === quizId.toString()) {
            return {
              ...q,
              questions: q.questions.filter(quest => (quest.id || quest.question_id || quest.order)?.toString() !== questionId.toString())
            };
          }
          return q;
        }));
      } else {
        alert(data.error || "Failed to delete question.");
      }
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Error deleting question.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!activeAddQuestionQuizId) return;
    setIsLoading(true);
    try {
      const adminUserId = localStorage.getItem('adminUserId') || localStorage.getItem('userId') || 2;
      const isEditing = !!activeEditQuestionId;
      const payload = {
        user_id: parseInt(adminUserId, 10),
        quiz_id: parseInt(activeAddQuestionQuizId, 10),
        question: modalQuestionForm.question,
        option1: modalQuestionForm.option1,
        option2: modalQuestionForm.option2,
        option3: modalQuestionForm.option3,
        option4: modalQuestionForm.option4,
        correct_answer: modalQuestionForm.correct_answer
      };

      if (isEditing) {
        payload.question_id = activeEditQuestionId;
      }

      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok || data.success) {
        alert(data.message || data.success || (isEditing ? "Question Updated Successfully!" : "Question Added Successfully!"));

        const refreshed = await fetchQuizById(activeAddQuestionQuizId);
        if (refreshed) {
          setAllQuizzes(prev => prev.map(q => {
            if (q.id.toString() === activeAddQuestionQuizId.toString()) {
              return { ...q, questions: refreshed.questions };
            }
            return q;
          }));
        } else {
          const newQuestionObj = {
            id: isEditing ? activeEditQuestionId : (data.data?.question_id || data.question_id || Date.now().toString()),
            question: modalQuestionForm.question,
            option1: modalQuestionForm.option1,
            option2: modalQuestionForm.option2,
            option3: modalQuestionForm.option3,
            option4: modalQuestionForm.option4,
            correct_answer: modalQuestionForm.correct_answer
          };

          setAllQuizzes(prev => prev.map(q => {
            if (q.id.toString() === activeAddQuestionQuizId.toString()) {
              if (isEditing) {
                 return {
                   ...q,
                   questions: q.questions.map(quest => (quest.id || quest.question_id || quest.order)?.toString() === activeEditQuestionId.toString() ? newQuestionObj : quest)
                 };
              } else {
                 return {
                   ...q,
                   questions: [...(q.questions || []), newQuestionObj]
                 };
              }
            }
            return q;
          }));
        }

        setModalQuestionForm({
          question: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correct_answer: ''
        });
        setActiveAddQuestionQuizId(null);
        setActiveEditQuestionId(null);
      } else {
        alert(data.error || "Failed to save question.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving question.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-6 text-left space-y-4 sm:space-y-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6 px-2 sm:px-0">
        <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800">Manage Quizzes & Questions</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Step 1: Create Quiz */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div 
            className="p-3 sm:p-6 flex justify-between items-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
            onClick={() => setIsStep1Open(!isStep1Open)}
          >
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-0.5">Step 1: Create Course Quiz</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">Configure the duration and parameters for the final exam.</p>
            </div>
            <div className="text-slate-400 p-2">{isStep1Open ? '▲' : '▼'}</div>
          </div>

          {isStep1Open && (
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Course</label>
            <select 
              value={selectedCourseId} 
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full max-w-full truncate border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {/* Quiz Status Card */}
          {checkingQuiz ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center">
              <span className="text-slate-500 font-medium text-sm animate-pulse">Checking for existing quiz...</span>
            </div>
          ) : existingQuiz ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-800 font-bold text-sm flex items-center gap-1.5">
                  <span>✨</span> Quiz Already Exists
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Quiz ID: {existingQuiz.id}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Title:</strong> {existingQuiz.title}</p>
                <p><strong>Total Marks:</strong> {existingQuiz.total_marks} | <strong>Passing Marks:</strong> {existingQuiz.passing_marks}</p>
                <p><strong>Duration:</strong> {existingQuiz.duration} minutes</p>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-2">
                ℹ️ This Quiz ID is now automatically selected in Step 2 below so you can add questions directly!
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <span className="text-amber-800 font-bold text-sm flex items-center gap-1.5">
                <span>📝</span> No Quiz Created Yet
              </span>
              <p className="text-xs text-slate-600 mt-1">
                There is no quiz configured for this course. Fill out the parameters below to create the quiz first.
              </p>
            </div>
          )}

          <form onSubmit={handleCreateQuiz} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Quiz Title</label>
              <input 
                type="text" 
                name="title" 
                value={quizForm.title} 
                onChange={handleQuizChange} 
                required 
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Total Marks</label>
                <input 
                  type="number" 
                  name="total_marks" 
                  value={quizForm.total_marks} 
                  onChange={handleQuizChange} 
                  required 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Passing Marks</label>
                <input 
                  type="number" 
                  name="passing_marks" 
                  value={quizForm.passing_marks} 
                  onChange={handleQuizChange} 
                  required 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input 
                type="number" 
                name="duration" 
                value={quizForm.duration} 
                onChange={handleQuizChange} 
                required 
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" 
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-[#7c3aed] text-white font-bold py-3 rounded-xl hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : existingQuiz ? 'Update Quiz Parameters' : 'Create Quiz'}
              </button>
              {existingQuiz && (
                <button 
                  type="button"
                  onClick={() => handleDeleteQuiz(existingQuiz.id)}
                  disabled={isLoading}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-5 py-3 rounded-xl transition-colors border border-rose-200 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
            </div>
          )}
        </div>

        {/* Step 2: Add Questions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div 
            className="p-3 sm:p-6 flex justify-between items-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
            onClick={() => setIsStep2Open(!isStep2Open)}
          >
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-0.5">Step 2: Add Questions to Quiz</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">Insert Multiple Choice Questions (MCQs) into the specific Quiz ID.</p>
            </div>
            <div className="text-slate-400 p-2">{isStep2Open ? '▲' : '▼'}</div>
          </div>

          {isStep2Open && (
            <div className="p-3 sm:p-6">
          <form onSubmit={handleCreateQuestion} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Quiz (ID & Title)</label>
              {quizzesLoading ? (
                <div className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-slate-500 text-sm animate-pulse">
                  Loading created quizzes...
                </div>
              ) : allQuizzes.length > 0 ? (
                <select 
                  value={quizIdForQuestion} 
                  onChange={(e) => setQuizIdForQuestion(e.target.value)}
                  required 
                  className="w-full max-w-full truncate border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                >
                  <option value="">-- Select a Quiz --</option>
                  {allQuizzes.map(q => (
                    <option key={q.id} value={q.id}>
                      ID: {q.id} | {q.title} ({q.courseTitle})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  ⚠️ No quizzes created yet. Please create a quiz in Step 1 first to add questions!
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Question Text</label>
              <input 
                type="text" 
                name="question" 
                value={questionForm.question} 
                onChange={handleQuestionChange} 
                required 
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Option 1</label>
                <input 
                  type="text" 
                  name="option1" 
                  value={questionForm.option1} 
                  onChange={handleQuestionChange} 
                  required 
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Option 2</label>
                <input 
                  type="text" 
                  name="option2" 
                  value={questionForm.option2} 
                  onChange={handleQuestionChange} 
                  required 
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Option 3</label>
                <input 
                  type="text" 
                  name="option3" 
                  value={questionForm.option3} 
                  onChange={handleQuestionChange} 
                  required 
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Option 4</label>
                <input 
                  type="text" 
                  name="option4" 
                  value={questionForm.option4} 
                  onChange={handleQuestionChange} 
                  required 
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer (Exactly matches one option)</label>
              <input 
                type="text" 
                name="correct_answer" 
                value={questionForm.correct_answer} 
                onChange={handleQuestionChange} 
                required 
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#7c3aed] text-white font-bold py-3 rounded-xl hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Question API'}
            </button>
          </form>
            </div>
          )}
        </div>
      </div>

      {/* Premium Dashboard section: All Quizzes & Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4 sm:mb-0">
        <div 
          className="p-3 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
          onClick={(e) => {
            if (e.target.tagName.toLowerCase() !== 'select' && e.target.tagName.toLowerCase() !== 'option') {
              setIsAllQuizzesOpen(!isAllQuizzesOpen);
            }
          }}
        >
          <div className="flex-1 w-full flex justify-between items-center">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-0.5">All Quizzes & Created Questions</h3>
              <p className="text-[10px] sm:text-sm text-slate-500">View and manage all course quizzes and their respective MCQ questions.</p>
            </div>
            <div className="text-slate-400 p-2 md:hidden">{isAllQuizzesOpen ? '▲' : '▼'}</div>
          </div>
          
          {/* Custom Dropdown to Filter by Course/Project */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto shrink-0 relative" onClick={e => e.stopPropagation()}>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">🔍 Filter by Course:</span>
            
            <div className="relative w-full sm:w-auto">
              <div 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="border-2 border-slate-200 rounded-xl p-2 font-medium text-sm text-slate-700 focus:border-[#7c3aed] focus:outline-none w-full sm:min-w-[200px] sm:max-w-xs bg-white cursor-pointer flex justify-between items-center gap-2"
              >
                <span className="truncate">
                  {filterCourseId === 'all' 
                    ? '✨ Show All Courses' 
                    : courses.find(c => c.id.toString() === filterCourseId)?.title || '✨ Show All Courses'}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">{isFilterDropdownOpen ? '▲' : '▼'}</span>
              </div>

              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 sm:left-auto sm:right-0 w-full sm:w-max sm:min-w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div 
                    className={`p-3 text-sm font-medium cursor-pointer transition-colors border-b border-slate-100 ${filterCourseId === 'all' ? 'bg-[#7c3aed]/10 text-[#7c3aed]' : 'hover:bg-slate-50 text-slate-700'}`}
                    onClick={() => { setFilterCourseId('all'); setIsFilterDropdownOpen(false); }}
                  >
                    ✨ Show All Courses
                  </div>
                  {courses.map(c => (
                    <div 
                      key={c.id} 
                      className={`p-3 text-sm font-medium cursor-pointer transition-colors ${filterCourseId === c.id.toString() ? 'bg-[#7c3aed]/10 text-[#7c3aed]' : 'hover:bg-slate-50 text-slate-700'}`}
                      onClick={() => { setFilterCourseId(c.id.toString()); setIsFilterDropdownOpen(false); }}
                    >
                      {c.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-slate-400 p-2 hidden md:block">{isAllQuizzesOpen ? '▲' : '▼'}</div>
        </div>

        {isAllQuizzesOpen && (
          <div className="p-3 sm:p-6 pt-4 space-y-4 sm:space-y-6">
        {quizzesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7c3aed]"></div>
            <span className="ml-3 text-slate-600 font-medium">Loading Quizzes & Questions...</span>
          </div>
        ) : allQuizzes.length > 0 ? (() => {
          const filteredQuizzes = filterCourseId === 'all' 
            ? allQuizzes 
            : allQuizzes.filter(q => q.courseId?.toString() === filterCourseId.toString());

          if (filteredQuizzes.length === 0) {
            return (
              <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-xl p-12 text-center font-semibold text-lg">
                No quiz created for the selected course.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 gap-8">
              {filteredQuizzes.map(quiz => (
                <div key={quiz.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Quiz Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200 uppercase tracking-wider">
                          Quiz ID: {quiz.id}
                        </span>
                        <h4 className="text-xl font-bold text-slate-800 mt-2">{quiz.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">📚 {quiz.courseTitle}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleEditQuizFromList(quiz)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm shadow-indigo-500/10"
                        >
                          <span>✏️</span> Edit Quiz Params
                        </button>
                        <button
                          onClick={() => {
                            setActiveAddQuestionQuizId(quiz.id);
                            setActiveEditQuestionId(null);
                            setModalQuestionForm({
                              question: '',
                              option1: '',
                              option2: '',
                              option3: '',
                              option4: '',
                              correct_answer: ''
                            });
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm shadow-emerald-500/10"
                        >
                          <span>➕</span> Add Question
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 border border-rose-200"
                        >
                          <span>🗑️</span> Delete Quiz
                        </button>
                      </div>
                    </div>

                    {/* Quiz Parameters */}
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl">
                      <div>⏱️ <span className="text-slate-700">{quiz.duration} Minutes</span></div>
                      <div className="text-slate-300">|</div>
                      <div>🎯 Passing Marks: <span className="text-emerald-600">{quiz.passing_marks}</span></div>
                      <div className="text-slate-300">|</div>
                      <div>💯 Total Marks: <span className="text-slate-800">{quiz.total_marks}</span></div>
                      <div className="text-slate-300">|</div>
                      <div>📝 Questions count: <span className="text-slate-800">{(quiz.questions || []).length}</span></div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4 pt-2">
                      <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider">MCQ Questions:</h5>
                      
                      {(!quiz.questions || quiz.questions.length === 0) ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium text-center">
                          ⚠️ No questions added to this quiz yet! Use the "Add Question" button above to add one.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {quiz.questions.map((quest, qIdx) => {
                            const questionId = quest.id || quest.question_id || quest.order || qIdx;
                            return (
                              <div key={questionId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group text-left">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                  <h6 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                                    Q{qIdx + 1}: {quest.question}
                                  </h6>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setActiveAddQuestionQuizId(quiz.id);
                                        setActiveEditQuestionId(questionId);
                                        setModalQuestionForm({
                                          question: quest.question,
                                          option1: quest.option1,
                                          option2: quest.option2,
                                          option3: quest.option3,
                                          option4: quest.option4,
                                          correct_answer: quest.correct_answer
                                        });
                                      }}
                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100 flex items-center justify-center shrink-0"
                                      title="Edit Question"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(quiz.id, questionId)}
                                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-100 flex items-center justify-center shrink-0"
                                      title="Delete Question"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                                  {[quest.option1, quest.option2, quest.option3, quest.option4].map((opt, oIdx) => {
                                    const isCorrect = opt === quest.correct_answer;
                                    return (
                                      <div
                                        key={oIdx}
                                        className={`px-3 py-2 rounded-lg border font-semibold ${
                                          isCorrect
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold ring-2 ring-emerald-500/10'
                                            : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                      >
                                        <span className="mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                        {isCorrect && <span className="ml-1.5 text-xs text-emerald-600 font-extrabold">(Correct)</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })() : (
          <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-xl p-12 text-center font-semibold text-lg">
            No quizzes created in the system yet.
          </div>
        )}
          </div>
        )}
      </div>

      {/* Quick Add Question Modal */}
      {activeAddQuestionQuizId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{activeEditQuestionId ? 'Edit MCQ Question' : 'Add MCQ Question'}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adding to Quiz ID: {activeAddQuestionQuizId} | {allQuizzes.find(q => q.id.toString() === activeAddQuestionQuizId.toString())?.title}
                </p>
              </div>
              <button
                onClick={() => { setActiveAddQuestionQuizId(null); setActiveEditQuestionId(null); }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalQuestionSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Question Text</label>
                <input
                  type="text"
                  required
                  value={modalQuestionForm.question}
                  onChange={(e) => setModalQuestionForm({ ...modalQuestionForm, question: e.target.value })}
                  placeholder="e.g. What is the founder of world scouting?"
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Option 1</label>
                  <input
                    type="text"
                    required
                    value={modalQuestionForm.option1}
                    onChange={(e) => setModalQuestionForm({ ...modalQuestionForm, option1: e.target.value })}
                    placeholder="Option A"
                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Option 2</label>
                  <input
                    type="text"
                    required
                    value={modalQuestionForm.option2}
                    onChange={(e) => setModalQuestionForm({ ...modalQuestionForm, option2: e.target.value })}
                    placeholder="Option B"
                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Option 3</label>
                  <input
                    type="text"
                    required
                    value={modalQuestionForm.option3}
                    onChange={(e) => setModalQuestionForm({ ...modalQuestionForm, option3: e.target.value })}
                    placeholder="Option C"
                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Option 4</label>
                  <input
                    type="text"
                    required
                    value={modalQuestionForm.option4}
                    onChange={(e) => setModalQuestionForm({ ...modalQuestionForm, option4: e.target.value })}
                    placeholder="Option D"
                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer</label>
                <select
                  required
                  value={modalQuestionForm.correct_answer}
                  onChange={(e) => setModalQuestionForm({ ...modalQuestionForm, correct_answer: e.target.value })}
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none bg-white text-sm"
                >
                  <option value="">-- Choose Correct Option --</option>
                  {modalQuestionForm.option1 && <option value={modalQuestionForm.option1}>{modalQuestionForm.option1}</option>}
                  {modalQuestionForm.option2 && <option value={modalQuestionForm.option2}>{modalQuestionForm.option2}</option>}
                  {modalQuestionForm.option3 && <option value={modalQuestionForm.option3}>{modalQuestionForm.option3}</option>}
                  {modalQuestionForm.option4 && <option value={modalQuestionForm.option4}>{modalQuestionForm.option4}</option>}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setActiveAddQuestionQuizId(null); setActiveEditQuestionId(null); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-xl transition-all text-sm shadow-md shadow-emerald-500/10 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : activeEditQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
