import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([api.get('/assignments'), api.get('/submissions')]);
      setAssignments(a.data.data);
      setMySubmissions(s.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submissionFor = (assignmentId) => mySubmissions.find((s) => s.assignment?._id === assignmentId);

  const handleDownload = async (assignmentId, filename) => {
    try {
      const res = await api.get(`/assignments/${assignmentId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'assignment';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please choose a file');
    const fd = new FormData();
    fd.append('assignment', active._id);
    fd.append('file', file);
    setSubmitting(true);
    try {
      await api.post('/submissions', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Submitted successfully!');
      setActive(null);
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Assignments</h1>

      {assignments.length === 0 ? (
        <EmptyState title="No assignments yet" />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const sub = submissionFor(a._id);
            const overdue = new Date(a.deadline) < new Date();
            return (
              <div key={a._id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-gray-500">{a.subject?.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Deadline: {new Date(a.deadline).toLocaleString()} · Max Marks: {a.maxMarks}
                  </div>
                  {sub && (
                    <span className={`badge mt-2 ${sub.status === 'evaluated' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                      {sub.status === 'evaluated' ? `Evaluated: ${sub.marks}/${a.maxMarks}` : `Status: ${sub.status}`}
                    </span>
                  )}
                  {!sub && overdue && <span className="badge bg-red-50 text-red-700 mt-2">Overdue — not submitted</span>}
                </div>
                <div className="flex gap-2">
                  {a.file?.storedName && (
                    <button onClick={() => handleDownload(a._id, a.file.originalName)} className="btn-secondary text-sm">
                      Download Q.
                    </button>
                  )}
                  <button onClick={() => setActive(a)} className="btn-primary text-sm">
                    {sub ? 'Re-submit' : 'Submit'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!active} title={`Submit: ${active?.title || ''}`} onClose={() => setActive(null)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Upload your file (PDF, DOC, DOCX, PPT, PPTX)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files[0])}
              className="input-field"
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Uploading...' : 'Submit Assignment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentAssignments;
