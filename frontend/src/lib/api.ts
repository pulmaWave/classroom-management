import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token và redirect về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;

// API functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: any) =>
    api.post('/auth/register', data),

  getProfile: () =>
    api.get('/auth/me'),
};

export const classroomAPI = {
  getAll: () =>
    api.get('/classrooms'),

  getById: (id: string) =>
    api.get(`/classrooms/${id}`),

  create: (data: any) =>
    api.post('/classrooms', data),

  update: (id: string, data: any) =>
    api.put(`/classrooms/${id}`, data),

  delete: (id: string) =>
    api.delete(`/classrooms/${id}`),

  enrollStudent: (id: string, studentId: string) =>
    api.post(`/classrooms/${id}/enroll`, { studentId }),

  getStudents: (id: string) =>
    api.get(`/classrooms/${id}/students`),
};

export const studentAPI = {
  getAll: () =>
    api.get('/students'),

  getById: (id: string) =>
    api.get(`/students/${id}`),

  create: (data: any) =>
    api.post('/students', data),

  update: (id: string, data: any) =>
    api.put(`/students/${id}`, data),

  delete: (id: string) =>
    api.delete(`/students/${id}`),
};