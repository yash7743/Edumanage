import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://edumanage-backend-zdcc.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // Ignore parse errors
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle unauthenticated redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      window.location.pathname.includes('/login') ||
      window.location.pathname.includes('/register') ||
      window.location.pathname.includes('/admin/login');

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;