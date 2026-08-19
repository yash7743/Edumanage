import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calls /api/auth/login or /api/login on your Render server
      const { data } = await api.post('/auth/login', {
        email,
        password,
      });

      toast.success(data.message || 'Login successful!');

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.data?.user || data.user) {
        localStorage.setItem('user', JSON.stringify(data.data?.user || data.user));
      }

      navigate('/admin/dashboard');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Backend server is waking up or unreachable. Please retry in a few seconds.'
          : 'Invalid credentials');
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
            Admin Login
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Super Admin, Content Admin & Faculty Admin sign in here
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="superadmin@edumanage.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
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

        <div className="text-center">
          <Link to="/login" className="text-xs text-primary-600 hover:underline">
            Student? Go to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;