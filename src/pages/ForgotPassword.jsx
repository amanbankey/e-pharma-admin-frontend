import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Leaf } from 'lucide-react';
import { adminAuthApi } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const res = await adminAuthApi.resetPasswordToken({ email });
      if (res?.success === false) {
        throw new Error(res?.message || 'Failed to send reset link');
      }
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand Hero Sidebar */}
      <div className="relative hidden overflow-hidden bg-teal-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-600/10 blur-3xl" />
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-600 text-teal-900">
            <Leaf size={20} strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl text-cream">Vernal Rx</span>
        </div>

        <div>
          <h1 className="font-display text-4xl leading-tight text-cream">
            Super Admin Account Recovery
          </h1>
          <p className="mt-4 max-w-md text-cream/60">
            Only Super Admin accounts have self-service password recovery enabled. Normal admin accounts are provisioned and managed by the Super Admin.
          </p>
        </div>

        <p className="text-xs text-cream/40">© {new Date().getFullYear()} Vernal Rx Admin</p>
      </div>

      {/* Main Content Area */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900">
            <ShieldCheck size={14} /> Super Admin Only
          </div>

          <h2 className="font-display text-3xl text-teal-900">
            {sent ? 'Check your email' : 'Forgot Password'}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {sent
              ? `We have dispatched a password recovery link to ${email}.`
              : 'Enter your Super Admin email address to receive a secure password reset link.'}
          </p>

          {sent ? (
            <div className="mt-7 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-teal-700" />
                <div>
                  <p className="font-semibold">Reset email sent!</p>
                  <p className="mt-1 text-xs text-teal-800">
                    Please check your inbox or spam folder and click the link to reset your password. The link is valid for 1 hour.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full rounded-full border border-line py-3 text-sm font-semibold text-teal-900 hover:bg-cream transition"
              >
                Send to different email
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700"
              >
                <ArrowLeft size={16} /> Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-soft">Email address</label>
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    required
                    placeholder="superadmin@vernalrx.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-10"
                  />
                  <Mail
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending Reset Link…</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-900 hover:underline"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
