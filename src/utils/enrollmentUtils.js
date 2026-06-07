import { BASE_URL } from '../config';
import { saveCourseQuizMapping } from './quizUtils';

const ENROLLMENT_QUIZ_MAP_KEY = 'bsgup_enrollment_quiz_map';

export const parseEnrollments = (data) => {
  if (!data) return [];

  const rows =
    data.data ||
    data.enrollments ||
    data.results ||
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      const courseId = row.course_id ?? row.course?.id ?? row.course;
      const quizId = row.quiz_id ?? row.quiz?.quiz_id ?? row.quiz?.id ?? row.quiz;
      return {
        enrollmentId: row.id ?? row.enrollment_id,
        courseId: courseId != null ? parseInt(courseId, 10) : null,
        quizId: quizId != null ? parseInt(quizId, 10) : null,
        raw: row
      };
    })
    .filter((entry) => entry.courseId != null);
};

const persistEnrollmentQuizMappings = (enrollments) => {
  if (!enrollments.length) return;

  let map = {};
  try {
    map = JSON.parse(localStorage.getItem(ENROLLMENT_QUIZ_MAP_KEY) || '{}');
  } catch {
    map = {};
  }

  enrollments.forEach(({ courseId, quizId }) => {
    if (quizId != null) {
      map[courseId.toString()] = quizId.toString();
      saveCourseQuizMapping(courseId, quizId);
    }
  });

  localStorage.setItem(ENROLLMENT_QUIZ_MAP_KEY, JSON.stringify(map));
};

const syncLocalEnrolledCache = (userId, courseIds) => {
  const ids = Array.isArray(courseIds) ? courseIds : [courseIds];
  const key = `enrolledCourses_${userId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const merged = [...new Set([...existing, ...ids.map((id) => parseInt(id, 10))])];
  localStorage.setItem(key, JSON.stringify(merged));
};

const buildEnrollmentPayload = (userId, courseId) => {
  const payload = {
    user_id: parseInt(userId, 10),
    course_id: parseInt(courseId, 10)
  };

  const profileId = localStorage.getItem('profileId');
  if (profileId) {
    payload.profile_id = parseInt(profileId, 10);
  }

  return payload;
};

const applySingleEnrollment = (data, userId) => {
  const enrollments = parseEnrollments(data);
  if (enrollments.length) {
    persistEnrollmentQuizMappings(enrollments);
    syncLocalEnrolledCache(
      userId,
      enrollments.map((entry) => entry.courseId)
    );
    return enrollments;
  }

  const courseId = data.course_id ?? data.course?.id ?? data.course;
  const quizId = data.quiz_id ?? data.quiz?.quiz_id ?? data.quiz?.id ?? data.quiz;

  if (courseId != null) {
    if (quizId != null) {
      saveCourseQuizMapping(courseId, quizId);
    }
    syncLocalEnrolledCache(userId, courseId);
    return [{ courseId: parseInt(courseId, 10), quizId: quizId != null ? parseInt(quizId, 10) : null }];
  }

  return [];
};

export const fetchUserEnrollments = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/my-courses/?user_id=${encodeURIComponent(userId)}`, {
    method: 'GET'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch enrollments (${res.status})`);
  }

  const data = await res.json();

  // Persist a mapping of enrollment-row-id -> nested course id so UI wrapper ids
  // can be resolved to the real course id later when triggering payment requests.
  try {
    const rows = data.data || data.enrollments || data.results || (Array.isArray(data) ? data : []);
    if (Array.isArray(rows) && rows.length) {
      const mapKey = `enrollmentCourseMap_${userId}`;
      let map = {};
      try {
        map = JSON.parse(localStorage.getItem(mapKey) || '{}');
      } catch (e) {
        map = {};
      }
      rows.forEach((row) => {
        const enrollId = row.id ?? row.enrollment_id ?? null;
        const courseId = row.course?.id ?? row.course_id ?? row.course ?? null;
        if (enrollId != null && courseId != null) {
          map[enrollId.toString()] = parseInt(courseId, 10);
        }
      });
      try {
        localStorage.setItem(mapKey, JSON.stringify(map));
      } catch (e) {
        // ignore storage errors
      }
    }
  } catch (e) {
    // ignore mapping errors
  }

  const enrollments = parseEnrollments(data);
  persistEnrollmentQuizMappings(enrollments);
  syncLocalEnrolledCache(
    userId,
    enrollments.map((entry) => entry.courseId)
  );
  return enrollments;
};

export const getEnrolledCourseIds = async (userId) => {
  try {
    const enrollments = await fetchUserEnrollments(userId);
    return enrollments.map((entry) => entry.courseId);
  } catch (err) {
    console.warn('Enrollment API unavailable, using local cache:', err.message);
    const key = `enrolledCourses_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
};

export const enrollStudentInCourse = async (userId, courseId) => {
  const res = await fetch(`${BASE_URL}/user/enrollment/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildEnrollmentPayload(userId, courseId))
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok && data.success !== true && data.success !== 'Enrollment successful') {
    const errorMsg = (data.error || data.message || '').toLowerCase();
    if (errorMsg.includes('already enrolled') || errorMsg.includes('already exist')) {
      syncLocalEnrolledCache(userId, courseId);
      window.dispatchEvent(new Event('enrollmentChange'));
    }
    throw new Error(data.error || data.message || 'Enrollment failed');
  }

  applySingleEnrollment(data, userId);
  window.dispatchEvent(new Event('enrollmentChange'));
  return data;
};

export const isUserEnrolledInCourse = async (userId, courseId) => {
  const enrolledIds = await getEnrolledCourseIds(userId);
  return enrolledIds.some((id) => id.toString() === courseId.toString());
};

export const getEnrollmentQuizId = (courseId) => {
  try {
    const map = JSON.parse(localStorage.getItem(ENROLLMENT_QUIZ_MAP_KEY) || '{}');
    return map[courseId.toString()] || null;
  } catch {
    return null;
  }
};
