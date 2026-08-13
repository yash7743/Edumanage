import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const StudentLabManuals = () => {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/lab-manuals');
        setManuals(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownload = async (id, filename) => {
    try {
      const res = await api.get(`/lab-manuals/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'lab-manual.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Lab Manuals</h1>
      {manuals.length === 0 ? (
        <EmptyState title="No lab manuals available" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {manuals.map((m) => (
            <div key={m._id} className="card">
              <div className="badge bg-primary-50 text-primary-700">{m.subject?.code}</div>
              <h3 className="font-semibold mt-2">{m.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{m.description}</p>
              <button onClick={() => handleDownload(m._id, m.file?.originalName)} className="btn-secondary text-sm mt-3">
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentLabManuals;
