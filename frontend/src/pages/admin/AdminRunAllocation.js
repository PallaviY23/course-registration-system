import { useState } from 'react';
import { adminService } from '../../services/api';

export default function AdminRunAllocation() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await adminService.runAllocation();
      setResult(data ?? { ok: true, message: 'Allocation completed.' });
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Run failed. Connect the backend at POST /api/run-allocation.'
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="content-panel content-panel--center">
      <h1 className="content-title">Run Allocation</h1>
      <p className="content-lead">
        Runs priority scoring, seat limits, prerequisites, and timetable checks, then updates enrollments and waitlists.
      </p>
      <button type="button" className="btn-run" disabled={running} onClick={run}>
        {running ? 'Running...' : 'RUN ALLOCATION'}
      </button>
      {result && (
        <pre className="panel-pre">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
      )}
      {error && <p className="panel-error">{error}</p>}
    </div>
  );
}
