import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/submissions');
        setSubmissions(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Submissions</h1>
      {submissions.length === 0 ? (
        <EmptyState title="No submissions yet" message="Submit an assignment to see it here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Assignment</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Marks</th>
                <th className="py-2">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4">{s.assignment?.title}</td>
                  <td className="py-2 pr-4">{new Date(s.submittedAt).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`badge ${
                        s.status === 'evaluated'
                          ? 'bg-green-50 text-green-700'
                          : s.status === 'late'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{s.marks ?? '—'} / {s.assignment?.maxMarks}</td>
                  <td className="py-2">{s.feedback || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions;
