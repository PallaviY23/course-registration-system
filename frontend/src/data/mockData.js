/** Used when the API is unavailable so the UI remains demoable (frontend-only). */

/**
 * Roll number → institute email. Mirrors a future `students.email` (or LDAP) field;
 * the DB schema currently keys students by `student_id` only.
 */
export const STUDENT_EMAIL_BY_ROLL = {
  '230029': 'aayushmank23@iitk.ac.in',
};

/** Mirrors a future `students.phone` field; used for masked reset messaging only. */
export const STUDENT_PHONE_BY_ROLL = {
  '230029': '+91 8123456749',
};

export function getEmailForRoll(roll) {
  const id = String(roll).trim();
  if (!id) return '';
  return STUDENT_EMAIL_BY_ROLL[id] ?? `${id}@iitk.ac.in`;
}

export function getPhoneForRoll(roll) {
  const id = String(roll).trim();
  if (!id) return '';
  return STUDENT_PHONE_BY_ROLL[id] ?? '+91 8100000049';
}

/** Local part: first 2 chars + * + last 4 chars (e.g. aayushmank23@… → aa******nk23@…). */
export function maskEmailForDisplay(email) {
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 4) {
    return `${local[0]}***${local.slice(-1)}${domain}`;
  }
  if (local.length <= 6) {
    return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 4))}${local.slice(-2)}${domain}`;
  }
  const first2 = local.slice(0, 2);
  const last4 = local.slice(-4);
  const mid = local.slice(2, local.length - 4);
  return `${first2}${'*'.repeat(mid.length)}${last4}${domain}`;
}

/** e.g. +91 8123456749 → +91 81xxxxxx49 */
export function maskPhoneForDisplay(phone) {
  const digits = phone.replace(/\D/g, '');
  let national10 = '';
  if (digits.length >= 12 && digits.startsWith('91')) {
    national10 = digits.slice(2, 12);
  } else if (digits.length >= 10) {
    national10 = digits.slice(-10);
  } else {
    return phone;
  }
  const head = national10.slice(0, 2);
  const tail = national10.slice(-2);
  const midLen = Math.max(0, national10.length - 4);
  return `+91 ${head}${'x'.repeat(midLen)}${tail}`;
}

export const MOCK_COURSES = [
  {
    course_id: 'CE371',
    course_name: 'Design of Reinforced Concrete Structures',
    course_credit: 9,
    instructor: 'Vinay Kumar Gupta',
    max_seats: 45,
    offering_dept: 'CE',
  },
  {
    course_id: 'CS610',
    course_name: 'Programming for Performance',
    course_credit: 9,
    instructor: 'Swarnendu Biswas',
    max_seats: 40,
    offering_dept: 'CSE',
  },
  {
    course_id: 'CE683',
    course_name: 'Humans, Environment and Sustainable Development',
    course_credit: 9,
    instructor: 'Manoj Tiwari',
    max_seats: 50,
    offering_dept: 'CE',
  },
];

export const MOCK_REQUESTS = [
  {
    course_id: 'CE371',
    course_name: 'Design of Reinforced Concrete Structures',
    status: 'requested',
    request_intent: 'major',
    requested_at: '2026-01-10T10:00:00Z',
  },
];

export const MOCK_TIMETABLE = [
  {
    course_id: 'CE371',
    course_name: 'Design of RC Structures',
    meetings: [
      { meeting_type: 'LECTURE', day: 'Monday', start_time: '09:00', end_time: '10:00' },
      { meeting_type: 'TUTORIAL', day: 'Wednesday', start_time: '14:00', end_time: '15:00' },
    ],
  },
  {
    course_id: 'HSO201',
    course_name: 'Economics',
    meetings: [
      { meeting_type: 'LECTURE', day: 'Tuesday', start_time: '11:00', end_time: '12:00' },
    ],
  },
];

export const MOCK_INCOMING = [
  { student_id: '230029', name: 'Aayushman Kumar', course_id: 'CE371', cpi: 9.2, status: 'requested' },
];
