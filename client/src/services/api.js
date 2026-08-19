import axios from 'axios';

const api = axios.create({
  baseURL: 'https://edumanage-server-2wgg.onrender.com/api',
  withCredentials: true, // Sends cross-domain cookies automatically
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach bearer token if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic redirect on expired sessions
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;