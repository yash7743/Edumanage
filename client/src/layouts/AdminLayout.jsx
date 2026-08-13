import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  content_admin: 'Content Admin',
  faculty_admin: 'Faculty Admin',
};

// Each admin sub-role only sees the sections it has access to
const ALL_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', roles: ['super_admin', 'content_admin', 'faculty_admin'] },
  { to: '/admin/students', label: 'Students', roles: ['super_admin', 'faculty_admin', 'content_admin'] },
  { to: '/admin/subjects', label: 'Subjects', roles: ['super_admin', 'content_admin'] },
  { to: '/admin/chapters', label: 'Chapters', roles: ['super_admin', 'content_admin'] },
  { to: '/admin/assignments', label: 'Assignments', roles: ['super_admin', 'content_admin', 'faculty_admin'] },
  { to: '/admin/lab-manuals', label: 'Lab Manuals', roles: ['super_admin', 'content_admin'] },
  { to: '/admin/submissions', label: 'Submissions', roles: ['super_admin', 'faculty_admin'] },
  { to: '/admin/admins', label: 'Admins', roles: ['super_admin'] },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = ALL_LINKS.filter((l) => l.roles.includes(user?.adminRole));

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 text-gray-100 p-4">
        <div className="text-xl font-bold text-white mb-1 px-2">EduManage</div>
        <div className="text-xs text-gray-400 mb-8 px-2">Admin Portal</div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
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
          <span className="badge bg-primary-50 text-primary-700">{ROLE_LABELS[user?.adminRole]}</span>
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

export default AdminLayout;
