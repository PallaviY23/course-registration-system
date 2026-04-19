import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">pingala</div>
        <div style={{padding: '20px', fontSize: '14px'}}>Dashboard</div>
        <div style={{padding: '20px', fontSize: '14px', background: '#1a252b'}}>Academics</div>
      </div>

      <div className="main-content">
        <header className="header">
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <span style={{fontSize: '18px', fontWeight: 'bold'}}>Student Registration Application</span>
          </div>
          <div style={{fontSize: '14px'}}>AAYUSHMAN KUMAR</div>
        </header>

        <div className="content-body">
          <table className="course-table">
            <thead>
              <tr>
                <th>Course Id</th>
                <th>Course Name</th>
                <th>Instructor</th>
                <th>Credits</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td style={{color: '#2196F3', fontWeight: '500'}}>{course.id}</td>
                  <td>{course.name}</td>
                  <td>{course.instructor}</td>
                  <td>{course.credits}</td>
                  <td className={course.status.includes('Dropped') ? 'status-dropped' : 'status-submitted'}>
                    {course.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;