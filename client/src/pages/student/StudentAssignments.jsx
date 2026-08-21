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

  // Document Viewer State
  const [viewingDoc, setViewingDoc] = useState(null); // { title, url, type }
  const [viewLoading, setViewLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([
        api.get('/assignments'),
        api.get('/submissions'),
      ]);
      setAssignments(a.data?.data || []);
      setMySubmissions(s.data?.data || []);
    } catch (err) {
      console.error('LOAD ERROR:', err);
      toast.error('Failed to load assignments');
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
      if (viewingDoc?.url) URL.revokeObjectURL(viewingDoc.url);
    };
  }, [viewingDoc]);

  const submissionFor = (assignmentId) =>
    mySubmissions.find(
      (s) => s.assignment?._id === assignmentId || s.assignment === assignmentId
    );

  const handleViewAssignment = async (assignment) => {
    if (!assignment.file?.storedName) {
      return toast.error('No attached document for this assignment');
    }

    try {
      setViewLoading(true);
      setViewingDoc({ title: `Question Sheet: ${assignment.title}`, url: null });

      const res = await api.get(`/assignments/${assignment._id}/view`, {
        responseType: 'blob',
        headers: {
          Accept: assignment.file?.mimeType || 'application/pdf, */*',
        },
      });

      if (viewingDoc?.url) URL.revokeObjectURL(viewingDoc.url);

      const mimeType = res.data?.type || assignment.file?.mimeType || 'application/pdf';
      const blob = new Blob([res.data], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);

      setViewingDoc({
        title: `Question Sheet: ${assignment.title}`,
        url: objectUrl,
      });
    } catch (err) {
      console.error('VIEW ASSIGNMENT ERROR:', err);
      toast.error('Unable to open document for viewing.');
      setViewingDoc(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleViewSubmission = async (submission, assignmentTitle) => {
    if (!submission.file?.storedName) {
      return toast.error('No attached submission file');
    }

    try {
      setViewLoading(true);
      setViewingDoc({ title: `My Submission: ${assignmentTitle}`, url: null });

      const res = await api.get(`/submissions/${submission._id}/view`, {
        responseType: 'blob',
        headers: {
          Accept: submission.file?.mimeType || 'application/pdf, */*',
        },
      });

      if (viewingDoc?.url) URL.revokeObjectURL(viewingDoc.url);

      const mimeType = res.data?.type || submission.file?.mimeType || 'application/pdf';
      const blob = new Blob([res.data], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);

      setViewingDoc({
        title: `My Submission: ${assignmentTitle}`,
        url: objectUrl,
      });
    } catch (err) {
      console.error('VIEW SUBMISSION ERROR:', err);
      toast.error('Unable to preview your submission.');
      setViewingDoc(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (assignmentId, filename, mimeType) => {
    const toastId = toast.loading('Downloading file...');
    try {
      const res = await api.get(`/assignments/${assignmentId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: mimeType || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'assignment.pdf';
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
    if (viewingDoc?.url) URL.revokeObjectURL(viewingDoc.url);
    setViewingDoc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please choose a file to submit');

    const fd = new FormData();
    fd.append('assignment', active._id);
    fd.append('file', file);

    setSubmitting(true);
    try {
      await api.post('/submissions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
              <div
                key={a._id}
                className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5"
              >
                <div className="flex-1 min-w-[240px]">
                  <div className="font-semibold text-gray-900 text-base">{a.title}</div>
                  <div className="text-sm text-gray-500">{a.subject?.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Deadline: {new Date(a.deadline).toLocaleString()} · Max Marks: {a.maxMarks}
                  </div>

                  {a.description && (
                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded">
                      {a.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {sub ? (
                      <>
                        <span
                          className={`badge ${
                            sub.status === 'evaluated'
                              ? 'bg-green-50 text-green-700'
                              : sub.status === 'late'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {sub.status === 'evaluated'
                            ? `Evaluated: ${sub.marks}/${a.maxMarks}`
                            : `Status: ${sub.status}`}
                        </span>

                        {sub.file?.storedName && (
                          <button
                            onClick={() => handleViewSubmission(sub, a.title)}
                            className="text-xs text-primary-600 hover:underline font-medium ml-1"
                          >
                            View Submitted Work
                          </button>
                        )}
                      </>
                    ) : overdue ? (
                      <span className="badge bg-red-50 text-red-700">
                        Overdue — not submitted
                      </span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-600">
                        Pending submission
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {a.file?.storedName && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewAssignment(a)}
                        className="btn-primary text-xs px-3 py-2 flex-1 text-center"
                      >
                        View & Learn
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(a._id, a.file.originalName, a.file.mimeType)
                        }
                        className="btn-secondary text-xs px-3 py-2 flex-1 text-center"
                      >
                        Download
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setActive(a)}
                    className="btn-primary text-xs px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    {sub ? 'Re-submit' : 'Submit'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Viewer Modal (Inline Reading) */}
      <Modal open={!!viewingDoc} title={viewingDoc?.title || 'Document Viewer'} onClose={closeViewer}>
        <div className="w-full h-[78vh] flex flex-col">
          {viewLoading ? (
            <div className="m-auto text-center">
              <Loader />
              <p className="text-sm text-gray-500 mt-2">Loading document...</p>
            </div>
          ) : viewingDoc?.url ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs">
                <span className="text-gray-600 truncate mr-2">{viewingDoc?.title}</span>
                <a
                  href={viewingDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:underline font-semibold flex-shrink-0"
                >
                  Open in New Tab ↗
                </a>
              </div>
              <iframe
                src={`${viewingDoc.url}#toolbar=1&navpanes=0`}
                title={viewingDoc.title}
                className="w-full flex-1 rounded-b border-0"
              />
            </div>
          ) : (
            <div className="m-auto text-center text-sm text-gray-500">
              Unable to load preview.
            </div>
          )}
        </div>
      </Modal>

      {/* Submission Modal */}
      <Modal
        open={!!active}
        title={`Submit Assignment: ${active?.title || ''}`}
        onClose={() => setActive(null)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label block text-xs font-medium text-gray-700 mb-1">
              Select File (PDF, DOC, DOCX, PPT, PPTX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files[0])}
              className="input-field w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5"
          >
            {submitting ? 'Uploading...' : 'Submit Assignment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentAssignments;