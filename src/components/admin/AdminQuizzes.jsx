import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const AdminQuizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

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
      const adminUserId = localStorage.getItem('adminUserId') || 2;
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
        if (data.quiz_id) {
          setQuizIdForQuestion(data.quiz_id.toString());
        }
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
      const adminUserId = localStorage.getItem('adminUserId') || 2;
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

          <form onSubmit={handleCreateQuiz} className="space-y-4">
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
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Quiz ID</label>
              <input 
                type="number" 
                value={quizIdForQuestion} 
                onChange={(e) => setQuizIdForQuestion(e.target.value)} 
                required 
                placeholder="E.g. 1"
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#7c3aed] focus:outline-none" 
              />
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
