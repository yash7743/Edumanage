import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  content_admin: 'Content Admin',
  faculty_admin: 'Faculty Admin',
};

const EMPTY = { name: '', email: '', password: '', adminRole: 'content_admin' };

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admins');
      setAdmins(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      return toast.error('Name and email are required');
    }

    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }

    setSaving(true);
    try {
      await api.post('/admins', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        adminRole: form.adminRole,
      });

      toast.success('Admin account created successfully');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const actionText = admin.isActive ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} ${admin.name}?`)) {
      return;
    }

    try {
      await api.put(`/admins/${admin._id}/toggle-status`);
      toast.success(admin.isActive ? 'Admin deactivated' : 'Admin reactivated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create additional Content Admins or Faculty Admins here — no server access needed.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Add Admin
        </button>
      </div>

      {admins.length === 0 ? (
        <EmptyState title="No admin accounts found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2.5 pr-4">Name</th>
                <th className="py-2.5 pr-4">Email</th>
                <th className="py-2.5 pr-4">Role</th>
                <th className="py-2.5 pr-4">Status</th>
                <th className="py-2.5 pr-4">Created</th>
                <th className="py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                  <td className="py-3 pr-4 font-medium text-gray-900">{a.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{a.email}</td>
                  <td className="py-3 pr-4">
                    <span className="badge bg-primary-50 text-primary-700 font-medium">
                      {ROLE_LABELS[a.adminRole] || a.adminRole || 'Admin'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${a.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleStatus(a)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded transition ${
                        a.isActive
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {a.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Admin Modal */}
      <Modal open={modalOpen} title="Add Admin" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              required
              className="input-field"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="admin@edumanage.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              minLength={8}
              required
              className="input-field"
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters long</p>
          </div>
          <div>
            <label className="label">Admin Role</label>
            <select
              className="input-field"
              value={form.adminRole}
              onChange={(e) => setForm({ ...form, adminRole: e.target.value })}
            >
              <option value="content_admin">Content Admin</option>
              <option value="faculty_admin">Faculty Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageAdmins;