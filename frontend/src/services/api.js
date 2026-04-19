import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function attachAuthHeaders(user) {
  if (!user) return;
  const id = user.externalId || user.name;
  api.defaults.headers.common['X-User-Id'] = id;
  api.defaults.headers.common['X-User-Role'] = user.role;
}

export function clearAuthHeaders() {
  delete api.defaults.headers.common['X-User-Id'];
  delete api.defaults.headers.common['X-User-Role'];
}

/** Student */
export const studentService = {
  getCourses: () => api.get('/courses'),
  requestCourse: (body) => api.post('/request', body),
  getMyRequests: () => api.get('/my-requests'),
  getTimetable: () => api.get('/timetable'),
  withdrawRequest: (courseId) => api.delete(`/request/${courseId}`),
  dropEnrollment: (courseId) => api.post('/drop', { courseId }),
};

/** Professor */
export const professorService = {
  createCourse: (data) => api.post('/course', data),
  updateCourse: (courseId, data) => api.patch(`/course/${courseId}`, data),
  setPriority: (data) => api.post('/set-priority', data),
  setPrerequisite: (data) => api.post('/set-prerequisite', data),
  getMyCourses: () => api.get('/professor/courses'),
  getIncomingRequests: () => api.get('/professor/requests'),
};

/** Admin */
export const adminService = {
  runAllocation: () => api.post('/run-allocation'),
};

export default api;
