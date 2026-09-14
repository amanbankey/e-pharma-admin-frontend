import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShieldCheck, Trash2, Power, KeyRound, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { adminsApi, adminAuthApi } from '../lib/api';
import { useAdminAuth } from '../lib/AdminAuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const sections = [
  { id: 'products', label: 'Products' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'orders', label: 'Orders' },
  { id: 'reports', label: 'Reports' },
  { id: 'users', label: 'Customers' },
];

export default function Admins() {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [resetMailSending, setResetMailSending] = useState(false);
  const [resetMailStatus, setResetMailStatus] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', permissions: [] });

  const load = () => {
    setLoading(true);
    adminsApi.getAll().then((data) => setAdmins(data.admins)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSendResetEmail = async () => {
    if (!currentAdmin?.email) return;
    try {
      setResetMailSending(true);
      setResetMailStatus('');
      const res = await adminAuthApi.resetPasswordToken({ email: currentAdmin.email });
      setResetMailStatus(res?.message || 'Password reset link sent to your email!');
      setTimeout(() => setResetMailStatus(''), 6000);
    } catch (err) {
      setResetMailStatus(err?.message || 'Failed to send reset email');
    } finally {
      setResetMailSending(false);
    }
  };

  const togglePermission = (id) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(id) ? f.permissions.filter((p) => p !== id) : [...f.permissions, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await adminsApi.create(form);
    setForm({ fullName: '', email: '', password: '', permissions: [] });
    setModalOpen(false);
    load();
  };

  const toggleActive = async (admin) => {
    await adminsApi.update(admin._id, { permissions: admin.permissions, isActive: !admin.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this admin account?')) return;
    await adminsApi.remove(id);
    load();
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-teal-900">Admin team</h1>
          <p className="mt-1 text-ink-soft">Create admins and control what each one can see.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal-700"
        >
          <Plus size={16} /> Add admin
        </button>
      </div>

      {/* Super Admin Management Banner */}
      {currentAdmin?.role === 'superadmin' && (
        <div className="mt-6 rounded-2xl border border-gold-600/30 bg-gold-600/5 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-900 text-cream font-display text-lg shadow-sm">
                <ShieldCheck size={24} className="text-gold-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg text-teal-900">{currentAdmin.fullName}</h2>
                  <span className="rounded-full bg-gold-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-900">
                    Super Admin
                  </span>
                </div>
                <p className="text-xs text-ink-soft">{currentAdmin.email} • Full System Access</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-teal-900 bg-teal-900 px-4 py-2 text-xs font-semibold text-cream transition hover:bg-teal-800 cursor-pointer"
              >
                <KeyRound size={14} /> Change Password
              </button>

              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={resetMailSending}
                className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold text-teal-900 transition hover:border-teal-500 disabled:opacity-60 cursor-pointer"
              >
                {resetMailSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                <span>Send Reset Link to Email</span>
              </button>
            </div>
          </div>

          {resetMailStatus && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 px-3.5 py-2 text-xs text-teal-800">
              <CheckCircle2 size={15} className="shrink-0 text-teal-700" />
              <span>{resetMailStatus}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!loading && admins.map((a) => (
          <div key={a._id} className="rounded-2xl border border-line bg-paper p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-display text-teal-900">
                  {a.fullName[0]?.toUpperCase()}
                </span>
                <div>
                  <p className="font-display text-base text-teal-900">{a.fullName}</p>
                  <p className="text-xs text-ink-soft">{a.email}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${a.isActive ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'}`}>
                {a.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.permissions.map((p) => (
                <span key={p} className="rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-medium capitalize text-gold-600">{p}</span>
              ))}
              {a.permissions.length === 0 && <span className="text-xs text-ink-soft">No access granted</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => toggleActive(a)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line py-2 text-sm font-medium text-teal-900 hover:border-teal-500">
                <Power size={14} /> {a.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => handleDelete(a._id)} className="flex items-center justify-center rounded-full border border-line px-3 text-ink-soft hover:border-red-600 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!loading && admins.length === 0 && (
          <p className="text-ink-soft">No admins created yet — add your first one.</p>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleCreate}
              className="w-full max-w-md rounded-2xl bg-paper p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-xl text-teal-900">
                  <ShieldCheck size={20} className="text-gold-600" /> New admin
                </h3>
                <button type="button" onClick={() => setModalOpen(false)}><X size={20} className="text-ink-soft" /></button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-ink-soft">Full name</label>
                  <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Temporary password</label>
                  <input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                  <p className="mt-1 text-xs text-ink-soft">Share this with them yourself — it isn't emailed.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Access</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sections.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => togglePermission(s.id)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${form.permissions.includes(s.id) ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="mt-6 w-full rounded-full bg-teal-900 py-3 font-semibold text-cream transition hover:bg-teal-700">
                Create admin
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
