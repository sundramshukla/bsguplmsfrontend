import { BASE_URL } from '../config';

export const getAdminUserId = () =>
  localStorage.getItem('adminUserId') || localStorage.getItem('userId');

const DEPARTMENT_LABELS = {
  training: 'Training',
  organisation: 'Organization',
  organization: 'Organization',
  it: 'IT'
};

export const normalizeDepartment = (dept = '') => {
  const key = dept.toLowerCase().trim();
  return DEPARTMENT_LABELS[key] || 'Organization';
};

export const parseEnrollmentRecords = (data) => {
  if (!data) return [];

  const rows =
    data.data ||
    data.enrollments ||
    data.recent_enrollments ||
    data.results ||
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const userId = row.user_id ?? row.user?.id ?? row.user ?? row.profile_id ?? row.profile?.id;
    const courseId = row.course_id ?? row.course?.id ?? row.course;
    const studentName =
      row.student_name ||
      row.full_name ||
      row.user_name ||
      row.profile?.full_name ||
      row.user?.full_name ||
      (userId != null ? `Student #${userId}` : 'Student');

    const courseName =
      row.course_title ||
      row.course?.title ||
      row.course_name ||
      (courseId != null ? `Course #${courseId}` : 'Course');

    const rawDate = row.enrolled_at || row.enrollment_date || row.created_at || row.date;
    const date = rawDate ? String(rawDate).split('T')[0] : '-';

    return {
      id: row.id ?? row.enrollment_id ?? `${userId}_${courseId}`,
      userId,
      courseId,
      name: studentName,
      course: courseName,
      date,
      status: row.status || 'Active',
      department: row.department || row.course?.department || null
    };
  });
};

export const fetchAdminDashboard = async (adminUserId = getAdminUserId()) => {
  if (!adminUserId) {
    throw new Error('Admin user id not found');
  }

  const res = await fetch(`${BASE_URL}/bsgupadmin/admindashboard/?user_id=${encodeURIComponent(adminUserId)}`, {
    credentials: 'include'
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || 'Failed to load dashboard analytics');
  }

  const metrics = data.data || data;
  return {
    registeredStudents: metrics.registered_students ?? metrics.total_students ?? 0,
    enrolledStudents: metrics.enrolled_students ?? metrics.total_enrollments ?? 0,
    totalCourses: metrics.total_courses ?? 0,
    totalLessons: metrics.total_lessons ?? 0,
    completionRate: metrics.completion_rate ?? 0,
    totalRevenue: metrics.total_revenue ?? 0,
    recentEnrollments: parseEnrollmentRecords(metrics.recent_enrollments || metrics.recent || []),
    departmentEnrollments: metrics.enrollments_by_department || metrics.department_enrollments || null,
    raw: metrics
  };
};

export const fetchAdminEnrollmentRecords = async (adminUserId = getAdminUserId()) => {
  const urls = [
    `${BASE_URL}/user/enrollment/`,
    `${BASE_URL}/user/enrollment/?user_id=${encodeURIComponent(adminUserId)}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'GET', credentials: 'include' });
      if (!res.ok) continue;
      const data = await res.json();
      const records = parseEnrollmentRecords(data);
      if (records.length) return records;
    } catch {
      // try next url
    }
  }

  return [];
};

export const fetchAdminCourses = async () => {
  const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success || !Array.isArray(data.data)) {
    return [];
  }
  return data.data;
};

export const buildDepartmentStats = (enrollmentRecords, courses = []) => {
  const courseMap = new Map(courses.map((course) => [course.id.toString(), course]));
  const counts = {
    Training: 0,
    Organization: 0,
    IT: 0
  };

  enrollmentRecords.forEach((record) => {
    const course = courseMap.get(record.courseId?.toString());
    const dept = normalizeDepartment(record.department || course?.department || '');
    if (counts[dept] != null) {
      counts[dept] += 1;
    }
  });

  return [
    { name: 'Training', value: counts.Training, color: 'bg-blue-500' },
    { name: 'Organization', value: counts.Organization, color: 'bg-purple-500' },
    { name: 'IT', value: counts.IT, color: 'bg-emerald-500' }
  ];
};

export const sortRecentEnrollments = (records = []) =>
  [...records]
    .sort((a, b) => {
      if (a.date === b.date) return 0;
      if (a.date === '-') return 1;
      if (b.date === '-') return -1;
      return b.date.localeCompare(a.date);
    })
    .slice(0, 10);

export const formatCompletionRate = (value) => {
  const numeric = Number(value) || 0;
  return `${Math.round(numeric)}%`;
};

export const formatRevenue = (value) => {
  const numeric = Number(value) || 0;
  return `₹ ${numeric.toFixed(2)}`;
};
