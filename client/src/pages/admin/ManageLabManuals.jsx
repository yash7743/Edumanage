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

  // Document Viewer State
  const [viewingManual, setViewingManual] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([
        api.get('/lab-manuals'),
        api.get('/subjects', { params: { limit: 100 } }),
      ]);
      setManuals(m.data?.data || []);
      setSubjects(s.data?.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (viewUrl) URL.revokeObjectURL(viewUrl);
    };
  }, [viewUrl]);

  const openCreate = () => {
    if (subjects.length === 0) {
      toast.error('Please create at least one Subject before adding a Lab Manual');
      return;
    }
    setEditing(null);
    setForm({ ...EMPTY, subject: subjects[0]?._id || '' });
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      title: m.title || '',
      subject: m.subject?._id || m.subject || '',
      description: m.description || '',
    });
    setFile(null);
    setModalOpen(true);
  };

  const handleView = async (manual) => {
    try {
      setViewLoading(true);
      setViewingManual(manual);
      
      const response = await api.get(`/lab-manuals/${manual._id}/view`, {
        responseType: 'blob',
      });

      if (viewUrl) URL.revokeObjectURL(viewUrl);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      setViewUrl(objectUrl);
    } catch (err) {
      toast.error('Unable to open file for viewing');
      setViewingManual(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (manual) => {
    const toastId = toast.loading('Preparing download...');
    try {
      const response = await api.get(`/lab-manuals/${manual._id}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: manual.file?.mimeType || 'application/pdf',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', manual.file?.originalName || `${manual.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Download completed', { id: toastId });
    } catch (err) {
      toast.error('Failed to download manual', { id: toastId });
    }
  };

  const closeViewer = () => {
    if (viewUrl) URL.revokeObjectURL(viewUrl);
    setViewUrl(null);
    setViewingManual(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject) {
      return toast.error('Please select a valid subject');
    }

    if (!editing && !file) {
      return toast.error('Please attach a PDF file');
    }

    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);

    try {
      if (editing) {
        await api.put(`/lab-manuals/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Lab manual updated');
      } else {
        await api.post('/lab-manuals', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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
            <div key={m._id} className="card flex flex-col justify-between">
              <div>
                <span className="badge bg-primary-50 text-primary-700">{m.subject?.code}</span>
                <h3 className="font-semibold mt-2 text-gray-900">{m.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{m.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <button
                    onClick={() => handleView(m)}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    View & Learn
                  </button>
                  <button
                    onClick={() => handleDownload(m)}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    Download
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  <button onClick={() => openEdit(m)} className="text-xs text-gray-600 hover:text-gray-900 font-medium">
                    Edit
                  </button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setDeleteTarget(m)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View & Learn In-Browser PDF Modal */}
      <Modal open={!!viewingManual} title={viewingManual?.title || 'Document Viewer'} onClose={closeViewer}>
        <div className="w-full h-[75vh] flex flex-col">
          {viewLoading ? (
            <div className="m-auto text-center">
              <Loader />
              <p className="text-sm text-gray-500 mt-2">Loading document...</p>
            </div>
          ) : viewUrl ? (
            <iframe
              src={`${viewUrl}#toolbar=1&navpanes=0`}
              title={viewingManual?.title}
              className="w-full h-full rounded border border-gray-200"
            />
          ) : (
            <div className="m-auto text-center text-sm text-gray-500">
              Unable to load preview.
            </div>
          )}
        </div>
      </Modal>

      {/* Create / Edit Form Modal */}
      <Modal open={modalOpen} title={editing ? 'Edit Lab Manual' : 'Add Lab Manual'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              required
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
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
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">PDF File {editing ? '(leave empty to keep current)' : ''}</label>
            <input
              type="file"
              accept=".pdf"
              className="input-field"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
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