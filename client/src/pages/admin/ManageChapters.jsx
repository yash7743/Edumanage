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

  // Document Viewer State
  const [viewingChapter, setViewingChapter] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const loadSubjects = async () => {
    try {
      const { data } = await api.get('/subjects', { params: { limit: 100 } });
      setSubjects(data.data || []);
    } catch (err) {
      toast.error('Failed to load subjects');
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/chapters', {
        params: subjectFilter ? { subject: subjectFilter } : {},
      });
      setChapters(data.data || []);
    } catch (err) {
      toast.error('Failed to load chapters');
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

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (viewUrl) URL.revokeObjectURL(viewUrl);
    };
  }, [viewUrl]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, subject: subjectFilter || subjects[0]?._id || '' });
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      subject: c.subject?._id || c.subject || '',
      chapterNumber: c.chapterNumber,
      title: c.title,
      description: c.description || '',
      notes: c.notes || '',
      resourceUrl: c.resourceUrl || '',
    });
    setFile(null);
    setModalOpen(true);
  };

  const handleView = async (chapter) => {
    if (!chapter.materialFile?.storedName) {
      return toast.error('No attached material for this chapter');
    }

    try {
      setViewLoading(true);
      setViewingChapter(chapter);

      const response = await api.get(`/chapters/${chapter._id}/view`, {
        responseType: 'blob',
      });

      if (viewUrl) URL.revokeObjectURL(viewUrl);

      const mimeType = chapter.materialFile?.mimeType || 'application/pdf';
      const blob = new Blob([response.data], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      setViewUrl(objectUrl);
    } catch (err) {
      toast.error('Unable to open material for viewing');
      setViewingChapter(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (chapter) => {
    if (!chapter.materialFile?.storedName) {
      return toast.error('No attached material for this chapter');
    }

    const toastId = toast.loading('Preparing download...');
    try {
      const response = await api.get(`/chapters/${chapter._id}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: chapter.materialFile?.mimeType || 'application/octet-stream',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', chapter.materialFile?.originalName || `${chapter.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Download completed', { id: toastId });
    } catch (err) {
      toast.error('Failed to download material', { id: toastId });
    }
  };

  const closeViewer = () => {
    if (viewUrl) URL.revokeObjectURL(viewUrl);
    setViewUrl(null);
    setViewingChapter(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('materialFile', file);

    try {
      if (editing) {
        await api.put(`/chapters/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Chapter updated');
      } else {
        await api.post('/chapters', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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

      <select
        className="input-field max-w-xs"
        value={subjectFilter}
        onChange={(e) => setSubjectFilter(e.target.value)}
      >
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
            <div key={c._id} className="card flex justify-between items-start flex-wrap gap-3">
              <div className="flex-1 min-w-[240px]">
                <div className="text-xs text-primary-600 font-semibold uppercase tracking-wider">
                  Chapter {c.chapterNumber}
                </div>
                <div className="font-semibold text-gray-900 mt-0.5">{c.title}</div>
                {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
                {c.resourceUrl && (
                  <a
                    href={c.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-600 hover:underline mt-1.5 inline-block"
                  >
                    External Link ↗
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                {c.materialFile?.storedName && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(c)}
                      className="btn-primary text-xs px-2.5 py-1.5"
                    >
                      View & Learn
                    </button>
                    <button
                      onClick={() => handleDownload(c)}
                      className="btn-secondary text-xs px-2.5 py-1.5"
                    >
                      Download
                    </button>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <button onClick={() => openEdit(c)} className="btn-secondary text-xs">
                    Edit
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="text-xs text-red-600 font-medium px-2 py-1.5">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-Browser PDF / Document Modal Viewer */}
      <Modal open={!!viewingChapter} title={viewingChapter?.title || 'Chapter Study Material'} onClose={closeViewer}>
        <div className="w-full h-[75vh] flex flex-col">
          {viewLoading ? (
            <div className="m-auto text-center">
              <Loader />
              <p className="text-sm text-gray-500 mt-2">Loading material...</p>
            </div>
          ) : viewUrl ? (
            <iframe
              src={`${viewUrl}#toolbar=1&navpanes=0`}
              title={viewingChapter?.title}
              className="w-full h-full rounded border border-gray-200"
            />
          ) : (
            <div className="m-auto text-center text-sm text-gray-500">
              Unable to load preview.
            </div>
          )}
        </div>
      </Modal>

      {/* Create / Edit Modal */}
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
              <option value="" disabled>Select subject</option>
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
            <label className="label">Material File {editing ? '(leave empty to keep current)' : '(PDF, DOC, DOCX, PPT, PPTX)'}</label>
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="input-field" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update Chapter' : 'Create Chapter'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
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