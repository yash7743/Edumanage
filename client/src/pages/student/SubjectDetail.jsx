import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const SubjectDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/subjects/${id}`);
        setData(data.data);
      } catch {
        toast.error('Could not load subject');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = async (chapterId, filename) => {
    try {
      const res = await api.get(`/chapters/${chapterId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'material';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  if (loading) return <Loader />;
  if (!data) return <EmptyState title="Subject not found" />;

  const { subject, chapters } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/student/subjects" className="text-sm text-primary-600">
          ← Back to Subjects
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">{subject.name}</h1>
        <p className="text-sm text-gray-500">
          {subject.code} · Semester {subject.semester}
        </p>
        <p className="text-sm text-gray-600 mt-2">{subject.description}</p>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Chapters</h2>
        {chapters.length === 0 ? (
          <EmptyState title="No chapters yet" message="Check back later for course content." />
        ) : (
          <div className="space-y-3">
            {chapters.map((c) => (
              <div key={c._id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-400">Chapter {c.chapterNumber}</div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                    {c.notes && <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">{c.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  {c.materialFile?.storedName && (
                    <button
                      onClick={() => handleDownload(c._id, c.materialFile.originalName)}
                      className="btn-secondary text-sm"
                    >
                      Download Material
                    </button>
                  )}
                  {c.resourceUrl && (
                    <a href={c.resourceUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
                      Open Resource
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetail;
