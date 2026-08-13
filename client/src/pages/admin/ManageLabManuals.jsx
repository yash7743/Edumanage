import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY = { title: '', subject: '', description: '' };

const ManageLabManuals = () => {
  const [manuals, setManuals] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([api.get('/lab-manuals'), api.get('/subjects', { params: { limit: 100 } })]);
      setManuals(m.data.data);
      setSubjects(s.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, subject: subjects[0]?._id || '' });
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ title: m.title, subject: m.subject?._id, description: m.description });
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      if (editing) {
        await api.put(`/lab-manuals/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Lab manual updated');
      } else {
        if (!file) return toast.error('Please attach a PDF');
        await api.post('/lab-manuals', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Lab manual created');
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
      await api.delete(`/lab-manuals/${deleteTarget._id}`);
      toast.success('Lab manual deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Lab Manual Management</h1>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Add Lab Manual
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : manuals.length === 0 ? (
        <EmptyState title="No lab manuals yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {manuals.map((m) => (
            <div key={m._id} className="card">
              <span className="badge bg-primary-50 text-primary-700">{m.subject?.code}</span>
              <h3 className="font-semibold mt-2">{m.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{m.description}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(m)} className="btn-secondary text-xs">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(m)} className="text-xs text-red-600 font-medium px-3 py-1.5">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Lab Manual' : 'Add Lab Manual'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Subject</label>
            <select required className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">PDF File {editing ? '(leave empty to keep current)' : ''}</label>
            <input type="file" accept=".pdf" className="input-field" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete lab manual?"
        message={`This will permanently delete "${deleteTarget?.title}".`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ManageLabManuals;
