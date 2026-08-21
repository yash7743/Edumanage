import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import DocViewerModal from '../../components/common/DocViewerModal';
import toast from 'react-hot-toast';

const AdminLabManuals = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManual, setEditingManual] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
  });
  const [pdfFile, setPdfFile] = useState(null);

  // In-Browser Document Viewer State
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // 1. Fetch Subjects on Mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects?limit=100');
        const list = res.data?.data || [];
        setSubjects(list);
        if (list.length > 0) {
          setSelectedSubject(list[0]._id);
        }
      } catch (err) {
        console.error('Fetch subjects error:', err);
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Fetch Lab Manuals whenever selected subject changes
  const loadManuals = async (subId) => {
    if (!subId) return;
    try {
      setLoading(true);
      const res = await api.get('/lab-manuals', { params: { subject: subId } });
      setManuals(res.data?.data || []);
    } catch (err) {
      console.error('Fetch manuals error:', err);
      toast.error('Failed to load lab manuals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      loadManuals(selectedSubject);
    }
  }, [selectedSubject]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (viewUrl) URL.revokeObjectURL(viewUrl);
    };
  }, [viewUrl]);

  // Modal Open Handlers
  const openCreateModal = () => {
    setEditingManual(null);
    setFormData({
      title: '',
      subject: selectedSubject || (subjects[0]?._id || ''),
      description: '',
    });
    setPdfFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (manual) => {
    setEditingManual(manual);
    setFormData({
      title: manual.title || '',
      subject: manual.subject?._id || manual.subject || selectedSubject,
      description: manual.description || '',
    });
    setPdfFile(null);
    setIsModalOpen(true);
  };

  // Submit Handler (Create or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject) {
      return toast.error('Please enter a title and select a subject');
    }

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('subject', formData.subject);
    data.append('description', formData.description.trim());

    if (pdfFile) {
      data.append('file', pdfFile);
    } else if (!editingManual) {
      return toast.error('Please upload a PDF file for this lab manual');
    }

    setSubmitting(true);
    try {
      if (editingManual) {
        await api.put(`/lab-manuals/${editingManual._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Lab manual updated successfully');
      } else {
        await api.post('/lab-manuals', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Lab manual created successfully');
      }
      setIsModalOpen(false);
      loadManuals(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lab manual');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab manual?')) return;
    try {
      await api.delete(`/lab-manuals/${id}`);
      toast.success('Lab manual deleted');
      loadManuals(selectedSubject);
    } catch (err) {
      toast.error('Failed to delete lab manual');
    }
  };

  // View Document in In-Browser Modal
  const handleView = async (manual) => {
    if (!manual.file?.storedName) {
      return toast.error('No attached file found for this manual');
    }

    try {
      setViewLoading(true);
      setViewingDoc(manual);

      const res = await api.get(`/lab-manuals/${manual._id}/view`, {
        responseType: 'blob',
        headers: { Accept: manual.file?.mimeType || 'application/pdf, */*' },
      });

      if (viewUrl) URL.revokeObjectURL(viewUrl);

      const blobType = res.data?.type || manual.file?.mimeType || 'application/pdf';
      const blob = new Blob([res.data], { type: blobType });
      const objectUrl = URL.createObjectURL(blob);
      setViewUrl(objectUrl);
    } catch (err) {
      console.error('View manual error:', err);
      toast.error('Unable to open document for viewing');
      setViewingDoc(null);
    } finally {
      setViewLoading(false);
    }
  };

  // Direct File Download
  const handleDownload = async (manual) => {
    if (!manual.file?.storedName) {
      return toast.error('No file available to download');
    }

    const toastId = toast.loading('Preparing download...');
    try {
      const res = await api.get(`/lab-manuals/${manual._id}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: manual.file?.mimeType || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = manual.file?.originalName || `${manual.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded successfully', { id: toastId });
    } catch (err) {
      toast.error('Download failed', { id: toastId });
    }
  };

  const closeViewer = () => {
    if (viewUrl) URL.revokeObjectURL(viewUrl);
    setViewUrl(null);
    setViewingDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Manuals Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload, preview, and organize subject-wise laboratory guidebooks and manuals.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>＋</span> Add Lab Manual
        </button>
      </div>

      {/* Subject Filter Bar */}
      <div className="card p-4 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Filter by Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field bg-white py-2 px-3 text-sm font-medium border-gray-300 rounded-lg shadow-sm"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total Manuals: {manuals.length}
        </span>
      </div>

      {/* Manuals Grid */}
      {loading ? (
        <Loader />
      ) : manuals.length === 0 ? (
        <EmptyState
          title="No lab manuals found"
          message="No lab manuals uploaded for this subject yet. Click 'Add Lab Manual' to upload one."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {manuals.map((m) => (
            <div
              key={m._id}
              className="card p-5 flex flex-col justify-between border border-gray-200 hover:shadow-sm transition"
            >
              <div>
                <span className="badge bg-emerald-50 text-emerald-700 font-semibold uppercase text-xs tracking-wider">
                  {m.subject?.code || 'LAB'}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-2">{m.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {m.description || 'Laboratory instructions and experiment manual.'}
                </p>
                {m.file?.originalName && (
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    📎 {m.file.originalName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                <button
                  onClick={() => handleView(m)}
                  className="btn-primary text-xs px-3 py-1.5 flex-1 text-center font-medium"
                >
                  View & Learn
                </button>
                <button
                  onClick={() => handleDownload(m)}
                  className="btn-secondary text-xs px-3 py-1.5 flex-1 text-center font-medium"
                >
                  Download
                </button>
                <button
                  onClick={() => openEditModal(m)}
                  className="btn-secondary text-xs px-2.5 py-1.5 text-gray-600 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="btn-danger text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={isModalOpen}
        title={editingManual ? 'Edit Lab Manual' : 'Add New Lab Manual'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label block text-xs font-semibold text-gray-700 mb-1">
              Subject *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input-field w-full text-sm"
              required
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label block text-xs font-semibold text-gray-700 mb-1">
              Manual Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Operating Systems Lab Manual"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field w-full text-sm"
              required
            />
          </div>

          <div>
            <label className="label block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              placeholder="Brief summary of the experiments or guidelines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full text-sm"
            />
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <label className="label block text-xs font-bold text-gray-800">
              Upload Lab Manual PDF *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="input-field w-full text-xs"
              required={!editingManual}
            />
            {editingManual?.file?.originalName && (
              <p className="text-xs text-emerald-600">
                Current file: {editingManual.file.originalName} (Select a new file to replace)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-sm px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-sm px-5 py-2"
            >
              {submitting ? 'Saving...' : editingManual ? 'Save Changes' : 'Upload Manual'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Unified In-Browser Document Viewer Modal */}
      <DocViewerModal
        open={!!viewingDoc}
        title={viewingDoc?.title || 'Lab Manual Viewer'}
        docUrl={viewUrl}
        loading={viewLoading}
        onClose={closeViewer}
      />
    </div>
  );
};

export default AdminLabManuals;