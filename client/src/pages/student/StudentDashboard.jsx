import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [aRes, sRes, subRes] = await Promise.all([
          api.get('/assignments'),
          api.get('/submissions'),
          api.get('/subjects', { params: { limit: 100 } }),
        ]);

        setAssignments(aRes.data?.data || []);
        setSubmissions(subRes.data?.data || []);
        setSubjects(sRes.data?.data || []);
      } catch (err) {
        toast.error('Failed to refresh dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <Loader />;

  const submittedAssignmentIds = new Set(
    submissions.map((s) => s.assignment?._id || s.assignment)
  );

  const upcoming = assignments
    .filter((a) => new Date(a.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const pendingCount = assignments.filter(
    (a) => !submittedAssignmentIds.has(a._id) && new Date(a.deadline) > new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p className="text-primary-100 text-sm mt-1">
            Student ID: <span className="font-semibold">{user?.studentId || 'N/A'}</span> · Semester{' '}
            <span className="font-semibold">{user?.semester || '1'}</span>
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <div className="bg-white/10 backdrop-blur px-3.5 py-2 rounded-lg border border-white/15">
            {pendingCount} Pending Assignment{pendingCount === 1 ? '' : 's'}
          </div>
          <div className="bg-white/10 backdrop-blur px-3.5 py-2 rounded-lg border border-white/15">
            {submissions.length} Submitted
          </div>
        </div>
      </div>

      {/* Navigation Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/student/subjects"
          className="card hover:shadow-md hover:border-primary-200 transition p-5 border border-gray-100 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            📚
          </div>
          <div className="mt-3 font-semibold text-gray-900 text-base">Subjects & Notes</div>
          <div className="text-sm text-gray-500 mt-0.5">Explore chapter notes and course materials</div>
        </Link>

        <Link
          to="/student/assignments"
          className="card hover:shadow-md hover:border-primary-200 transition p-5 border border-gray-100 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            📝
          </div>
          <div className="mt-3 font-semibold text-gray-900 text-base">Assignments</div>
          <div className="text-sm text-gray-500 mt-0.5">View questions, submit solutions & check grades</div>
        </Link>

        <Link
          to="/student/lab-manuals"
          className="card hover:shadow-md hover:border-primary-200 transition p-5 border border-gray-100 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            🧪
          </div>
          <div className="mt-3 font-semibold text-gray-900 text-base">Lab Manuals</div>
          <div className="text-sm text-gray-500 mt-0.5">Read & download experiment guidelines</div>
        </Link>
      </div>

      {/* Upcoming Deadlines Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Upcoming Deadlines</h2>
            <p className="text-xs text-gray-400">Assignments due in the near future</p>
          </div>
          <Link
            to="/student/assignments"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            View All →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            🎉 No upcoming deadlines. You're all caught up!
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcoming.map((a) => {
              const isSubmitted = submittedAssignmentIds.has(a._id);

              return (
                <li key={a._id} className="py-3.5 flex flex-wrap justify-between items-center gap-2">
                  <div className="min-w-[200px]">
                    <div className="font-medium text-sm text-gray-900">{a.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {a.subject?.name || a.subject?.code || 'Course Subject'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSubmitted ? (
                      <span className="badge bg-green-50 text-green-700 font-medium">Submitted</span>
                    ) : (
                      <span className="badge bg-amber-50 text-amber-700 font-medium">
                        Due {new Date(a.deadline).toLocaleDateString()}
                      </span>
                    )}

                    <Link
                      to="/student/assignments"
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1 bg-gray-100 rounded-md transition"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;