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
  if (quizIdStr === courseIdStr) return;

  localStorage.setItem(`quiz_id_course_${courseIdStr}`, quizIdStr);

  const map = getCourseQuizMap();
  map[courseIdStr] = quizIdStr;
  localStorage.setItem(COURSE_QUIZ_MAP_KEY, JSON.stringify(map));
};

export const getCourseQuizId = (courseId) => {
  const courseIdStr = courseId.toString();
  const map = getCourseQuizMap();
  const fromMap = map[courseIdStr];
  if (fromMap && fromMap !== courseIdStr) return fromMap;

  const fromCache = localStorage.getItem(`quiz_id_course_${courseIdStr}`);
  if (fromCache && fromCache !== courseIdStr) return fromCache;

  return null;
};

export const parseQuizResponse = (data) => {
  if (!data || data.success === false) return null;

  if (data.quiz && data.questions) {
    return {
      title: data.quiz.title || 'Course Final Quiz',
      passing_marks: data.quiz.passing_marks || data.quiz.passing_mark || 60,
      duration: data.quiz.duration || 30,
      questions: data.questions
    };
  }

  let qData = data.data;
  if (Array.isArray(qData) && qData.length > 0) qData = qData[0];

  if (qData && (qData.title || qData.questions)) {
    return {
      title: qData.title || 'Course Final Quiz',
      passing_marks: qData.passing_marks || qData.passing_mark || 60,
      duration: qData.duration || 30,
      questions: qData.questions || []
    };
  }

  if (data.title || data.questions) {
    return {
      title: data.title || 'Course Final Quiz',
      passing_marks: data.passing_marks || data.passing_mark || 60,
      duration: data.duration || 30,
      questions: data.questions || []
    };
  }

  return null;
};

export const extractQuizId = (data, fallback = null) => {
  if (!data) return fallback;
  if (data.quiz?.quiz_id != null) return data.quiz.quiz_id;
  if (data.quiz?.id != null) return data.quiz.id;
  if (data.data?.quiz_id != null) return data.data.quiz_id;
  if (data.data?.id != null) return data.data.id;
  if (data.quiz_id != null) return data.quiz_id;
  if (data.id != null) return data.id;
  return fallback;
};

const normalizeQuestions = (questions = []) =>
  questions.map((q, idx) => ({
    ...q,
    id: q.id || q.question_id || idx + 1
  }));

export const fetchQuizForCourse = async (courseId, courseTitle = '') => {
  const courseIdStr = courseId.toString();
  const cacheKey = `quiz_id_course_${courseIdStr}`;

  const tryFetch = async (url, linkedCourseId = courseIdStr) => {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success === false) return null;
    const parsed = parseQuizResponse(data);
    if (!parsed) return null;
    const quizId = extractQuizId(data, null);
    if (quizId != null) {
      saveCourseQuizMapping(linkedCourseId, quizId);
      const numericId = parseInt(quizId, 10);
      const knownMax = parseInt(localStorage.getItem('bsgup_max_quiz_id') || '0', 10);
      if (numericId > knownMax) {
        localStorage.setItem('bsgup_max_quiz_id', numericId.toString());
      }
    }
    return {
      ...parsed,
      questions: normalizeQuestions(parsed.questions),
      quizId: quizId != null ? quizId.toString() : null
    };
  };

  // 1. Use quiz id from enrollment API mapping
  const enrollmentQuizId = (() => {
    try {
      const map = JSON.parse(localStorage.getItem('bsgup_enrollment_quiz_map') || '{}');
      return map[courseIdStr] || null;
    } catch {
      return null;
    }
  })();
  if (enrollmentQuizId) {
    const enrollmentResult = await tryFetch(
      `${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=${enrollmentQuizId}`,
      courseIdStr
    );
    if (enrollmentResult) return enrollmentResult;
  }

  // 2. Use saved course → quiz mapping (set when admin creates quiz)
  const mappedQuizId = getCourseQuizId(courseIdStr);
  if (mappedQuizId) {
    const mappedResult = await tryFetch(
      `${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=${mappedQuizId}`,
      courseIdStr
    );
    if (mappedResult) return mappedResult;
  }

  // 2. Try course_id lookup
  let result = await tryFetch(`${BASE_URL}/bsgupadmin/get-quiz/?course_id=${courseIdStr}`);
  if (result) return result;

  // 3. Clear invalid cache where course id was wrongly stored as quiz id
  const cachedQuizId = localStorage.getItem(cacheKey);
  if (cachedQuizId === courseIdStr) {
    localStorage.removeItem(cacheKey);
    const map = getCourseQuizMap();
    if (map[courseIdStr] === courseIdStr) {
      delete map[courseIdStr];
      localStorage.setItem(COURSE_QUIZ_MAP_KEY, JSON.stringify(map));
    }
  } else if (cachedQuizId) {
    result = await tryFetch(`${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=${cachedQuizId}`);
    if (result) return result;
  }

  // 4. Last resort: discover quiz by matching title (backend course_id lookup is unreliable)
  if (courseTitle) {
    const normalizedCourseTitle = courseTitle.toLowerCase().trim();
    const maxQuizId = parseInt(localStorage.getItem('bsgup_max_quiz_id') || '25', 10) + 5;

    for (let quizId = 1; quizId <= maxQuizId; quizId += 1) {
      const candidate = await tryFetch(
        `${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=${quizId}`,
        courseIdStr
      );
      if (!candidate?.title) continue;

      const normalizedQuizTitle = candidate.title.toLowerCase().trim();
      if (
        normalizedQuizTitle.includes(normalizedCourseTitle) ||
        normalizedCourseTitle.includes(normalizedQuizTitle.replace(/\s*final quiz\s*$/i, '').trim())
      ) {
        return candidate;
      }
    }
  }

  return null;
};

export const fetchQuizById = async (quizId, courseId = null) => {
  const res = await fetch(`${BASE_URL}/bsgupadmin/get-quiz/?quiz_id=${quizId}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.success === false) return null;
  const parsed = parseQuizResponse(data);
  if (!parsed) return null;

  const resolvedQuizId = extractQuizId(data, quizId)?.toString();
  if (courseId != null && resolvedQuizId) {
    saveCourseQuizMapping(courseId, resolvedQuizId);
  }

  return {
    ...parsed,
    questions: normalizeQuestions(parsed.questions),
    quizId: resolvedQuizId
  };
};

export const syncCourseQuizMappings = async (courses = []) => {
  const map = getCourseQuizMap();

  await Promise.all(
    courses.map(async (course) => {
      const courseIdStr = course.id.toString();
      const knownQuizId = map[courseIdStr] || getCourseQuizId(courseIdStr);
      if (!knownQuizId) return;

      const quiz = await fetchQuizById(knownQuizId, course.id);
      if (quiz?.quizId) {
        saveCourseQuizMapping(course.id, quiz.quizId);
      }
    })
  );
};
