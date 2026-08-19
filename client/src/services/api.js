import axios from 'axios';

const api = axios.create({
  baseURL: 'https://edumanage-backend-zdcc.onrender.com/api',
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;