import { BASE_URL } from '../config';

const COURSE_QUIZ_MAP_KEY = 'bsgup_course_quiz_map';

export const getCourseQuizMap = () => {
  try {
    return JSON.parse(localStorage.getItem(COURSE_QUIZ_MAP_KEY) || '{}');
  } catch {
    return {};
  }
};

export const saveCourseQuizMapping = (courseId, quizId) => {
  if (courseId == null || quizId == null) return;
  const courseIdStr = courseId.toString();
  const quizIdStr = quizId.toString();

  localStorage.setItem(`quiz_id_course_${courseIdStr}`, quizIdStr);

  const map = getCourseQuizMap();
  map[courseIdStr] = quizIdStr;
  localStorage.setItem(COURSE_QUIZ_MAP_KEY, JSON.stringify(map));
};

export const getCourseQuizId = (courseId) => {
  const courseIdStr = courseId?.toString();
  if (!courseIdStr) return null;
  const map = getCourseQuizMap();
  const fromMap = map[courseIdStr];
  if (fromMap) return fromMap;

  const fromCache = localStorage.getItem(`quiz_id_course_${courseIdStr}`);
  if (fromCache) return fromCache;

  return null;
};

export const getAdminUserId = () => {
  return localStorage.getItem('adminUserId') || localStorage.getItem('userId') || '1';
};

/**
 * Fetch all questions for a specific quiz ID
 */
export const fetchQuestionsForQuiz = async (quizId) => {
  if (!quizId) return [];
  const adminUserId = getAdminUserId();
  try {
    const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/?quiz_id=${quizId}&user_id=${adminUserId}`);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data.map((q, idx) => ({
        id: q.id || q.question_id || idx + 1,
        question_id: q.id || q.question_id || idx + 1,
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correct_answer: q.correct_answer,
        is_active: q.is_active !== false,
        quiz: q.quiz
      }));
    }
  } catch (err) {
    console.error(`Failed to fetch questions for quiz ${quizId}:`, err);
  }
  return [];
};

/**
 * Fetch quizzes for a course using the admin create-quiz endpoint
 */
export const fetchQuizzesForCourseAdmin = async (courseId) => {
  if (!courseId) return [];
  const adminUserId = getAdminUserId();
  try {
    const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/?course_id=${courseId}&user_id=${adminUserId}`);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.data)) {
      const quizzes = [];
      for (const item of data.data) {
        if (item.quiz && item.quiz.id) {
          const quizObj = item.quiz;
          const questions = await fetchQuestionsForQuiz(quizObj.id);
          quizzes.push({
            id: quizObj.id.toString(),
            lessonId: (quizObj.lesson || item.id).toString(),
            lessonTitle: quizObj.lesson_name || item.title || `Lesson ${item.id}`,
            courseId: courseId.toString(),
            title: quizObj.title || `Quiz for ${item.title}`,
            total_questions: quizObj.total_questions || questions.length || 10,
            marks_per_question: quizObj.marks_per_question || 2,
            total_marks: quizObj.total_marks || ((quizObj.total_questions || 10) * (quizObj.marks_per_question || 2)),
            passing_marks: quizObj.passing_marks || 12,
            duration: quizObj.duration || 30,
            is_final: quizObj.is_final !== false,
            is_active: quizObj.is_active !== false,
            questions: questions
          });
        }
      }
      return quizzes;
    }
  } catch (err) {
    console.error(`Failed to fetch quizzes for course ${courseId}:`, err);
  }
  return [];
};

/**
 * Fetch quiz for a course (for students or admin preview)
 */
export const fetchQuizForCourse = async (courseId, courseTitle = '') => {
  const courseIdStr = courseId.toString();

  // 1. Fetch using the proven create-quiz endpoint
  const quizzes = await fetchQuizzesForCourseAdmin(courseIdStr);
  if (quizzes.length > 0) {
    // Prefer the final quiz or the first available quiz with questions
    const finalQuiz = quizzes.find(q => q.is_final && q.questions.length > 0) ||
                      quizzes.find(q => q.questions.length > 0) ||
                      quizzes[0];
    
    if (finalQuiz) {
      saveCourseQuizMapping(courseIdStr, finalQuiz.id);
      return {
        quizId: finalQuiz.id,
        title: finalQuiz.title,
        duration: finalQuiz.duration,
        passing_marks: finalQuiz.passing_marks,
        total_questions: finalQuiz.total_questions,
        total_marks: finalQuiz.total_marks,
        marks_per_question: finalQuiz.marks_per_question,
        is_final: finalQuiz.is_final,
        questions: finalQuiz.questions
      };
    }
  }

  // 2. Check saved quiz mapping
  const mappedQuizId = getCourseQuizId(courseIdStr);
  if (mappedQuizId) {
    const questions = await fetchQuestionsForQuiz(mappedQuizId);
    if (questions.length > 0) {
      return {
        quizId: mappedQuizId.toString(),
        title: courseTitle ? `${courseTitle} Final Quiz` : 'Course Final Quiz',
        duration: 30,
        passing_marks: 12,
        total_questions: questions.length,
        total_marks: questions.length * 2,
        marks_per_question: 2,
        is_final: true,
        questions: questions
      };
    }
  }

  return null;
};

/**
 * Fetch quiz for a specific lesson
 */
export const fetchQuizForLesson = async (lessonId, courseId = null) => {
  if (!lessonId) return null;
  const lessonIdStr = lessonId.toString();

  if (courseId) {
    const quizzes = await fetchQuizzesForCourseAdmin(courseId);
    const matched = quizzes.find(q => q.lessonId === lessonIdStr);
    if (matched) return matched;
  }

  // If no courseId provided or not found, try to find in cached map or fetch
  return null;
};

/**
 * Fetch quiz by ID
 */
export const fetchQuizById = async (quizId, courseId = null) => {
  if (!quizId) return null;
  const questions = await fetchQuestionsForQuiz(quizId);
  if (courseId != null) {
    saveCourseQuizMapping(courseId, quizId);
  }
  return {
    quizId: quizId.toString(),
    title: `Quiz #${quizId}`,
    duration: 30,
    passing_marks: 12,
    total_questions: questions.length || 10,
    marks_per_question: 2,
    questions: questions
  };
};

export const syncCourseQuizMappings = async (courses = []) => {
  for (const course of courses) {
    try {
      const quizzes = await fetchQuizzesForCourseAdmin(course.id);
      if (quizzes.length > 0) {
        saveCourseQuizMapping(course.id, quizzes[0].id);
      }
    } catch (e) {
      // Ignore
    }
  }
};
