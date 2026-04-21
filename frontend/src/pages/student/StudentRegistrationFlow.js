import { useMemo, useState } from 'react';
import { studentService } from '../../services/api';
import { MOCK_COURSES } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import TablePager from '../../components/TablePager';

const WINDOW_TITLES = {
  'add-drop-25262': 'Add/Drop (2025-26/2)',
  'summer-25263': 'Summer Registration (2025-26/3)',
  'hss-26271': 'HSS Management (2026-27/1)',
  'pre-reg-26271': 'Pre-Registration (2026-27/1)',
};

const PAGE_LOCATION_BY_VIEW = {
  'add-drop-25262': 'Academics > Add/Drop (2025-26/2)',
  'summer-25263': 'Academics > Summer Registration (2025-26/3)',
  'hss-26271': 'Academics > HSS Management (2026-27/1)',
  'pre-reg-26271': 'Academics > Pre-Registration (2026-27/1)',
};

const PAGE_STATUS_BY_VIEW = {
  'add-drop-25262': 'open',
  'summer-25263': 'open',
  'hss-26271': 'closed',
  'pre-reg-26271': 'open',
};

/** Mock rows until MySQL backend exists */
const INITIAL_REQUEST_ROWS = [
  {
    course_id: 'CE371',
    course_name: 'Design of Reinforced Concrete Structures',
    request_intent: 'major',
    credits: 9,
    status: 'accepted',
    requested_at: '2026-01-08T09:15:00Z',
  },
  {
    course_id: 'CS610',
    course_name: 'Programming for Performance',
    request_intent: 'minor',
    credits: 9,
    status: 'pending',
    requested_at: '2026-01-09T11:00:00Z',
  },
  {
    course_id: 'CE683',
    course_name: 'Humans, Environment and Sustainable Development',
    request_intent: 'elective',
    credits: 9,
    status: 'rejected',
    requested_at: '2026-01-09T14:30:00Z',
  },
];

