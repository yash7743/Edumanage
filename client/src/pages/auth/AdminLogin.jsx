import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * ONE login page for ALL admin sub-roles — Super Admin, Content Admin,
 * and Faculty Admin all sign in here. There is no per-role login screen;
 * the backend resolves which admin sub-role the account has and the
 * dashboard/sidebar adapt automatically after login (see AdminLayout).
 */
const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        toast.error('This account is not an admin account.');
        return;
      }
      toast.success(`Welcome, ${user.name}`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-600">EduManage</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Login</p>
          <p className="text-xs text-gray-400 mt-1">
            Super Admin, Content Admin & Faculty Admin all sign in here
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              autoFocus
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-5">
          Student? <Link to="/login" className="underline">Go to Student Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
