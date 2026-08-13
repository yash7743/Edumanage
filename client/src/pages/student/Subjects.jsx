import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subjects', { params: { search, semester } });
      setSubjects(data.data);
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
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Subjects</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input-field sm:max-w-xs"
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field sm:max-w-[160px]" value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="">All semesters</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : subjects.length === 0 ? (
        <EmptyState title="No subjects found" message="Try adjusting your search or filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Link key={s._id} to={`/student/subjects/${s._id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="badge bg-primary-50 text-primary-700">{s.code}</span>
                <span className="text-xs text-gray-400">Sem {s.semester}</span>
              </div>
              <h3 className="font-semibold mt-2">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
