import { useEffect, useState } from 'react';
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

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subjects', { params: { limit: 100 } });
      setSubjects(data.data);
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
    setForm({ name: s.name, code: s.code, description: s.description, semester: s.semester });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Subject Management</h1>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Add Subject
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : subjects.length === 0 ? (
        <EmptyState title="No subjects yet" action={<button onClick={openCreate} className="btn-primary text-sm">Add your first subject</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div key={s._id} className="card">
              <div className="flex justify-between items-start">
                <span className="badge bg-primary-50 text-primary-700">{s.code}</span>
                <span className="text-xs text-gray-400">Sem {s.semester}</span>
              </div>
              <h3 className="font-semibold mt-2">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(s)} className="btn-secondary text-xs">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(s)} className="text-xs text-red-600 font-medium px-3 py-1.5">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Subject' : 'Add Subject'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Subject Name</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject Code</label>
              <input required className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
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
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update Subject' : 'Create Subject'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete subject?"
        message={`This will permanently delete "${deleteTarget?.name}" and all its chapters.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ManageSubjects;
