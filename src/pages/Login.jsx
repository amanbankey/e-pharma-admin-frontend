import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, User, LogIn } from 'lucide-react';
import { useAdminAuth } from '../lib/AdminAuthContext';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
export default function Login() {
  const [tab, setTab] = useState('admin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password, tab);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-teal-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-600/10 blur-3xl" />
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-600 text-teal-900">
            <Leaf size={20} strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl text-cream">Vernal Rx</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl leading-tight text-cream">
            Run the pharmacy from one calm, clear dashboard.
          </h1>
          <p className="mt-4 max-w-md text-cream/60">
            Orders, inventory, revenue and your admin team — all in one place, built for the people who keep Vernal Rx moving.
          </p>
        </motion.div>

        <p className="text-xs text-cream/40">© {new Date().getFullYear()} Vernal Rx</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <h2 className="font-display text-3xl text-teal-900">Sign in</h2>
          <p className="mt-2 text-ink-soft">Choose your account type to continue.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-line bg-paper p-1">
            {[
              { id: 'admin', label: 'Admin', icon: User },
              { id: 'superadmin', label: 'Super Admin', icon: ShieldCheck },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${
                  tab === t.id ? 'bg-teal-900 text-cream' : 'text-ink-soft'
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-soft">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <div className='relative'>
              <label className="text-sm font-medium text-ink-soft">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-14 -translate-y-1/2 text-ink-soft hover:text-teal-900"
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
            </div>

            <div className="flex justify-end">
              {tab === 'superadmin' ? (
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-semibold text-teal-900 hover:underline hover:text-teal-700 cursor-pointer"
                >
                  Forgot password?
                </button>
              ) : (
                <span className="text-[11px] text-ink-soft">
                  Admin credentials provided by Super Admin
                </span>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
            >
              <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
