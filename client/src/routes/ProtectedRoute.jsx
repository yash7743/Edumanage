import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * allowedRoles: ['student'] | ['admin'] | undefined (any authenticated user)
 * allowedAdminRoles: e.g. ['super_admin','content_admin'] — only checked when role==='admin'
 */
const ProtectedRoute = ({ allowedRoles, allowedAdminRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  if (allowedAdminRoles && user.role === 'admin' && !allowedAdminRoles.includes(user.adminRole)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
