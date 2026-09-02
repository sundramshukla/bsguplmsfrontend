import { BASE_URL } from '../config';

export const getAdminUserId = () =>
  localStorage.getItem('adminUserId') || localStorage.getItem('userId') || '1';

const DEPARTMENT_LABELS = {
  youth_programme: 'Youth Programme',
  youth: 'Youth Programme',
  adult_programme: 'Adult Programme',
  adult: 'Adult Programme',
  tech_skill: 'Tech Skill',
  tech: 'Tech Skill',
  training: 'Training',
  organisation: 'Organization',
  organization: 'Organization',
  it: 'Tech Skill'
};

export const normalizeDepartment = (dept = '') => {
  const key = dept.toLowerCase().trim();
  return DEPARTMENT_LABELS[key] || 'Youth Programme';
};

export const formatDateDDMMYYYY = (rawDate) => {
  if (!rawDate) return '-';
  try {
    const dStr = String(rawDate).split('T')[0];
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dStr;
  } catch (e) {
    return '-';
  }
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
    const date = formatDateDDMMYYYY(rawDate);

    return {
      id: row.id ?? row.enrollment_id ?? `${userId}_${courseId}`,
      userId,
      courseId,
      name: studentName,
      email: row.email || row.user?.email || null,
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

  const res = await fetch(`${BASE_URL}/bsgupadmin/admindashboard/?user_id=${encodeURIComponent(adminUserId)}`);

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || 'Failed to load dashboard analytics');
  }

  const metrics = data.data || data;

  // Parse department wise enrollment (handles both array and object responses)
  const deptWise = metrics.department_wise_enrollment || metrics.department_enrollments || metrics.enrollments_by_department || null;
  const parsedDept = {
    youth_programme: 0,
    adult_programme: 0,
    tech_skill: 0,
    training: 0,
    organisation: 0,
    organization: 0,
    it: 0
  };
  if (Array.isArray(deptWise)) {
    deptWise.forEach(item => {
      const deptName = item.course__department || item.department || '';
      const count = item.total_enrollments ?? item.count ?? 0;
      if (deptName) {
        parsedDept[deptName.toLowerCase()] = count;
      }
    });
  } else if (typeof deptWise === 'object' && deptWise !== null) {
    Object.keys(deptWise).forEach(key => {
      parsedDept[key.toLowerCase()] = deptWise[key];
    });
  }

  return {
    totalStudents: metrics.total_users ?? metrics.total_students ?? 0,
    totalCourses: metrics.total_courses ?? 0,
    totalEnrollments: metrics.total_enrollments ?? 0,
    completionRate: metrics.completion_rate ?? metrics.avg_completion_rate ?? 0,
    recentEnrollments: parseEnrollmentRecords(metrics.recent_enrollments || metrics.recent_students || []),
    departmentEnrollments: parsedDept,
    revenue: metrics.total_revenue ?? metrics.revenue ?? 0
  };
};

export const fetchAdminEnrollmentRecords = async (adminUserId = getAdminUserId()) => {
  try {
    const res = await fetch(
      `${BASE_URL}/user/enrollment/?user_id=${encodeURIComponent(adminUserId)}`
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success !== false) {
      return parseEnrollmentRecords(data);
    }
  } catch {
    // Fall back to empty list on error
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
    'Youth Programme': 0,
    'Adult Programme': 0,
    'Tech Skill': 0,
    'Training': 0,
    'Organization': 0
  };

  enrollmentRecords.forEach((record) => {
    const course = courseMap.get(record.courseId?.toString());
    const dept = normalizeDepartment(record.department || course?.department || '');
    if (counts[dept] != null) {
      counts[dept] += 1;
    } else {
      counts['Youth Programme'] += 1;
    }
  });

  return [
    { name: 'Youth Programme', value: counts['Youth Programme'], color: 'bg-purple-500' },
    { name: 'Adult Programme', value: counts['Adult Programme'], color: 'bg-blue-500' },
    { name: 'Tech Skill', value: counts['Tech Skill'], color: 'bg-emerald-500' },
    { name: 'Training', value: counts['Training'], color: 'bg-amber-500' },
    { name: 'Organization', value: counts['Organization'], color: 'bg-indigo-500' }
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

export const formatRevenue = (amount) => {
  const num = Number(amount) || 0;
  return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const fetchStudentActiveStatus = async (studentId) => {
  try {
    const res = await fetch(`${BASE_URL}/bsgupadmin/student-status/?student_id=${studentId}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success !== false) {
      return data.is_active ?? data.active ?? true;
    }
  } catch {
    // Ignore and fallback
  }
  return true;
};

export const toggleStudentActiveStatus = async (studentId, currentStatus) => {
  try {
    const adminUserId = getAdminUserId();
    if (!adminUserId || !studentId) return true;

    const newStatus = !currentStatus;
    const res = await fetch(`${BASE_URL}/bsgupadmin/student-status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: Number(adminUserId), student_id: Number(studentId), is_active: newStatus })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success !== false) {
      return newStatus;
    }

    // Try alternate endpoint if student-status fails
    const fallbackRes = await fetch(`${BASE_URL}/bsgupadmin/toggle-student-active/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: Number(adminUserId), student_id: Number(studentId) })
    });
    const fallbackData = await fallbackRes.json().catch(() => ({}));
    if (fallbackRes.ok && fallbackData.success !== false) {
      return newStatus;
    }
  } catch {
    // Return original on error
  }
  return currentStatus;
};

export const deleteStudentProfile = async (studentId) => {
  try {
    const adminUserId = getAdminUserId();
    if (!adminUserId || !studentId) return { success: false };

    const res = await fetch(`${BASE_URL}/bsgupadmin/delete-student/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: Number(adminUserId), student_id: Number(studentId) })
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok && data.success !== false, message: data.message || data.error };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
