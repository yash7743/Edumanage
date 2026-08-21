import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const authContext = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const payload = res.data?.data || res.data;
      const token = payload?.token || res.data?.token;

      // Ensure student isn't using an admin-only credential here
      if (payload?.role === 'admin') {
        toast.error('Admin account detected. Please use the Admin Login page.');
        setLoading(false);
        return;
      }

      // 1. Store token and user object synchronously in localStorage
      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(payload));

      // 2. Update AuthContext state directly if login handler is provided
      if (authContext?.login && typeof authContext.login === 'function') {
        authContext.login(payload, token);
      } else if (authContext?.setUser && typeof authContext.setUser === 'function') {
        authContext.setUser(payload);
      }

      // 3. Optional non-blocking refetch
      if (authContext?.refetch && typeof authContext.refetch === 'function') {
        authContext.refetch().catch(() => {});
      }

      toast.success(res.data?.message || 'Login successful!');

      // 4. Force immediate navigation to Student Dashboard
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      console.error('LOGIN ERROR:', err);

      const errorMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Backend server is waking up or unreachable. Please retry in a few seconds.'
          : 'Invalid email or password.');

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">EduManage</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mt-1">
            Student Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs text-primary-600">
          <Link to="/register" className="hover:underline">
            Create an account
          </Link>
          <Link to="/admin/login" className="hover:underline">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;