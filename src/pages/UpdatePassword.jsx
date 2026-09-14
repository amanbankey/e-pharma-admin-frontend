import { useState } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2, ShieldCheck, Leaf } from 'lucide-react';
import { adminAuthApi } from '../lib/api';

export default function UpdatePassword() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || params.token || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing from the link. Please request a new link.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminAuthApi.resetPassword({
        token,
        password,
        confirmPassword,
      });

      if (res?.success === false) {
        throw new Error(res?.message || 'Failed to reset password');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to reset password. The link may have expired.');
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
            Security & Access Control
          </h1>
          <p className="mt-4 max-w-md text-cream/60">
            Create a strong, unique password for your Super Admin account to maintain complete security over the pharmacy portal.
          </p>
        </div>

        <p className="text-xs text-cream/40">© {new Date().getFullYear()} Vernal Rx Admin</p>
      </div>

      {/* Main Form Area */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {isSuccess ? (
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-teal-700">
                <CheckCircle2 size={24} />
              </span>
              <h2 className="mt-5 font-display text-3xl text-teal-900">Password Updated!</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Your Super Admin password has been successfully reset. You can now sign in to the admin console with your new password.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 shadow-md"
              >
                Sign in to Admin Console
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900">
                <ShieldCheck size={14} /> Super Admin Reset
              </div>

              <h2 className="font-display text-3xl text-teal-900">Create new password</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Please choose a secure new password for your Super Admin access.
              </p>

              {/* Warning if token missing */}
              {!token && (
                <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <div className="text-xs">
                    <p className="font-semibold text-sm">Missing reset token</p>
                    <p className="mt-0.5 text-amber-800">
                      The reset token was not found in the URL. Please check the email link or request a new one.
                    </p>
                    <Link
                      to="/forgot-password"
                      className="mt-2 inline-block font-semibold text-amber-900 underline"
                    >
                      Request reset link →
                    </Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-sm font-medium text-ink-soft">New Password</label>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-medium text-ink-soft">Confirm Password</label>
                  <div className="relative mt-1.5">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full rounded-xl border bg-paper px-4 py-3 text-sm outline-none transition pr-11 ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-line focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating Password…</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
