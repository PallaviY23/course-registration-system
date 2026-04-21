import { useEffect, useState } from 'react';
import { professorService } from '../../services/api';
import { MOCK_COURSES } from '../../data/mockData';
import TablePager from '../../components/TablePager';

export default function ProfessorMyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await professorService.getMyCourses();
        const list = Array.isArray(data) ? data : data?.courses ?? [];
        if (!cancelled) setCourses(list.length ? list : MOCK_COURSES);
        if (!list.length && !cancelled) setHint('Showing sample rows until the API returns your courses.');
      } catch {
        if (!cancelled) {
          setCourses(MOCK_COURSES);
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

  const totalPages =
    pageSize === 'all' ? 1 : Math.max(1, Math.ceil(courses.length / Number(pageSize || 10)));
  const safePage = Math.min(page, totalPages);
  const visibleCourses =
    pageSize === 'all'
      ? courses
      : courses.slice((safePage - 1) * Number(pageSize), (safePage - 1) * Number(pageSize) + Number(pageSize));

  if (loading) {
    return <p className="panel-muted">Loading courses...</p>;
  }

  return (
    <div className="content-panel">
      <h1 className="content-title">My Courses</h1>
      <p className="content-lead">
        Courses you coordinate. Set seats, prerequisites, and priority weights from the other menus.
      </p>
      {hint && <p className="panel-hint">{hint}</p>}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Max seats</th>
              <th>Dept</th>
            </tr>
          </thead>
          <tbody>
            {visibleCourses.map((c) => {
              const id = c.course_id || c.id;
              return (
                <tr key={id}>
                  <td>
                    <strong>{id}</strong>
                  </td>
                  <td>{c.course_name || c.name}</td>
                  <td>{c.course_credit ?? c.credits}</td>
                  <td>{c.max_seats ?? 'N/A'}</td>
                  <td>{c.offering_dept ?? c.dept}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePager
        total={courses.length}
        page={safePage}
        pageSize={pageSize}
        onPageChange={(next) => setPage(Math.min(Math.max(next, 1), totalPages))}
        onPageSizeChange={(next) => {
          setPageSize(next);
          setPage(1);
        }}
      />
    </div>
  );
}
