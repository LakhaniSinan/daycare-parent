export function toApiDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseApiDate(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function formatTime12(time24) {
  if (!time24 || typeof time24 !== 'string') return '';
  const [hRaw, mRaw] = time24.split(':');
  let h = parseInt(hRaw, 10);
  const m = mRaw ?? '00';
  if (Number.isNaN(h)) return time24;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

export function formatTeacherName(teacher) {
  if (!teacher) return '';
  if (typeof teacher === 'string') return teacher;
  const first = teacher.firstName?.trim() || '';
  const last = teacher.lastName?.trim() || '';
  return [first, last].filter(Boolean).join(' ');
}

export function formatScheduleLines(schedule) {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return 'Schedule not available';
  }
  return schedule
    .map((slot) => {
      const day = slot?.day?.trim() || 'Day';
      const start = formatTime12(slot?.startTime);
      const end = formatTime12(slot?.endTime);
      if (start && end) return `${day}, ${start} - ${end}`;
      return day;
    })
    .join('\n');
}

export function activityHasData(activity) {
  if (activity == null) return false;
  if (Array.isArray(activity)) return activity.length > 0;
  if (typeof activity === 'object') return Object.keys(activity).length > 0;
  return Boolean(activity);
}

/** First enrolled student on a classroom list item (from GET classrooms). */
export function firstClassroomStudent(classroom) {
  const students = classroom?.students;
  if (!Array.isArray(students) || students.length === 0) return null;

  const entry = students[0];
  const id = typeof entry === 'string' ? entry : entry?._id;
  if (!id) return null;

  const name =
    typeof entry === 'object'
      ? [entry.firstName?.trim(), entry.lastName?.trim()].filter(Boolean).join(' ') ||
        'Child'
      : 'Child';

  return { id: String(id), name };
}
