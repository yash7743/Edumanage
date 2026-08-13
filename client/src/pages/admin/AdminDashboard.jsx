import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ label, value, icon }) => (
  <div className="card">
    <div className="text-2xl">{icon}</div>
    <div className="text-2xl font-bold mt-2">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Students" value={stats.totalStudents} icon="🎓" />
        <StatCard label="Subjects" value={stats.totalSubjects} icon="📚" />
        <StatCard label="Chapters" value={stats.totalChapters} icon="📖" />
        <StatCard label="Assignments" value={stats.totalAssignments} icon="📝" />
        <StatCard label="Lab Manuals" value={stats.totalLabManuals} icon="🧪" />
        <StatCard label="Pending" value={stats.pendingSubmissions} icon="⏳" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-3">Recent Submissions</h2>
          {stats.recentSubmissions.length === 0 ? (
            <p className="text-sm text-gray-500">No recent submissions.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.recentSubmissions.map((s) => (
                <li key={s._id} className="py-2 text-sm flex justify-between">
                  <span>{s.student?.name} — {s.assignment?.title}</span>
                  <span className="text-gray-400">{new Date(s.submittedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Upcoming Deadlines (7 days)</h2>
          {stats.upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing due soon.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.upcomingDeadlines.map((a) => (
                <li key={a._id} className="py-2 text-sm flex justify-between">
                  <span>{a.title}</span>
                  <span className="text-amber-600">{new Date(a.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
