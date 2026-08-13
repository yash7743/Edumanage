import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ManageSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/submissions');
      setSubmissions(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEvaluate = (s) => {
    setActive(s);
    setMarks(s.marks ?? '');
    setFeedback(s.feedback ?? '');
  };

  const handleDownload = async (id, filename) => {
    try {
      const res = await api.get(`/submissions/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'submission';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/submissions/${active._id}`, { marks, feedback });
      toast.success('Submission evaluated');
      setActive(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Submission Management</h1>

      {submissions.length === 0 ? (
        <EmptyState title="No submissions yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Assignment</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Marks</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4">{s.student?.name}</td>
                  <td className="py-2 pr-4">{s.assignment?.title}</td>
                  <td className="py-2 pr-4">{new Date(s.submittedAt).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`badge ${
                        s.status === 'evaluated' ? 'bg-green-50 text-green-700' : s.status === 'late' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{s.marks ?? '—'} / {s.assignment?.maxMarks}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => handleDownload(s._id, s.file?.originalName)} className="btn-secondary text-xs">
                      Download
                    </button>
                    <button onClick={() => openEvaluate(s)} className="btn-primary text-xs">
                      Evaluate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!active} title={`Evaluate: ${active?.student?.name || ''}`} onClose={() => setActive(null)}>
        <form onSubmit={handleEvaluate} className="space-y-4">
          <div>
            <label className="label">Marks (out of {active?.assignment?.maxMarks})</label>
            <input
              type="number"
              min="0"
              max={active?.assignment?.maxMarks}
              required
              className="input-field"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Feedback</label>
            <textarea className="input-field" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Save Evaluation'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSubmissions;
