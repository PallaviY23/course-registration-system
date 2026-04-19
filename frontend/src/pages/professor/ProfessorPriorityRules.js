import { useState } from 'react';
import { professorService } from '../../services/api';

export default function ProfessorPriorityRules() {
  const [form, setForm] = useState({
    course_id: '',
    weight_cpi: 1,
    weight_year: 0.1,
    weight_first_come: 0.01,
    weight_dept: 0.5,
    weight_major: 1,
    weight_minor: 0.6,
    weight_elective: 0.4,
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await professorService.setPriority(form);
      setMessage('Priority rules submitted.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submit failed.');
    }
  };

  return (
    <div className="content-panel">
      <h1 className="content-title">Priority Rules</h1>
      <p className="content-lead">
        Weights for CPI, year, first-come, department match, and Major, Minor, or Elective intent. Used when computing priority scores.
      </p>
      {message && <p className="panel-hint">{message}</p>}
      {error && <p className="panel-error">{error}</p>}
      <form className="stack-form" onSubmit={submit}>
        <label className="form-label">
          Course ID
          <input
            className="form-input"
            required
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value.toUpperCase() })}
          />
        </label>
        <div className="form-grid-weights">
          {[
            ['weight_cpi', 'CPI'],
            ['weight_year', 'Year'],
            ['weight_first_come', 'First-Come'],
            ['weight_dept', 'Dept Match'],
            ['weight_major', 'Major Intent'],
            ['weight_minor', 'Minor Intent'],
            ['weight_elective', 'Elective Intent'],
          ].map(([key, label]) => (
            <label key={key} className="form-label">
              {label}
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) || 0 })}
              />
            </label>
          ))}
        </div>
        <button type="submit" className="btn-primary">
          Save Rules
        </button>
      </form>
    </div>
  );
}
