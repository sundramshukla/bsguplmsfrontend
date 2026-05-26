import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

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

  const fetchAllExistingQuizzes = async (coursesList) => {
    setQuizzesLoading(true);
    const quizzesFound = [];
    try {
      // Query Quiz IDs 1 to 50 in parallel
      const idList = Array.from({ length: 50 }, (_, i) => i + 1);
      const promises = idList.map(async (qId) => {
        try {
          const res = await fetch(`${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=${qId}`);
          if (res.ok) {
            const data = await res.json();
            const quizObj = data.title ? data : (data.data || {});
            if (quizObj && quizObj.title) {
              const courseId = quizObj.course_id || data.course_id || qId;
              const courseTitle = coursesList.find(c => c.id.toString() === courseId.toString())?.title || `Course #${courseId}`;
              return {
                id: qId.toString(),
                title: quizObj.title || `Quiz #${qId}`,
                courseTitle: courseTitle
              };
            }
          }
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
      const cachedQuizId = localStorage.getItem(`quiz_id_course_${courseId}`);
      const targetQuizId = cachedQuizId || courseId;

      const res = await fetch(`${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=${targetQuizId}`);
      if (res.ok) {
        const data = await res.json();
        const quizObj = data.title ? data : (data.data || {});
        if (quizObj && quizObj.title) {
          setExistingQuiz({
            id: targetQuizId,
            title: quizObj.title || "Course Final Quiz",
            total_marks: quizObj.total_marks || 100,
            passing_marks: quizObj.passing_marks || 60,
            duration: quizObj.duration || 30
          });
          setQuizIdForQuestion(targetQuizId.toString());
          setCheckingQuiz(false);
          return;
        }
      }

      // Try fallback course_id query
      const resCourse = await fetch(`${BASE_URL}/bsgupadmin/get-quiz/?course_id=${courseId}`);
      if (resCourse.ok) {
        const data = await resCourse.json();
        const quizObj = data.title ? data : (data.data || {});
        if (quizObj && quizObj.title) {
          const qId = quizObj.id || quizObj.quiz_id || courseId;
          setExistingQuiz({
            id: qId,
            title: quizObj.title || "Course Final Quiz",
            total_marks: quizObj.total_marks || 100,
            passing_marks: quizObj.passing_marks || 60,
            duration: quizObj.duration || 30
          });
          setQuizIdForQuestion(qId.toString());
          localStorage.setItem(`quiz_id_course_${courseId}`, qId.toString());
          setCheckingQuiz(false);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to check existing quiz:", err);
    }

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

  const handleQuestionChange = (e) => {
    setQuestionForm({ ...questionForm, [e.target.name]: e.target.value });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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

      const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok || data.success) {
        alert(data.message || data.success || "Quiz Created Successfully!");
        const newQuizId = (data.data?.quiz_id || data.quiz_id || data.id || "1").toString();
        localStorage.setItem(`quiz_id_course_${selectedCourseId}`, newQuizId);
        setQuizIdForQuestion(newQuizId);
        setExistingQuiz({
          id: newQuizId,
          title: quizForm.title,
          total_marks: quizForm.total_marks,
          passing_marks: quizForm.passing_marks,
          duration: quizForm.duration
        });

        // Add to dropdown list immediately
        const newQuizObj = {
          id: newQuizId,
          title: quizForm.title,
          courseTitle: courses.find(c => c.id.toString() === selectedCourseId.toString())?.title || `Course #${selectedCourseId}`
        };
        setAllQuizzes(prev => {
          if (prev.some(q => q.id === newQuizId)) return prev;
          return [...prev, newQuizObj];
        });
      } else {
        alert(data.error || "Failed to create quiz.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating quiz.");
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

  return (
    <div className="p-6 text-left space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">Manage Quizzes & Questions</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Create Quiz */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Step 1: Create Course Quiz</h3>
            <p className="text-xs text-slate-500">Configure the duration and parameters for the final exam.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Course</label>
            <select 
              value={selectedCourseId} 
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
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

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#7c3aed] text-white font-bold py-3 rounded-xl hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Quiz API'}
            </button>
          </form>
        </div>

        {/* Step 2: Add Questions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Step 2: Add Questions to Quiz</h3>
            <p className="text-xs text-slate-500">Insert Multiple Choice Questions (MCQs) into the specific Quiz ID.</p>
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-4">
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
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
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
      </div>
    </div>
  );
};

export default AdminQuizzes;
