import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://edumanage-server-2wgg.onrender.com/api',
  withCredentials: true, // Sends cross-domain cookies automatically
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Automatically attach JWT from localStorage if token is stored there
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on expired session
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;