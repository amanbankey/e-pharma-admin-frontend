import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { usersApi } from '../lib/api';

const ITEMS_PER_PAGE = 10;

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = () => {
    setLoading(true);
    usersApi.getAll().then((data) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openDeletePopup = (user) => {
    setDeleteError('');
    setDeleteTarget(user);
  };

  const closeDeletePopup = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await usersApi.remove(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto lg:h-screen p-6 lg:p-10">
      <h1 className="font-display text-3xl text-teal-900">Customers</h1>
      <p className="mt-1 text-ink-soft">Everyone who has signed up on the storefront.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        {loading ? (
          <p className="p-6 text-ink-soft">Loading…</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paginatedUsers.map((u) => (
                <tr key={u._id}>
                  <td className="px-5 py-3 font-medium text-teal-900">{u.fullName}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.phone}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.city || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openDeletePopup(u)} className="text-ink-soft hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-soft">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <p className="text-sm text-ink-soft">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, users.length)} of {users.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-line p-1.5 text-ink-soft hover:bg-cream disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                .map((page, idx, arr) => (
                  <span key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-1 text-ink-soft">…</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium ${
                        currentPage === page
                          ? 'bg-teal-900 text-cream'
                          : 'text-ink-soft hover:bg-cream'
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-line p-1.5 text-ink-soft hover:bg-cream disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Customer Confirmation Popup */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onClick={closeDeletePopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-paper p-6 text-center"
            >
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={22} />
              </span>
              <h3 className="mt-4 font-display text-xl text-teal-900">Remove this customer?</h3>
              <p className="mt-2 text-sm text-ink-soft">
                <span className="font-semibold text-teal-900">{deleteTarget.fullName}</span>'s account will be
                permanently removed. This cannot be undone.
              </p>

              {deleteError && (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">{deleteError}</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeDeletePopup}
                  disabled={deleting}
                  className="flex-1 rounded-full border border-line py-2.5 text-sm font-semibold text-ink-soft transition hover:border-teal-500 hover:text-teal-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? 'Removing…' : 'Yes, remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
