import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const links = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/subjects', label: 'Subjects' },
  { to: '/student/assignments', label: 'Assignments' },
  { to: '/student/lab-manuals', label: 'Lab Manuals' },
  { to: '/student/submissions', label: 'My Submissions' },
  { to: '/student/profile', label: 'Profile' },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-100 p-4">
        <div className="text-xl font-bold text-primary-600 mb-8 px-2">EduManage</div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="md:hidden text-lg font-bold text-primary-600">EduManage</div>
          <div className="hidden md:block text-sm text-gray-500">Student Portal</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 hidden sm:inline">{user?.name}</span>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </header>

        <nav className="md:hidden flex overflow-x-auto gap-2 px-4 py-2 bg-white border-b border-gray-100">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${
                  isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
