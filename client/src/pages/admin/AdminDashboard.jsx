import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentsCount: 0,
    subjectsCount: 0,
    assignmentsCount: 0,
    submissionsCount: 0,
    labManualsCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch multiple metrics safely in parallel
        const [studentsRes, subjectsRes, assignmentsRes, manualsRes, submissionsRes] = await Promise.allSettled([
          api.get('/users?role=student'),
          api.get('/subjects'),
          api.get('/assignments'),
          api.get('/lab-manuals'),
          api.get('/submissions'),
        ]);

        setStats({
          studentsCount: studentsRes.status === 'fulfilled' ? (studentsRes.value.data?.data?.length || studentsRes.value.data?.count || 0) : 0,
          subjectsCount: subjectsRes.status === 'fulfilled' ? (subjectsRes.value.data?.data?.length || 0) : 0,
          assignmentsCount: assignmentsRes.status === 'fulfilled' ? (assignmentsRes.value.data?.data?.length || 0) : 0,
          labManualsCount: manualsRes.status === 'fulfilled' ? (manualsRes.value.data?.data?.length || 0) : 0,
          submissionsCount: submissionsRes.status === 'fulfilled' ? (submissionsRes.value.data?.data?.length || 0) : 0,
        });

        if (submissionsRes.status === 'fulfilled') {
          const subs = submissionsRes.value.data?.data || [];
          setRecentActivities(subs.slice(0, 5));
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        toast.error('Failed to load some dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-xl p-6 shadow-md">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name || 'Administrator'}!
        </h1>
        <p className="text-primary-100 text-sm mt-1">
          Role: <span className="font-semibold uppercase">{user?.adminRole?.replace('_', ' ') || 'Admin'}</span>
        </p>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.studentsCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-xl">👥</div>
        </div>

        <div className="card p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subjects</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.subjectsCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xl">📚</div>
        </div>

        <div className="card p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lab Manuals</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.labManualsCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg text-xl">🧪</div>
        </div>

        <div className="card p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignments</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.assignmentsCount}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg text-xl">📝</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="card p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/subjects"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border text-center transition font-medium text-sm text-gray-700 block"
          >
            Manage Subjects & Chapters
          </Link>
          <Link
            to="/admin/lab-manuals"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border text-center transition font-medium text-sm text-gray-700 block"
          >
            Manage Lab Manuals
          </Link>
          <Link
            to="/admin/assignments"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border text-center transition font-medium text-sm text-gray-700 block"
          >
            Manage Assignments
          </Link>
          <Link
            to="/admin/students"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border text-center transition font-medium text-sm text-gray-700 block"
          >
            Manage Students
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;