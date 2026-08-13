import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/assignments');
        setAssignments(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const upcoming = assignments
    .filter((a) => new Date(a.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-sm text-gray-500">
          Student ID: {user?.studentId} · Semester {user?.semester}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/student/subjects" className="card hover:shadow-md transition-shadow">
          <div className="text-2xl">📚</div>
          <div className="mt-2 font-semibold">Subjects</div>
          <div className="text-sm text-gray-500">Browse chapters & materials</div>
        </Link>
        <Link to="/student/assignments" className="card hover:shadow-md transition-shadow">
          <div className="text-2xl">📝</div>
          <div className="mt-2 font-semibold">Assignments</div>
          <div className="text-sm text-gray-500">View & submit your work</div>
        </Link>
        <Link to="/student/lab-manuals" className="card hover:shadow-md transition-shadow">
          <div className="text-2xl">🧪</div>
          <div className="mt-2 font-semibold">Lab Manuals</div>
          <div className="text-sm text-gray-500">Download lab guides</div>
        </Link>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Upcoming Deadlines</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming deadlines. You're all caught up!</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcoming.map((a) => (
              <li key={a._id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.subject?.name}</div>
                </div>
                <span className="badge bg-amber-50 text-amber-700">
                  Due {new Date(a.deadline).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
