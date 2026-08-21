import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subjects', {
        params: {
          search: search.trim() || undefined,
          semester: semester || undefined,
          limit: 100,
        },
      });
      setSubjects(res.data?.data || []);
    } catch {
      toast.error('Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, semester]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Subjects & Study Materials</h1>
        <p className="text-xs text-gray-500 mt-1">
          Select a subject to view chapter notes, lab manuals, and assignments
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input-field sm:max-w-xs"
          placeholder="Search by subject code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field sm:max-w-[160px]"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">All semesters</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
        {(search || semester) && (
          <button
            onClick={() => {
              setSearch('');
              setSemester('');
            }}
            className="text-xs text-primary-600 font-semibold hover:underline self-center px-2 py-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Subject List Grid */}
      {loading ? (
        <Loader />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects found"
          message="Try adjusting your search criteria or semester filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Link
              key={s._id}
              to={`/student/subjects/${s._id}`}
              className="card hover:shadow-md hover:border-primary-200 transition p-5 border border-gray-100 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="badge bg-primary-50 text-primary-700 font-semibold group-hover:bg-primary-100 transition">
                    {s.code}
                  </span>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                    Sem {s.semester}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-3 text-base group-hover:text-primary-600 transition">
                  {s.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {s.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-primary-600">
                <span>View Course Content</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;