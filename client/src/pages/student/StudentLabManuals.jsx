import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import DocViewerModal from '../../components/common/DocViewerModal';
import toast from 'react-hot-toast';

const StudentLabManuals = () => {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  // In-browser Document Viewer State
  const [viewingManual, setViewingManual] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/lab-manuals');
        setManuals(data?.data || []);
      } catch (err) {
        toast.error('Failed to load lab manuals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (viewUrl) URL.revokeObjectURL(viewUrl);
    };
  }, [viewUrl]);

  const handleView = async (manual) => {
    if (!manual.file?.storedName) {
      return toast.error('No attached file available');
    }

    try {
      setViewLoading(true);
      setViewingManual(manual);

      const res = await api.get(`/lab-manuals/${manual._id}/view`, {
        responseType: 'blob',
        headers: {
          Accept: manual.file?.mimeType || 'application/pdf, */*',
        },
      });

      if (viewUrl) URL.revokeObjectURL(viewUrl);

      const blobType = res.data?.type || manual.file?.mimeType || 'application/pdf';
      const blob = new Blob([res.data], { type: blobType });
      const objectUrl = URL.createObjectURL(blob);
      setViewUrl(objectUrl);
    } catch (err) {
      console.error('VIEW ERROR:', err);
      toast.error('Unable to open document for viewing');
      setViewingManual(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (id, filename, mimeType) => {
    const toastId = toast.loading('Preparing download...');
    try {
      const res = await api.get(`/lab-manuals/${id}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: mimeType || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'lab-manual.pdf';
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
    setViewingManual(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lab Manuals</h1>
          <p className="text-xs text-gray-500 mt-1">Read guidelines online or download PDF copies</p>
        </div>
      </div>

      {manuals.length === 0 ? (
        <EmptyState title="No lab manuals available" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {manuals.map((m) => (
            <div key={m._id} className="card flex flex-col justify-between p-5">
              <div>
                <span className="badge bg-primary-50 text-primary-700 font-semibold">
                  {m.subject?.code || 'LAB'}
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 text-base">{m.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {m.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleView(m)}
                  className="btn-primary text-xs px-3 py-2 flex-1 text-center font-medium"
                >
                  View & Learn
                </button>
                <button
                  onClick={() => handleDownload(m._id, m.file?.originalName, m.file?.mimeType)}
                  className="btn-secondary text-xs px-3 py-2 flex-1 text-center font-medium"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified In-Browser Document Viewer Modal */}
      <DocViewerModal
        open={!!viewingManual}
        title={viewingManual?.title || 'Lab Manual Viewer'}
        docUrl={viewUrl}
        loading={viewLoading}
        onClose={closeViewer}
      />
    </div>
  );
};

export default StudentLabManuals;