import { useState } from 'react';
import { professorService } from '../../services/api';

const emptyForm = {
  course_id: '',
  course_name: '',
  course_credit: 9,
  max_seats: 40,
  offering_dept: '',
};

export default function ProfessorCreateCourse() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await professorService.createCourse(form);
      setMessage(`Course ${form.course_id} saved (backend must implement POST /api/course).`);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Save failed.');
    }
  };

  return (
    <div className="content-panel">
      <h1 className="content-title">Create Course</h1>
      <p className="content-lead">
        Add a new offering. Lecture, tutorial, and lab meeting slots can be added in a follow-up API.
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
            placeholder="e.g. CE371"
          />
        </label>
        <label className="form-label">
          Title
          <input
            className="form-input"
            required
            value={form.course_name}
            onChange={(e) => setForm({ ...form, course_name: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label className="form-label">
            Credits
            <input
              className="form-input"
              type="number"
              min={1}
              max={40}
              value={form.course_credit}
              onChange={(e) => setForm({ ...form, course_credit: Number(e.target.value) })}
            />
          </label>
          <label className="form-label">
            Max seats
            <input
              className="form-input"
              type="number"
              min={1}
              value={form.max_seats}
              onChange={(e) => setForm({ ...form, max_seats: Number(e.target.value) })}
            />
          </label>
          <label className="form-label">
            Offering dept
            <input
              className="form-input"
              value={form.offering_dept}
              onChange={(e) => setForm({ ...form, offering_dept: e.target.value.toUpperCase() })}
              placeholder="CE"
            />
          </label>
        </div>
        <button type="submit" className="btn-primary">
          Save course
        </button>
      </form>
    </div>
  );
}
