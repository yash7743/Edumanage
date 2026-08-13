import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY = { subject: '', chapterNumber: 1, title: '', description: '', notes: '', resourceUrl: '' };

const ManageChapters = () => {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadSubjects = async () => {
    const { data } = await api.get('/subjects', { params: { limit: 100 } });
    setSubjects(data.data);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/chapters', { params: subjectFilter ? { subject: subjectFilter } : {} });
      setChapters(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, subject: subjects[0]?._id || '' });
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      subject: c.subject,
      chapterNumber: c.chapterNumber,
      title: c.title,
      description: c.description,
      notes: c.notes,
      resourceUrl: c.resourceUrl,
    });
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('materialFile', file);
    try {
      if (editing) {
        await api.put(`/chapters/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Chapter updated');
      } else {
        await api.post('/chapters', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Chapter created');
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
      await api.delete(`/chapters/${deleteTarget._id}`);
      toast.success('Chapter deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Chapter Management</h1>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Add Chapter
        </button>
      </div>

      <select className="input-field max-w-xs" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s._id} value={s._id}>
            {s.code} — {s.name}
          </option>
        ))}
      </select>

      {loading ? (
        <Loader />
      ) : chapters.length === 0 ? (
        <EmptyState title="No chapters yet" />
      ) : (
        <div className="space-y-3">
          {chapters.map((c) => (
            <div key={c._id} className="card flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-400">Chapter {c.chapterNumber}</div>
                <div className="font-semibold">{c.title}</div>
                <p className="text-sm text-gray-500">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-secondary text-xs">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(c)} className="text-xs text-red-600 font-medium px-3 py-1.5">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Chapter' : 'Add Chapter'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <select
              required
              className="input-field"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Chapter Number</label>
              <input
                type="number"
                min="1"
                required
                className="input-field"
                value={form.chapterNumber}
                onChange={(e) => setForm({ ...form, chapterNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Title</label>
              <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div>
            <label className="label">Resource URL (optional video/link)</label>
            <input className="input-field" value={form.resourceUrl} onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })} />
          </div>
          <div>
            <label className="label">Material File (PDF, DOC, DOCX, PPT, PPTX)</label>
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="input-field" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update Chapter' : 'Create Chapter'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete chapter?"
        message={`This will permanently delete "${deleteTarget?.title}".`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ManageChapters;
