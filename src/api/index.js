import axios from 'axios';
import { getToken, clearToken } from '../auth';
import router from '../router';

const API_BASE_URL = 'https://notes-app-m8l9.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401 && !['/login/', '/register/'].includes(error.config.url)) {
      clearToken();
      alert('认证失败，请重新登录。');
      router.push('/');
    }
    return Promise.reject(error);
  }
);


export default api;

export const authService = {
  login: (username, password) => api.post('/login/', { username, password }),
  register: (username, password) => api.post('/register/', { username, password }),
};

export const notesService = {
  getNotes: () => api.get('/notes/'),
  addNote: (note) => api.post('/notes/', note),
  updateNote: (id, note) => api.put(`/notes/${id}/`, note),
  deleteNote: (id) => api.delete(`/notes/${id}/`),
};