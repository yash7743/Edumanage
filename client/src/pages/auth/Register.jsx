import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const authContext = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    semester: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'semester' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return toast.error('Please fill in all required fields');
    }

    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      studentId: form.studentId.trim() || undefined,
      semester: Number(form.semester) || 1,
    };

    try {
      if (authContext && typeof authContext.register === 'function') {
        await authContext.register(payload);
      } else {
        const res = await api.post('/auth/register', payload);
        const data = res.data?.data || res.data;
        if (data?.token) {
          localStorage.setItem('token', data.token);
        }
        localStorage.setItem('user', JSON.stringify(data));
      }

      toast.success('Account created successfully!');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration Error:', err);
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Registration failed. Please check your details.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="card w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-600">EduManage</h1>
          <p className="text-sm text-gray-500 mt-1">Create your student account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label block text-xs font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              required
              className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="student@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block text-xs font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                name="studentId"
                required
                className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="STU-1001"
                value={form.studentId}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label block text-xs font-medium text-gray-700 mb-1">
                Semester
              </label>
              <input
                type="number"
                name="semester"
                min="1"
                max="12"
                required
                className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={form.semester}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              minLength={8}
              required
              autoComplete="new-password"
              className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••••••"
              value={form.password}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;