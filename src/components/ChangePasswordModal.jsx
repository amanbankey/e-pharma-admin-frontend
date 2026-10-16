import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { adminAuthApi } from '../lib/api';
import { PASSWORD_MIN_LENGTH, getPasswordConditionErrors, isPasswordTooShort } from '../lib/passwordValidation';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oldPassword.trim() || !newPassword.trim()) {
      setError('Please fill in all password fields');
      return;
    }

    if (isPasswordTooShort(newPassword)) {
      setError(`New password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    const conditionErrors = getPasswordConditionErrors(newPassword);
    if (conditionErrors.length > 0) {
      setPasswordErrors(conditionErrors);
      return;
    }
    setPasswordErrors([]);

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await adminAuthApi.changePassword({
        oldPassword,
        newPassword,
      });

      if (res?.success === false) {
        throw new Error(res?.message || 'Failed to update password');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    setPasswordErrors([]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-2xl border border-line"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 text-teal-900">
              <Lock size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg text-teal-900">Change Password</h3>
              <p className="text-xs text-ink-soft">Update your Super Admin account password</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-ink-soft hover:bg-cream hover:text-teal-900 transition"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-teal-700">
              <CheckCircle2 size={24} />
            </span>
            <p className="mt-3 font-display text-xl text-teal-900">Password Updated!</p>
            <p className="mt-1 text-xs text-ink-soft">Your password has been changed successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showOld ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900"
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordErrors([]);
                  }}
                  className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {passwordErrors.map((err) => (
                    <li key={err} className="text-xs text-red-600">{err}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl border bg-cream px-3.5 py-2.5 text-sm outline-none transition pr-10 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-line focus:border-teal-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-full border border-line py-2.5 text-sm font-semibold text-ink-soft hover:bg-cream transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-teal-900 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Updating…</span>
                  </>
                ) : (
                  <span>Update</span>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
