import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const SubjectDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chapters');

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/subjects/${id}`);
        setData(res.data?.data);
      } catch {
        toast.error('Could not load subject data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    return () => {
      if (viewUrl) URL.revokeObjectURL(viewUrl);
    };
  }, [viewUrl]);

  const handleViewMaterial = async (endpoint, docTitle, mimeType = 'application/pdf') => {
    try {
      setViewLoading(true);
      setViewingDoc({ title: docTitle });

      const res = await api.get(endpoint, { responseType: 'blob' });

      if (viewUrl) URL.revokeObjectURL(viewUrl);

      const blob = new Blob([res.data], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      setViewUrl(objectUrl);
    } catch {
      toast.error('Unable to open document for viewing');
      setViewingDoc(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (endpoint, defaultFilename, mimeType = 'application/octet-stream') => {
    const toastId = toast.loading('Preparing download...');
    try {
      const res = await api.get(endpoint, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download completed', { id: toastId });
    } catch {
      toast.error('Download failed', { id: toastId });
    }
  };

  const closeViewer = () => {
    if (viewUrl) URL.revokeObjectURL(viewUrl);
    setViewUrl(null);
    setViewingDoc(null);
  };

  if (loading) return <Loader />;
  if (!data || !data.subject) return <EmptyState title="Subject not found" />;

  const { subject, chapters = [], labManuals = [], assignments = [] } = data;

  return (
    <div className="space-y-6">
      {/* Subject Header */}
      <div>
        <Link to="/student/subjects" className="text-xs font-semibold text-primary-600 hover:underline">
          ← Back to All Subjects
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="badge bg-primary-50 text-primary-700 font-semibold">{subject.code}</span>
          <span className="badge bg-gray-100 text-gray-700">Semester {subject.semester}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{subject.name}</h1>
        {subject.description && (
          <p className="text-sm text-gray-600 mt-2 max-w-3xl leading-relaxed">{subject.description}</p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('chapters')}
          className={`pb-3 transition relative ${
            activeTab === 'chapters'
              ? 'text-primary-600 border-b-2 border-primary-600 font-semibold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Chapters & Notes ({chapters.length})
        </button>
        <button
          onClick={() => setActiveTab('manuals')}
          className={`pb-3 transition relative ${
            activeTab === 'manuals'
              ? 'text-primary-600 border-b-2 border-primary-600 font-semibold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Lab Manuals ({labManuals.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 transition relative ${
            activeTab === 'assignments'
              ? 'text-primary-600 border-b-2 border-primary-600 font-semibold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Assignments ({assignments.length})
        </button>
      </div>

      {/* TAB 1: CHAPTERS */}
      {activeTab === 'chapters' && (
        <div>
          {chapters.length === 0 ? (
            <EmptyState title="No chapters uploaded yet" message="Check back later for chapter materials." />
          ) : (
            <div className="space-y-4">
              {chapters.map((c) => (
                <div key={c._id} className="card p-5">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <div className="text-xs font-semibold uppercase text-primary-600 tracking-wider">
                        Chapter {c.chapterNumber}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mt-0.5">{c.title}</h3>
                      {c.description && <p className="text-sm text-gray-600 mt-1">{c.description}</p>}
                      {c.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-line border border-gray-100">
                          {c.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                    {c.materialFile?.storedName && (
                      <>
                        <button
                          onClick={() =>
                            handleViewMaterial(
                              `/chapters/${c._id}/view`,
                              `Chapter ${c.chapterNumber}: ${c.title}`,
                              c.materialFile.mimeType
                            )
                          }
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          View & Learn
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(
                              `/chapters/${c._id}/download`,
                              c.materialFile.originalName,
                              c.materialFile.mimeType
                            )
                          }
                          className="btn-secondary text-xs px-3 py-1.5"
                        >
                          Download Material
                        </button>
                      </>
                    )}
                    {c.resourceUrl && (
                      <a
                        href={c.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        External Link ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LAB MANUALS */}
      {activeTab === 'manuals' && (
        <div>
          {labManuals.length === 0 ? (
            <EmptyState title="No lab manuals uploaded" message="No lab resources available for this subject." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labManuals.map((m) => (
                <div key={m._id} className="card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{m.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{m.description || 'Lab Guide'}</p>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() =>
                        handleViewMaterial(`/lab-manuals/${m._id}/view`, m.title, m.file?.mimeType)
                      }
                      className="btn-primary text-xs px-3 py-1.5 flex-1 text-center"
                    >
                      View & Learn
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(
                          `/lab-manuals/${m._id}/download`,
                          m.file?.originalName || `${m.title}.pdf`,
                          m.file?.mimeType
                        )
                      }
                      className="btn-secondary text-xs px-3 py-1.5 flex-1 text-center"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div>
          {assignments.length === 0 ? (
            <EmptyState title="No assignments assigned" message="You have no assignments for this subject." />
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a._id} className="card p-5 flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Deadline: {new Date(a.deadline).toLocaleString()} · Max Marks: {a.maxMarks}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {a.file?.storedName && (
                      <button
                        onClick={() =>
                          handleViewMaterial(`/assignments/${a._id}/view`, a.title, a.file?.mimeType)
                        }
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        View Question
                      </button>
                    )}
                    <Link to="/student/assignments" className="btn-primary text-xs px-3 py-1.5">
                      Go to Submission →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In-Browser PDF Document Modal */}
      <Modal open={!!viewingDoc} title={viewingDoc?.title || 'Document Viewer'} onClose={closeViewer}>
        <div className="w-full h-[75vh] flex flex-col">
          {viewLoading ? (
            <div className="m-auto text-center">
              <Loader />
              <p className="text-sm text-gray-500 mt-2">Loading document...</p>
            </div>
          ) : viewUrl ? (
            <iframe
              src={`${viewUrl}#toolbar=1&navpanes=0`}
              title={viewingDoc?.title}
              className="w-full h-full rounded border border-gray-200"
            />
          ) : (
            <div className="m-auto text-center text-sm text-gray-500">Unable to load document preview.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SubjectDetail;