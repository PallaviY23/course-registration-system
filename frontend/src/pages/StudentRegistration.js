import { useState } from 'react';
import TablePager from '../components/TablePager';

const StudentRegistration = () => {
  const [courses, setCourses] = useState([
    { id: 'CE371', name: 'DESIGN OF REINFORCED CONCRETE STRUCTURES', instructor: 'VINAY KUMAR GUPTA', credits: 9, status: 'Form Submitted', type: 'DE' },
    { id: 'CE683', name: 'HUMANS, ENVIRONMENT AND SUSTAINABLE DEV', instructor: 'MANOJ TIWARI', credits: 9, status: 'Form Submitted', type: 'DE' },
    { id: 'CS610', name: 'PROGRAMMING FOR PERFORMANCE', instructor: 'SWARNENDU BISWAS', credits: 9, status: 'Auto Dropped', type: 'DE' },
  ]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const totalPages =
    pageSize === 'all' ? 1 : Math.max(1, Math.ceil(courses.length / Number(pageSize || 10)));
  const safePage = Math.min(page, totalPages);
  const visibleCourses =
    pageSize === 'all'
      ? courses
      : courses.slice((safePage - 1) * Number(pageSize), (safePage - 1) * Number(pageSize) + Number(pageSize));

  return (
    <div className="space-y-4">
      {/* Student Info Card */}
      <div className="bg-white p-4 shadow rounded-sm border-l-4 border-blue-500 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><span className="font-bold">Roll No:</span> 230029</div>
        <div><span className="font-bold">Programme:</span> B.Tech</div>
        <div><span className="font-bold">Academic Status:</span> Normal</div>
        <div><span className="font-bold">Applied Credits:</span> 65</div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 overflow-x-auto py-2">
        <button type="button" className="flex items-center bg-gray-800 text-white px-3 py-1 text-sm rounded">+ Request course</button>
        <button type="button" className="flex items-center border border-gray-300 px-3 py-1 text-sm rounded">Show progress</button>
        <button type="button" className="flex items-center border border-gray-300 px-3 py-1 text-sm rounded">Print form</button>
      </div>

      {/* Course Table */}
      <div className="table-wrap">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#4DB6AC] text-white">
            <tr>
              <th className="p-3">Course Id</th>
              <th className="p-3">Course Name</th>
              <th className="p-3">Instructor</th>
              <th className="p-3">Credits</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visibleCourses.map((course, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-blue-600">{course.id}</td>
                <td className="p-3">{course.name}</td>
                <td className="p-3">{course.instructor}</td>
                <td className="p-3 text-center">{course.credits}</td>
                <td className={`p-3 font-bold ${course.status.includes('Dropped') ? 'text-red-500' : 'text-green-600'}`}>
                  {course.status}
                </td>
                <td className="p-3">
                    <button className="text-blue-500 hover:underline">View</button>
                </td>
              </tr>
            ))}
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
};

export default StudentRegistration;