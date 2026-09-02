import { BASE_URL } from '../config';

const COURSE_QUIZ_MAP_KEY = 'bsgup_course_quiz_map';

export const getAdminUserId = () => {
  return localStorage.getItem('adminUserId') || localStorage.getItem('userId') || '1';
};

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
  if (quizIdStr === courseIdStr) return;

  localStorage.setItem(`quiz_id_course_${courseIdStr}`, quizIdStr);

  const map = getCourseQuizMap();
  map[courseIdStr] = quizIdStr;
  localStorage.setItem(COURSE_QUIZ_MAP_KEY, JSON.stringify(map));
};

export const getCourseQuizId = (courseId) => {
  if (!courseId) return null;
  const courseIdStr = courseId.toString();
  const map = getCourseQuizMap();
  const fromMap = map[courseIdStr];
  if (fromMap && fromMap !== courseIdStr) return fromMap;

  const fromCache = localStorage.getItem(`quiz_id_course_${courseIdStr}`);
  if (fromCache && fromCache !== courseIdStr) return fromCache;

  return null;
};

export const normalizeQuestions = (questions = []) =>
  (Array.isArray(questions) ? questions : []).map((q, idx) => ({
    id: q.id || q.question_id || idx + 1,
    question: q.question || '',
    option1: q.option1 || '',
    option2: q.option2 || '',
    option3: q.option3 || '',
    option4: q.option4 || '',
    correct_answer: q.correct_answer || q.answer || '',
    quiz: q.quiz || null,
    is_active: q.is_active !== false
  }));

/**
 * Fetch all questions for a specific quiz ID using the verified endpoint:
 * GET /bsgupadmin/create-question/?user_id=${userId}&quiz_id=${quizId}
 */
export const fetchQuestionsForQuiz = async (quizId, userId = getAdminUserId()) => {
  if (!quizId) return [];
  try {
    const res = await fetch(`${BASE_URL}/bsgupadmin/create-question/?user_id=${encodeURIComponent(userId)}&quiz_id=${encodeURIComponent(quizId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data && Array.isArray(data.data)) {
      return normalizeQuestions(data.data);
    }
    if (data && Array.isArray(data)) {
      return normalizeQuestions(data);
    }
  } catch (err) {
    console.error(`Failed to fetch questions for quiz ${quizId}:`, err);
  }
  return [];
};

/**
 * Fetch all quizzes for a given course ID using the verified endpoint:
 * GET /bsgupadmin/create-quiz/?user_id=${userId}&course_id=${courseId}
 * Returns an array of formatted quiz objects with their questions attached.
 */
export const fetchQuizzesForCourse = async (courseId, userId = getAdminUserId()) => {
  if (!courseId) return [];
  try {
    const res = await fetch(`${BASE_URL}/bsgupadmin/create-quiz/?user_id=${encodeURIComponent(userId)}&course_id=${encodeURIComponent(courseId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !data.success || !Array.isArray(data.data)) return [];

    const quizzesList = [];
    for (const item of data.data) {
      if (item && item.quiz) {
        const q = item.quiz;
        const quizId = q.id?.toString() || q.quiz_id?.toString();
        // Fetch questions for this quiz
        const questions = quizId ? await fetchQuestionsForQuiz(quizId, userId) : [];

        const formattedQuiz = {
          id: quizId,
          quizId: quizId,
          lessonId: (item.id || q.lesson)?.toString(),
          lessonTitle: item.title || q.lesson_name || `Lesson ${item.id}`,
          courseId: courseId.toString(),
          title: q.title || `Quiz #${quizId}`,
          total_questions: q.total_questions || questions.length || 10,
          marks_per_question: q.marks_per_question || 2,
          total_marks: q.total_marks || ((q.total_questions || 10) * (q.marks_per_question || 2)),
          passing_marks: q.passing_marks || 12,
          duration: q.duration || 30,
          is_final: q.is_final !== false,
          is_active: q.is_active !== false,
          questions: questions
        };

        quizzesList.push(formattedQuiz);

        if (quizId) {
          saveCourseQuizMapping(courseId, quizId);
        }
      }
    }
    return quizzesList;
  } catch (err) {
    console.error(`Failed to fetch quizzes for course ${courseId}:`, err);
    return [];
  }
};

/**
 * Fetch quiz details and questions for a specific quiz ID
 */
export const fetchQuizById = async (quizId, userId = getAdminUserId()) => {
  if (!quizId) return null;
  const questions = await fetchQuestionsForQuiz(quizId, userId);
  return {
    quizId: quizId.toString(),
    id: quizId.toString(),
    questions: questions
  };
};

/**
 * Fetch quiz for a specific lesson
 */
export const fetchQuizForLesson = async (lessonId, courseId = null, userId = getAdminUserId()) => {
  if (!lessonId) return null;
  const lessonIdStr = lessonId.toString();

  // If courseId is known, fetch directly via course quizzes
  if (courseId) {
    const courseQuizzes = await fetchQuizzesForCourse(courseId, userId);
    const found = courseQuizzes.find(q => q.lessonId?.toString() === lessonIdStr);
    if (found) return found;
  }

  // If courseId is not provided, try querying courses list
  try {
    const coursesRes = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
    const coursesData = await coursesRes.json();
    if (coursesData && coursesData.data) {
      for (const course of coursesData.data) {
        const courseQuizzes = await fetchQuizzesForCourse(course.id, userId);
        const found = courseQuizzes.find(q => q.lessonId?.toString() === lessonIdStr);
        if (found) {
          found.courseTitle = course.title;
          return found;
        }
      }
    }
  } catch (err) {
    console.error("Error in fetchQuizForLesson:", err);
  }

  return null;
};

/**
 * Fetch the primary quiz for a course (e.g. for student exams)
 */
export const fetchQuizForCourse = async (courseId, courseTitle = '', userId = getAdminUserId()) => {
  if (!courseId) return null;
  const courseIdStr = courseId.toString();

  const quizzes = await fetchQuizzesForCourse(courseIdStr, userId);
  if (quizzes && quizzes.length > 0) {
    // Prefer final exam quiz or the first available quiz
    const finalQuiz = quizzes.find(q => q.is_final) || quizzes[0];
    return {
      title: finalQuiz.title,
      passing_marks: finalQuiz.passing_marks,
      duration: finalQuiz.duration,
      total_questions: finalQuiz.total_questions,
      marks_per_question: finalQuiz.marks_per_question,
      total_marks: finalQuiz.total_marks,
      questions: finalQuiz.questions || [],
      quizId: finalQuiz.id?.toString()
    };
  }

  return null;
};

export const syncCourseQuizMappings = async (courses = []) => {
  const userId = getAdminUserId();
  await Promise.all(
    courses.map(async (course) => {
      try {
        await fetchQuizzesForCourse(course.id, userId);
      } catch {
        // Ignore
      }
    })
  );
};
