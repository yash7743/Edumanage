import axios from 'axios';

const api = axios.create({
  baseURL: 'https://edumanage-server-2wgg.onrender.com/api',
  withCredentials: true, // send httpOnly JWT cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

// Redirect to login on 401 (session expired) for any authenticated page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('login')) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;