import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import {
  fetchQuizzesForCourseAdmin,
  fetchQuestionsForQuiz,
  getAdminUserId,
  saveCourseQuizMapping,
  syncCourseQuizMappings
} from '../../utils/quizUtils';

const AdminQuizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState(null);
  const [checkingQuiz, setCheckingQuiz] = useState(false);

  // Quiz Form states
  const [quizForm, setQuizForm] = useState({
    title: 'Lesson Final Quiz',
    total_questions: 10,
    marks_per_question: 2,
    passing_marks: 12,
    duration: 30,
    is_final: true,
    is_active: true
  });

  // Question Form states
  const [quizIdForQuestion, setQuizIdForQuestion] = useState('');
  const [questionForm, setQuestionForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_answer: ''
  });

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [filterCourseId, setFilterCourseId] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [isStep1Open, setIsStep1Open] = useState(true);
  const [isStep2Open, setIsStep2Open] = useState(true);
  const [isAllQuizzesOpen, setIsAllQuizzesOpen] = useState(true);

  // Modal states for adding/editing questions
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

  const fetchAllExistingQuizzes = async (coursesList) => {
    setQuizzesLoading(true);
    const quizzesFound = [];
    try {
      for (const course of coursesList) {
        const quizzes = await fetchQuizzesForCourseAdmin(course.id);
        const mappedQuizzes = quizzes.map(q => ({
          ...q,
          courseTitle: course.title
        }));
        quizzesFound.push(...mappedQuizzes);
      }
    } catch (err) {
      console.error("Error fetching all quizzes:", err);
    }
    setAllQuizzes(quizzesFound);
    setQuizzesLoading(false);
    return quizzesFound;
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
          const loadedQuizzes = await fetchAllExistingQuizzes(data.data);
          if (loadedQuizzes.length > 0) {
            setQuizIdForQuestion(loadedQuizzes[0].id);
          }
          syncCourseQuizMappings(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const checkQuizForLesson = async (lessonId, currentCourseId = selectedCourseId, quizzesList = allQuizzes) => {
    if (!lessonId) {
      setExistingQuiz(null);
      return;
    }
    setCheckingQuiz(true);

    // 1. Check in already loaded quizzes
    const foundQuiz = quizzesList.find(q => q.lessonId?.toString() === lessonId.toString());
    if (foundQuiz) {
      setExistingQuiz(foundQuiz);
      setQuizForm({
        title: foundQuiz.title,
        total_questions: foundQuiz.total_questions || 10,
        marks_per_question: foundQuiz.marks_per_question || 2,
        passing_marks: foundQuiz.passing_marks || 12,
        duration: foundQuiz.duration || 30,
        is_final: foundQuiz.is_final !== false,
        is_active: foundQuiz.is_active !== false
      });
      setQuizIdForQuestion(foundQuiz.id);
      setCheckingQuiz(false);
      return;
    }

    // 2. Fetch directly from backend if not in cache
    try {
      if (currentCourseId) {
        const quizzes = await fetchQuizzesForCourseAdmin(currentCourseId);
        const directMatch = quizzes.find(q => q.lessonId?.toString() === lessonId.toString());
        if (directMatch) {
          const courseObj = courses.find(c => c.id.toString() === currentCourseId.toString());
          const fullQuiz = { ...directMatch, courseTitle: courseObj?.title || 'Course' };
          setExistingQuiz(fullQuiz);
          setQuizForm({
            title: fullQuiz.title,
            total_questions: fullQuiz.total_questions || 10,
            marks_per_question: fullQuiz.marks_per_question || 2,
            passing_marks: fullQuiz.passing_marks || 12,
            duration: fullQuiz.duration || 30,
            is_final: fullQuiz.is_final !== false,
            is_active: fullQuiz.is_active !== false
          });
          setQuizIdForQuestion(fullQuiz.id);
          setCheckingQuiz(false);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to check existing quiz:", err);
    }

    // Default values if no existing quiz found
    const lessonTitle = lessons.find(l => l.id.toString() === lessonId.toString())?.title || 'Lesson';
    setExistingQuiz(null);
    setQuizForm({
      title: `${lessonTitle} Quiz`,
      total_questions: 10,
      marks_per_question: 2,
      passing_marks: 12,
      duration: 30,
      is_final: true,
      is_active: true
    });
    setCheckingQuiz(false);
  };

  useEffect(() => {
    if (selectedCourseId) {
      const fetchLessonsForCourse = async () => {
        setLessonsLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/bsgupadmin/create-lesson/?course_id=${selectedCourseId}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setLessons(data.data);
            if (data.data.length > 0) {
              const firstLessonId = data.data[0].id.toString();
              setSelectedLessonId(firstLessonId);
              checkQuizForLesson(firstLessonId, selectedCourseId);
            } else {
              setSelectedLessonId('');
              setExistingQuiz(null);
            }
          } else {
            setLessons([]);
            setSelectedLessonId('');
            setExistingQuiz(null);
          }
        } catch (err) {
          console.error('Failed to fetch lessons:', err);
          setLessons([]);
          setSelectedLessonId('');
          setExistingQuiz(null);
        } finally {
          setLessonsLoading(false);
        }
      };
      fetchLessonsForCourse();
    } else {
      setLessons([]);
      setSelectedLessonId('');
      setExistingQuiz(null);
    }
  }, [selectedCourseId]);

  const handleLessonChange = (newLessonId) => {
    setSelectedLessonId(newLessonId);
    checkQuizForLesson(newLessonId, selectedCourseId);
  };

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
    if (quiz.lessonId) {
      setSelectedLessonId(quiz.lessonId);
    }
    setQuizForm({
      title: quiz.title,
      total_questions: quiz.total_questions || 10,
      marks_per_question: quiz.marks_per_question || 2,
      passing_marks: quiz.passing_marks,
      duration: quiz.duration,
      is_final: quiz.is_final !== false,
      is_active: quiz.is_active !== false
    });
    setExistingQuiz(quiz);
    setQuizIdForQuestion(quiz.id.toString());
    setIsStep1Open(true);
    setIsStep2Open(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionChange = (e) => {
    setQuestionForm({ ...questionForm, [e.target.name]: e.target.value });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedLessonId) {
      alert("Please select a target lesson before saving the quiz.");
      return;
    }
    setIsLoading(true);
    const isEditing = !!existingQuiz;
    const adminUserId = getAdminUserId();

    try {
      if (isEditing) {
        // Update existing quiz using PUT /bsgupadmin/create-quiz/
        const payload = {
          user_id: parseInt(adminUserId, 10),
          quiz_id: parseInt(existingQuiz.id, 10),
          title: quizForm.title,
          total_questions: parseInt(quizForm.total_questions, 10),
          marks_per_question: parseInt(quizForm.marks_per_question, 10),
          passing_marks: parseInt(quizForm.passing_marks, 10),
          duration: parseInt(quizForm.duration, 10),
          is_final: quizForm.is_final,
          is_active: quizForm.is_active
        };

        const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok || data.success) {
          alert(data.message || "Quiz Updated Successfully!");
          const updatedQuizzes = await fetchAllExistingQuizzes(courses);
          checkQuizForLesson(selectedLessonId, selectedCourseId, updatedQuizzes);
        } else {
          alert(data.message || data.error || "Failed to update quiz.");
        }
      } else {
        // Create new quiz using POST /bsgupadmin/create-quiz/
        const payload = {
          user_id: parseInt(adminUserId, 10),
          lesson: parseInt(selectedLessonId, 10),
          title: quizForm.title,
          total_questions: parseInt(quizForm.total_questions, 10),
          marks_per_question: parseInt(quizForm.marks_per_question, 10),
          passing_marks: parseInt(quizForm.passing_marks, 10),
          duration: parseInt(quizForm.duration, 10),
          is_final: quizForm.is_final,
          is_active: quizForm.is_active
        };

        const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && (data.success === true || data.data)) {
          alert(data.message || "Quiz Created Successfully! You can now add questions in Step 2 below.");
          const newQuizId = (data.data?.id || data.data?.quiz_id || data.quiz_id || data.id).toString();
          setQuizIdForQuestion(newQuizId);
          saveCourseQuizMapping(selectedCourseId, newQuizId);
          setIsStep2Open(true);
          const updatedQuizzes = await fetchAllExistingQuizzes(courses);
          checkQuizForLesson(selectedLessonId, selectedCourseId, updatedQuizzes);
        } else if (data.message && data.message.toLowerCase().includes('already exists')) {
          alert("Quiz already exists for this lesson! Loading existing quiz details...");
          const updatedQuizzes = await fetchAllExistingQuizzes(courses);
          checkQuizForLesson(selectedLessonId, selectedCourseId, updatedQuizzes);
          setIsStep2Open(true);
        } else {
          alert(data.message || data.error || "Failed to create quiz.");
        }
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      alert("Error saving quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!quizIdForQuestion) {
      alert("Please select a target quiz first.");
      return;
    }
    if (!questionForm.question.trim()) {
      alert("Please enter question text.");
      return;
    }
    if (!questionForm.option1 || !questionForm.option2 || !questionForm.option3 || !questionForm.option4) {
      alert("Please enter all 4 options.");
      return;
    }
    if (!questionForm.correct_answer.trim()) {
      alert("Please specify the correct answer.");
      return;
    }

    setIsLoading(true);
    const adminUserId = getAdminUserId();

    try {
      const payload = {
        user_id: parseInt(adminUserId, 10),
        quiz_id: parseInt(quizIdForQuestion, 10),
        questions: [
          {
            question: questionForm.question.trim(),
            option1: questionForm.option1.trim(),
            option2: questionForm.option2.trim(),
            option3: questionForm.option3.trim(),
            option4: questionForm.option4.trim(),
            correct_answer: questionForm.correct_answer.trim()
          }
        ]
      };

      const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && (data.success === true || data.status === 201)) {
        alert(data.message || "Question Added Successfully!");

        // Refresh questions for this quiz
        const updatedQuestions = await fetchQuestionsForQuiz(quizIdForQuestion);
        setAllQuizzes(prev => prev.map(q => {
          if (q.id.toString() === quizIdForQuestion.toString()) {
            return { ...q, questions: updatedQuestions };
          }
          return q;
        }));

        setQuestionForm({
          question: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correct_answer: ''
        });
      } else {
        alert(data.message || data.error || "Failed to add question.");
      }
    } catch (err) {
      console.error("Error adding question:", err);
      alert("Error adding question.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this entire quiz?")) return;
    setIsLoading(true);
    const adminUserId = getAdminUserId();
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/?quiz_id=${quizId}&user_id=${adminUserId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok || data.success) {
        alert(data.message || "Quiz Deleted Successfully!");
        setAllQuizzes(prev => prev.filter(q => q.id !== quizId.toString()));
        if (existingQuiz && existingQuiz.id.toString() === quizId.toString()) {
          setExistingQuiz(null);
        }
        if (quizIdForQuestion.toString() === quizId.toString()) {
          setQuizIdForQuestion('');
        }
      } else {
        alert(data.message || data.error || "Failed to delete quiz.");
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
    const adminUserId = getAdminUserId();
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/?question_id=${questionId}&user_id=${adminUserId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok || data.success) {
        alert(data.message || "Question Deleted Successfully!");
        const updatedQuestions = await fetchQuestionsForQuiz(quizId);
        setAllQuizzes(prev => prev.map(q => {
          if (q.id.toString() === quizId.toString()) {
            return { ...q, questions: updatedQuestions };
          }
          return q;
        }));
      } else {
        alert(data.message || data.error || "Failed to delete question.");
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
    const adminUserId = getAdminUserId();
    const isEditing = !!activeEditQuestionId;

    try {
      if (isEditing) {
        // Direct question PUT
        const payload = {
          user_id: parseInt(adminUserId, 10),
          question_id: parseInt(activeEditQuestionId, 10),
          question: modalQuestionForm.question.trim(),
          option1: modalQuestionForm.option1.trim(),
          option2: modalQuestionForm.option2.trim(),
          option3: modalQuestionForm.option3.trim(),
          option4: modalQuestionForm.option4.trim(),
          correct_answer: modalQuestionForm.correct_answer.trim()
        };

        const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok || data.success) {
          alert(data.message || "Question Updated Successfully!");
          const updatedQuestions = await fetchQuestionsForQuiz(activeAddQuestionQuizId);
          setAllQuizzes(prev => prev.map(q => {
            if (q.id.toString() === activeAddQuestionQuizId.toString()) {
              return { ...q, questions: updatedQuestions };
            }
            return q;
          }));
          setActiveAddQuestionQuizId(null);
          setActiveEditQuestionId(null);
        } else {
          alert(data.message || data.error || "Failed to update question.");
        }
      } else {
        // Direct question POST
        const payload = {
          user_id: parseInt(adminUserId, 10),
          quiz_id: parseInt(activeAddQuestionQuizId, 10),
          questions: [
            {
              question: modalQuestionForm.question.trim(),
              option1: modalQuestionForm.option1.trim(),
              option2: modalQuestionForm.option2.trim(),
              option3: modalQuestionForm.option3.trim(),
              option4: modalQuestionForm.option4.trim(),
              correct_answer: modalQuestionForm.correct_answer.trim()
            }
          ]
        };

        const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && (data.success === true || data.status === 201)) {
          alert(data.message || "Question Added Successfully!");
          const updatedQuestions = await fetchQuestionsForQuiz(activeAddQuestionQuizId);
          setAllQuizzes(prev => prev.map(q => {
            if (q.id.toString() === activeAddQuestionQuizId.toString()) {
              return { ...q, questions: updatedQuestions };
            }
            return q;
          }));
          setActiveAddQuestionQuizId(null);
          setActiveEditQuestionId(null);
        } else {
          alert(data.message || data.error || "Failed to add question.");
        }
      }
    } catch (err) {
      console.error("Error saving modal question:", err);
      alert("Error saving question.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-6 text-left space-y-4 sm:space-y-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6 px-2 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800">Manage Quizzes & Questions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create lesson quizzes, configure marks and passing criteria, and manage MCQ questions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Step 1: Create Quiz */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div
            className="p-3 sm:p-6 flex justify-between items-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
            onClick={() => setIsStep1Open(!isStep1Open)}
          >
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-0.5">Step 1: Create / Edit Lesson Quiz</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">Configure quiz title, duration, marks, and passing criteria.</p>
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
                  className="w-full max-w-full truncate border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none bg-white text-sm"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Target Lesson</label>
                {lessonsLoading ? (
                  <div className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-slate-500 text-sm animate-pulse">
                    Loading lessons...
                  </div>
                ) : lessons.length > 0 ? (
                  <select
                    value={selectedLessonId}
                    onChange={(e) => handleLessonChange(e.target.value)}
                    className="w-full max-w-full truncate border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none bg-white text-sm"
                  >
                    {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    ⚠️ No lessons found for this course. Please create a lesson first!
                  </div>
                )}
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
                      <span>✨</span> Quiz Already Exists for This Lesson
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Quiz ID: {existingQuiz.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong>Title:</strong> {existingQuiz.title}</p>
                    <p><strong>Total Questions:</strong> {existingQuiz.total_questions} | <strong>Marks per Question:</strong> {existingQuiz.marks_per_question}</p>
                    <p><strong>Passing Marks:</strong> {existingQuiz.passing_marks} | <strong>Duration:</strong> {existingQuiz.duration} minutes</p>
                    <p><strong>Status:</strong> {existingQuiz.is_active ? 'Active' : 'Inactive'} | {existingQuiz.is_final ? 'Final Exam' : 'Lesson Quiz'}</p>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                    ✅ Quiz ID #{existingQuiz.id} is automatically selected in Step 2 below to add questions!
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <span className="text-amber-800 font-bold text-sm flex items-center gap-1.5">
                    <span>📝</span> No Quiz Created Yet for This Lesson
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    Fill out the parameters below and click "Create Quiz" to create the quiz.
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
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total Questions</label>
                    <input
                      type="number"
                      name="total_questions"
                      value={quizForm.total_questions}
                      onChange={handleQuizChange}
                      required
                      min="1"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Marks per Question</label>
                    <input
                      type="number"
                      name="marks_per_question"
                      value={quizForm.marks_per_question}
                      onChange={handleQuizChange}
                      required
                      min="1"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Passing Marks</label>
                    <input
                      type="number"
                      name="passing_marks"
                      value={quizForm.passing_marks}
                      onChange={handleQuizChange}
                      required
                      min="1"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      value={quizForm.duration}
                      onChange={handleQuizChange}
                      required
                      min="1"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-6 items-center py-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      name="is_final"
                      checked={quizForm.is_final}
                      onChange={(e) => setQuizForm({ ...quizForm, is_final: e.target.checked })}
                      className="rounded border-slate-300 text-[#7c3aed] focus:ring-[#7c3aed]"
                    />
                    Is Final Exam
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={quizForm.is_active}
                      onChange={(e) => setQuizForm({ ...quizForm, is_active: e.target.checked })}
                      className="rounded border-slate-300 text-[#7c3aed] focus:ring-[#7c3aed]"
                    />
                    Is Active
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || !selectedLessonId}
                    className="flex-1 bg-[#7c3aed] text-white font-bold py-3 rounded-xl hover:bg-[#6d28d9] transition-colors disabled:opacity-50 text-sm shadow-sm"
                  >
                    {isLoading ? 'Saving...' : existingQuiz ? 'Update Quiz Parameters' : 'Create Quiz'}
                  </button>
                  {existingQuiz && (
                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(existingQuiz.id)}
                      disabled={isLoading}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-5 py-3 rounded-xl transition-colors border border-rose-200 disabled:opacity-50 text-sm"
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
              <form onSubmit={handleCreateQuestion} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Target Quiz (Select Quiz to Add Question)</label>
                  {quizzesLoading ? (
                    <div className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-slate-500 text-sm animate-pulse">
                      Loading quizzes...
                    </div>
                  ) : allQuizzes.length > 0 ? (
                    <select
                      value={quizIdForQuestion}
                      onChange={(e) => setQuizIdForQuestion(e.target.value)}
                      required
                      className="w-full max-w-full truncate border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none bg-white font-medium text-sm"
                    >
                      <option value="">-- Select a Quiz --</option>
                      {allQuizzes.map(q => (
                        <option key={q.id} value={q.id}>
                          Quiz #{q.id}: {q.title} ({q.courseTitle} - {q.lessonTitle})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                      ⚠️ No quizzes found. Please create a quiz in Step 1 first!
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
                    placeholder="Enter question..."
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
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
                      placeholder="Option A"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
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
                      placeholder="Option B"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
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
                      placeholder="Option C"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
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
                      placeholder="Option D"
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    name="correct_answer"
                    value={questionForm.correct_answer}
                    onChange={handleQuestionChange}
                    required
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none bg-white text-sm"
                  >
                    <option value="">-- Choose Correct Option --</option>
                    {questionForm.option1 && <option value={questionForm.option1}>{questionForm.option1}</option>}
                    {questionForm.option2 && <option value={questionForm.option2}>{questionForm.option2}</option>}
                    {questionForm.option3 && <option value={questionForm.option3}>{questionForm.option3}</option>}
                    {questionForm.option4 && <option value={questionForm.option4}>{questionForm.option4}</option>}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !quizIdForQuestion}
                  className="w-full bg-[#7c3aed] text-white font-bold py-3 rounded-xl hover:bg-[#6d28d9] transition-colors disabled:opacity-50 text-sm shadow-sm"
                >
                  {isLoading ? 'Adding Question...' : 'Add Question'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* All Quizzes & Questions Section */}
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
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-0.5">All Quizzes & Questions</h3>
              <p className="text-[10px] sm:text-sm text-slate-500">View and manage all course quizzes and their respective MCQ questions.</p>
            </div>
            <div className="text-slate-400 p-2 md:hidden">{isAllQuizzesOpen ? '▲' : '▼'}</div>
          </div>

          {/* Filter by Course */}
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
                              Quiz ID: #{quiz.id}
                            </span>
                            <h4 className="text-xl font-bold text-slate-800 mt-2">{quiz.title}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">📚 {quiz.courseTitle} • 📖 {quiz.lessonTitle}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleEditQuizFromList(quiz)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
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
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
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
                          <div>📖 Lesson: <span className="text-slate-800">{quiz.lessonTitle}</span></div>
                          <div className="text-slate-300">|</div>
                          <div>⏱️ <span className="text-slate-700">{quiz.duration} Minutes</span></div>
                          <div className="text-slate-300">|</div>
                          <div>🎯 Passing Marks: <span className="text-emerald-600">{quiz.passing_marks}</span></div>
                          <div className="text-slate-300">|</div>
                          <div>❓ Questions: <span className="text-slate-800">{(quiz.questions || []).length} / {quiz.total_questions}</span></div>
                          <div className="text-slate-300">|</div>
                          <div>💯 Marks/Question: <span className="text-slate-800">{quiz.marks_per_question}</span></div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-4 pt-2">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                              MCQ Questions ({(quiz.questions || []).length}):
                            </h5>
                          </div>

                          {(!quiz.questions || quiz.questions.length === 0) ? (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium text-center">
                              ⚠️ No questions added to this quiz yet! Click "Add Question" above to add one.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4">
                              {quiz.questions.map((quest, qIdx) => {
                                const questionId = quest.id || quest.question_id || qIdx;
                                return (
                                  <div key={questionId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group text-left">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                      <h6 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                                        Q{qIdx + 1}: {quest.question}
                                      </h6>
                                      <div className="flex gap-2 shrink-0">
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
                                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100 flex items-center justify-center"
                                          title="Edit Question"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() => handleDeleteQuestion(quiz.id, questionId)}
                                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-100 flex items-center justify-center"
                                          title="Delete Question"
                                        >
                                          🗑️
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

      {/* Quick Add / Edit Question Modal */}
      {activeAddQuestionQuizId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{activeEditQuestionId ? 'Edit MCQ Question' : 'Add MCQ Question'}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quiz ID: #{activeAddQuestionQuizId} | {allQuizzes.find(q => q.id.toString() === activeAddQuestionQuizId.toString())?.title}
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
                  placeholder="Enter question..."
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none text-sm"
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
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-xl transition-all text-sm shadow-md disabled:opacity-50"
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
