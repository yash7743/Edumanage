import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY = { title: '', subject: '', description: '', startDate: '', deadline: '', maxMarks: 100 };

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
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
      const [a, s] = await Promise.all([api.get('/assignments'), api.get('/subjects', { params: { limit: 100 } })]);
      setAssignments(a.data.data);
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

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title,
      subject: a.subject?._id,
      description: a.description,
      startDate: a.startDate?.slice(0, 10),
      deadline: a.deadline?.slice(0, 16),
      maxMarks: a.maxMarks,
    });
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
        await api.put(`/assignments/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Assignment updated');
      } else {
        await api.post('/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Assignment created');
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
      await api.delete(`/assignments/${deleteTarget._id}`);
      toast.success('Assignment deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Assignment Management</h1>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Add Assignment
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : assignments.length === 0 ? (
        <EmptyState title="No assignments yet" />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a._id} className="card flex justify-between items-start flex-wrap gap-3">
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-gray-500">{a.subject?.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Deadline: {new Date(a.deadline).toLocaleString()} · Max Marks: {a.maxMarks}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="btn-secondary text-xs">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(a)} className="text-xs text-red-600 font-medium px-3 py-1.5">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Assignment' : 'Add Assignment'} onClose={() => setModalOpen(false)}>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="date" required className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input
                type="datetime-local"
                required
                className="input-field"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Max Marks</label>
            <input type="number" min="0" required className="input-field" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
          </div>
          <div>
            <label className="label">Assignment File (optional)</label>
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="input-field" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update Assignment' : 'Create Assignment'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete assignment?"
        message={`This will permanently delete "${deleteTarget?.title}".`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ManageAssignments;