function formatIntentLabel(raw) {
  if (!raw) return 'N/A';
  const s = String(raw).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatWhen(iso) {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function StudentRegistrationFlow({ user, viewKey }) {
  const windowTitle = WINDOW_TITLES[viewKey] || 'Course registration';
  const pageLocation = PAGE_LOCATION_BY_VIEW[viewKey] || `Academics > ${windowTitle}`;
  const pageStatus = PAGE_STATUS_BY_VIEW[viewKey] || 'open';
  const canRequestCourses = pageStatus === 'open';

  const catalog = useMemo(() => MOCK_COURSES, []);
  const [selectedId, setSelectedId] = useState('');
  const [intent, setIntent] = useState('major');
  const [displayLimit, setDisplayLimit] = useState('10');
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState(INITIAL_REQUEST_ROWS);

  const selectedCourse = catalog.find((c) => (c.course_id || c.id) === selectedId);

  const submitRequest = async () => {
    if (!canRequestCourses) return;
    setError(null);
    setMessage(null);
    if (!selectedId || !selectedCourse) {
      setError('Select a course from the dropdown first.');
      return;
    }
    const courseId = selectedCourse.course_id || selectedCourse.id;
    const exists = rows.some((r) => r.course_id === courseId);
    if (exists) {
      setError('You already have a request for this course.');
      return;
    }

    try {
      await studentService.requestCourse({
        courseId: courseId,
        course_id: courseId,
        request_intent: intent,
        student_id: user?.externalId || user?.rollNo,
        window: viewKey,
      });
      setRows((prev) => [
        {
          course_id: courseId,
          course_name: selectedCourse.course_name || selectedCourse.name,
          request_intent: intent,
          credits: Number(selectedCourse.credits || selectedCourse.credit || 0),
          status: 'requested',
          requested_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setMessage(`Request submitted for ${courseId} (${formatIntentLabel(intent)}).`);
      setSelectedId('');
    } catch {
      setRows((prev) => [
        {
          course_id: courseId,
          course_name: selectedCourse.course_name || selectedCourse.name,
          request_intent: intent,
          credits: Number(selectedCourse.credits || selectedCourse.credit || 0),
          status: 'pending',
          requested_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setMessage(`Request recorded locally (${courseId}). Connect the API to persist.`);
      setSelectedId('');
    }
  };

  const filteredRows = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const haystack = [
        r.course_id,
        r.course_name,
        r.request_intent,
        r.status,
        r.requested_at,
        String(r.credits ?? ''),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, filterQuery]);

  const visibleRows = useMemo(() => {
    if (displayLimit === 'all') return filteredRows;
    const count = Number(displayLimit);
    if (!Number.isFinite(count) || count <= 0) return filteredRows;
    const start = (page - 1) * count;
    return filteredRows.slice(start, start + count);
  }, [filteredRows, displayLimit, page]);

  const totalPages = useMemo(() => {
    if (displayLimit === 'all') return 1;
    const count = Number(displayLimit);
    if (!Number.isFinite(count) || count <= 0) return 1;
    return Math.max(1, Math.ceil(filteredRows.length / count));
  }, [filteredRows.length, displayLimit]);

  const appliedCredits = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.credits || 0), 0),
    [rows],
  );

  const studentDetails = {
    name: user?.displayName || 'Aayushman Kumar',
    rollNo: user?.rollNo || user?.externalId || '230029',
    program: 'B.Tech',
    emailId: 'aayushmank23@iitk.ac.in',
    department: 'CE',
    appliedCredits,
  };

  return (
    <div className="content-panel">
      <div className="page-heading-bar">
        <h1 className="content-title student-panel-title">{windowTitle}</h1>
        <p className="page-heading-location">
          {pageLocation}
          <span className={`page-status-badge page-status-badge--${pageStatus}`}>
            {pageStatus}
          </span>
        </p>
      </div>
      <section className="student-info-strip">
        <div className="student-info-grid">
          <p className="student-info-item">
            <span>Student name :</span>
            <strong>{studentDetails.name}</strong>
          </p>
          <p className="student-info-item">
            <span>Roll number :</span>
            <strong>{studentDetails.rollNo}</strong>
          </p>
          <p className="student-info-item">
            <span>Program :</span>
            <strong>{studentDetails.program}</strong>
          </p>
          <p className="student-info-item">
            <span>Email ID :</span>
            <strong>
              <a href={`mailto:${studentDetails.emailId}`}>{studentDetails.emailId}</a>
            </strong>
          </p>
          <p className="student-info-item">
            <span>Department :</span>
            <strong>{studentDetails.department}</strong>
          </p>
          <p className="student-info-item student-info-item--single">
            <span>Applied credits :</span>
            <strong>{studentDetails.appliedCredits}</strong>
          </p>
        </div>
      </section>

      {canRequestCourses && (
        <div className="registration-toolbar">
          <label className="form-label registration-field">
            <span className="field-label">Select course</span>
            <select
              className="form-input form-input-wide"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Choose a course</option>
              {catalog.map((c) => {
                const id = c.course_id || c.id;
                return (
                  <option key={id} value={id}>
                    {id}: {c.course_name || c.name}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="form-label registration-field">
            <span className="field-label">Intent</span>
            <select className="form-input" value={intent} onChange={(e) => setIntent(e.target.value)}>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="elective">Elective</option>
            </select>
          </label>
          <button type="button" className="btn-primary registration-submit" onClick={submitRequest}>
            Request Course
          </button>
        </div>
      )}

      {message && <p className="panel-hint">{message}</p>}
      {error && <p className="panel-error">{error}</p>}

      <div className="table-controls">
        <label className="table-control-right" htmlFor="filter-records">
          Filter records
          <input
            id="filter-records"
            type="text"
            className="form-input table-filter-input"
            placeholder="Type to filter..."
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <TablePager
        total={filteredRows.length}
        page={Math.min(page, totalPages)}
        pageSize={displayLimit}
        onPageChange={(next) => setPage(Math.min(Math.max(next, 1), totalPages))}
        onPageSizeChange={(next) => {
          setDisplayLimit(next);
          setPage(1);
        }}
      />
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course name</th>
              <th>Intent</th>
              <th>Status</th>
              <th>Requested</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="panel-muted">
                  No matching records found.
                </td>
              </tr>
            ) : (
              visibleRows.map((r) => (
                <tr key={r.course_id + (r.requested_at || '')}>
                  <td>
                    <strong>{r.course_id}</strong>
                  </td>
                  <td>{r.course_name}</td>
                  <td>{formatIntentLabel(r.request_intent)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="cell-muted">{formatWhen(r.requested_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
