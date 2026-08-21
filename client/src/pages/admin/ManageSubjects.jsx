import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY = { name: '', code: '', description: '', semester: 1 };

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subjects', { params: { limit: 100 } });
      setSubjects(data.data || []);
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      code: s.code || '',
      description: s.description || '',
      semester: s.semester || 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      return toast.error('Subject name and code are required');
    }

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/subjects/${editing._id}`, form);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', form);
        toast.success('Subject created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/subjects/${deleteTarget._id}`);
      toast.success('Subject deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage subjects, course materials, and curriculum modules.</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Add Subject
        </button>
      </div>

      {/* Search Filter Bar */}
      {subjects.length > 0 && (
        <div className="max-w-xs">
          <input
            type="text"
            className="input-field text-sm"
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <Loader />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          title={search ? 'No matching subjects found' : 'No subjects yet'}
          action={
            !search && (
              <button onClick={openCreate} className="btn-primary text-sm">
                Add your first subject
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((s) => (
            <div key={s._id} className="card flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start">
                  <span className="badge bg-primary-50 text-primary-700 font-semibold">{s.code}</span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Sem {s.semester}
                  </span>
                </div>
                <h3 className="font-semibold mt-2.5 text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {s.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 mt-4">
                <div className="flex justify-between items-center">
                  <Link
                    to={`/admin/subjects/${s._id}`}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    View Curriculum →
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="btn-secondary text-xs px-2.5 py-1">
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} title={editing ? 'Edit Subject' : 'Add Subject'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Subject Name</label>
            <input
              required
              className="input-field"
              placeholder="e.g. Data Structures & Algorithms"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject Code</label>
              <input
                required
                className="input-field"
                placeholder="e.g. CS-301"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Semester</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                className="input-field"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Brief summary of this subject's objectives..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update Subject' : 'Create Subject'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete subject?"
        message={`This will permanently delete "${deleteTarget?.name}" and all related course materials.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ManageSubjects;