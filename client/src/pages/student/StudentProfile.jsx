import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (logout && typeof logout === 'function') {
        await logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const rows = [
    { label: 'Full Name', value: user?.name || '—' },
    { label: 'Email Address', value: user?.email || '—' },
    { label: 'Student ID', value: user?.studentId || '—' },
    { label: 'Current Semester', value: user?.semester ? `Semester ${user.semester}` : '—' },
    {
      label: 'Account Status',
      value: (
        <span className="badge bg-green-50 text-green-700 font-medium">
          {user?.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      label: 'Joined On',
      value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—',
    },
  ];

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ST';

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{user?.name || 'Student'}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 mt-2">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between items-center py-3 text-sm">
              <span className="text-gray-500">{r.label}</span>
              <span className="font-medium text-gray-800">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="pt-5 mt-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;