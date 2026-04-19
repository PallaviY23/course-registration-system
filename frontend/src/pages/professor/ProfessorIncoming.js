import { useEffect, useState } from 'react';
import { professorService } from '../../services/api';
import { MOCK_INCOMING } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function ProfessorIncoming() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await professorService.getIncomingRequests();
        const list = Array.isArray(data) ? data : data?.requests ?? [];
        if (!cancelled) setRows(list.length ? list : MOCK_INCOMING);
        if (!list.length && !cancelled) setHint('Sample rows. Allocation usually finalizes seats.');
      } catch {
        if (!cancelled) {
          setRows(MOCK_INCOMING);
          setHint('Backend unavailable. Showing sample data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="panel-muted">Loading requests...</p>;
  }

  return (
    <div className="content-panel">
      <h1 className="content-title">Incoming Requests</h1>
      <p className="content-lead">
        Students who requested your courses. Optional Pingala-style review before allocation.
      </p>
      {hint && <p className="panel-hint">{hint}</p>}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th>Course</th>
              <th>CPI</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.student_id}-${r.course_id}`}>
                <td>{r.student_id}</td>
                <td>{r.name}</td>
                <td>
                  <strong>{r.course_id}</strong>
                </td>
                <td>{r.cpi ?? 'N/A'}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
