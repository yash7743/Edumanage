import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '', semester: 1 });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-600">EduManage</h1>
          <p className="text-sm text-gray-500 mt-1">Create your student account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input name="name" required className="input-field" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" required className="input-field" value={form.email} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Student ID</label>
              <input name="studentId" required className="input-field" value={form.studentId} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Semester</label>
              <input
                type="number"
                name="semester"
                min="1"
                max="12"
                required
                className="input-field"
                value={form.semester}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              minLength={8}
              required
              className="input-field"
              value={form.password}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
