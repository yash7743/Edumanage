import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document Viewer State
  const [viewingSub, setViewingSub] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/submissions');
      setSubmissions(data?.data || []);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (viewUrl) URL.revokeObjectURL(viewUrl);
    };
  }, [viewUrl]);

  const handleView = async (sub) => {
    if (!sub.file?.storedName) {
      return toast.error('No attached file found for this submission');
    }

    try {
      setViewLoading(true);
      setViewingSub(sub);

      const res = await api.get(`/submissions/${sub._id}/view`, {
        responseType: 'blob',
      });

      if (viewUrl) URL.revokeObjectURL(viewUrl);

      const mimeType = sub.file?.mimeType || 'application/pdf';
      const blob = new Blob([res.data], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      setViewUrl(objectUrl);
    } catch (err) {
      toast.error('Unable to open document preview');
      setViewingSub(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (id, filename, mimeType) => {
    const toastId = toast.loading('Downloading submission...');
    try {
      const res = await api.get(`/submissions/${id}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: mimeType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'my-submission.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded successfully', { id: toastId });
    } catch {
      toast.error('Download failed', { id: toastId });
    }
  };

  const closeViewer = () => {
    if (viewUrl) URL.revokeObjectURL(viewUrl);
    setViewUrl(null);
    setViewingSub(null);
  };

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
                <th className="py-2.5 pr-4">Assignment</th>
                <th className="py-2.5 pr-4">Submitted</th>
                <th className="py-2.5 pr-4">Status</th>
                <th className="py-2.5 pr-4">Marks</th>
                <th className="py-2.5 pr-4">Feedback</th>
                <th className="py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                  <td className="py-3 pr-4 font-medium text-gray-900">{s.assignment?.title || 'Assignment'}</td>
                  <td className="py-3 pr-4 text-gray-500">{new Date(s.submittedAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`badge ${
                        s.status === 'evaluated'
                          ? 'bg-green-50 text-green-700'
                          : s.status === 'late'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-700">
                    {s.marks ?? '—'} / {s.assignment?.maxMarks}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 max-w-xs truncate">{s.feedback || '—'}</td>
                  <td className="py-3">
                    {s.file?.storedName ? (
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleView(s)}
                          className="btn-primary text-xs px-2.5 py-1.5"
                        >
                          View Work
                        </button>
                        <button
                          onClick={() => handleDownload(s._id, s.file?.originalName, s.file?.mimeType)}
                          className="btn-secondary text-xs px-2.5 py-1.5"
                        >
                          Download
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No file</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submission Document Preview Modal */}
      <Modal
        open={!!viewingSub}
        title={`My Submission: ${viewingSub?.assignment?.title || ''}`}
        onClose={closeViewer}
      >
        <div className="w-full h-[75vh] flex flex-col">
          {viewLoading ? (
            <div className="m-auto text-center">
              <Loader />
              <p className="text-sm text-gray-500 mt-2">Loading document preview...</p>
            </div>
          ) : viewUrl ? (
            <iframe
              src={`${viewUrl}#toolbar=1&navpanes=0`}
              title={viewingSub?.assignment?.title}
              className="w-full h-full rounded border border-gray-200"
            />
          ) : (
            <div className="m-auto text-center text-sm text-gray-500">
              Unable to load document preview.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StudentSubmissions;