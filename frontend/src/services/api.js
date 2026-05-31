import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartcattle_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartcattle_token');
      localStorage.removeItem('smartcattle_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  getProfile: () => api.get('/auth/profile'),
};

export const cowAPI = {
  getAll: (params) => api.get('/cows', { params }),
  create: (data) => api.post('/cows', data),
  update: (id, data) => api.put(`/cows/${id}`, data),
  delete: (id) => api.delete(`/cows/${id}`),
  getCount: () => api.get('/cows/count'),
};

export const diseaseAPI = {
  analyzeImage: (formData) =>
    api.post('/disease/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeSymptoms: (data) => api.post('/disease/symptom', data),
};

export const vetAPI = {
  getNearby: (lat, lng) => api.get('/vets', { params: { lat, lng } }),
};

export const weatherAPI = {
  get: (lat, lng) => api.get('/weather', { params: { lat, lng } }),
};

export const vaccinationAPI = {
  getAll: () => api.get('/vaccination'),
  create: (data) => api.post('/vaccination', data),
};
