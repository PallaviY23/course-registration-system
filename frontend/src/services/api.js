import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const courseService = {
  getAll: () => api.get('/courses'),
  requestCourse: (courseId) => api.post('/request', { courseId }),
  getMyRequests: () => api.get('/my-requests'),
  dropCourse: (courseId) => api.delete(`/request/${courseId}`),
};

export const adminService = {
  runAllocation: () => api.post('/run-allocation'),
  setPriority: (data) => api.post('/set-priority', data),
};

export default api;