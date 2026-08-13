import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', { params: { search, page } });
      setStudents(data.data);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Student Management</h1>
      <input
        className="input-field max-w-xs"
        placeholder="Search by name, email, or student ID..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <EmptyState title="No students found" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Student ID</th>
                  <th className="py-2 pr-4">Semester</th>
                  <th className="py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4">{s.email}</td>
                    <td className="py-2 pr-4">{s.studentId}</td>
                    <td className="py-2 pr-4">{s.semester}</td>
                    <td className="py-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default ManageStudents;
