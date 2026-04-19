import { useMemo, useState } from 'react';
import { studentService } from '../../services/api';
import { MOCK_COURSES } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

const WINDOW_TITLES = {
  'add-drop-25262': 'Add/Drop (2025-26/2)',
  'summer-25263': 'Summer Registration (2025-26/3)',
  'hss-26271': 'HSS Management (2026-27/1)',
  'pre-reg-26271': 'Pre-Registration (2026-27/1)',
};

/** Mock rows until MySQL backend exists */
const INITIAL_REQUEST_ROWS = [
  {
    course_id: 'CE371',
    course_name: 'Design of Reinforced Concrete Structures',
    request_intent: 'major',
    status: 'accepted',
    requested_at: '2026-01-08T09:15:00Z',
  },
  {
    course_id: 'CS610',
    course_name: 'Programming for Performance',
    request_intent: 'minor',
    status: 'pending',
    requested_at: '2026-01-09T11:00:00Z',
  },
  {
    course_id: 'CE683',
    course_name: 'Humans, Environment and Sustainable Development',
    request_intent: 'elective',
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

  const catalog = useMemo(() => MOCK_COURSES, []);
  const [selectedId, setSelectedId] = useState('');
  const [intent, setIntent] = useState('major');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState(INITIAL_REQUEST_ROWS);

  const selectedCourse = catalog.find((c) => (c.course_id || c.id) === selectedId);

  const submitRequest = async () => {
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
          status: 'pending',
          requested_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setMessage(`Request recorded locally (${courseId}). Connect the API to persist.`);
      setSelectedId('');
    }
  };

  return (
    <div className="content-panel">
      <h1 className="content-title">{windowTitle}</h1>
      <p className="content-lead">
        Pick one course from the dropdown, choose Major, Minor, or Elective, then submit. Your requests
        and outcomes appear in the table below.
      </p>

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

      {message && <p className="panel-hint">{message}</p>}
      {error && <p className="panel-error">{error}</p>}

      <h2 className="content-subtitle">Your requests</h2>
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="panel-muted">
                  No requests yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
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
