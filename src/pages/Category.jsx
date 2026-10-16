import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Tag, MoreVertical, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';
import { categoryApi } from '../lib/api';

const ITEMS_PER_PAGE = 10;

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState('');
  const [actionMenu, setActionMenu] = useState(null); // { category, top, right } of the open 3-dots menu
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const load = () => {
    setLoading(true);
    categoryApi
      .getAll()
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error('Failed to load categories:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setForm(cat.category);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryApi.update(editingId, { category: form });
      } else {
        await categoryApi.create({ category: form });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err.message || 'Failed to save category');
    }
  };

  const openDeletePopup = (category) => {
    setDeleteError('');
    setDeleteTarget(category);
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
      await categoryApi.remove(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  // 3-dots menu: opens below the clicked icon (fixed position, so the scrollable table does not clip it)
  const toggleActionMenu = (e, category) => {
    if (actionMenu?.category._id === category._id) {
      setActionMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setActionMenu({ category, top: rect.bottom + 6, right: window.innerWidth - rect.right });
  };

  // Pagination
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto lg:h-screen p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-teal-900">Categories</h1>
          <p className="mt-1 text-ink-soft">Manage product categories shown on the storefront.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal-700"
        >
          <Plus size={16} /> Add category
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        {loading ? (
          <Loader label="Loading categories…" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Category Name</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paginatedCategories.map((cat, idx) => (
                <tr key={cat._id} className="hover:bg-teal-100/30">
                  <td className="px-5 py-3 text-ink-soft">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-teal-700" />
                      <span className="font-medium text-teal-900">{cat.category}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {new Date(cat.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => toggleActionMenu(e, cat)}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition hover:bg-teal-100/60 hover:text-teal-900"
                        aria-label="More actions"
                        title="More actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-soft">
                    No categories yet. Click "Add category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <p className="text-sm text-ink-soft">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, categories.length)} of {categories.length}
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
              onSubmit={handleSubmit}
              className="w-full max-w-md rounded-2xl bg-paper p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-teal-900">
                  {editingId ? 'Edit category' : 'Add category'}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-ink-soft" />
                </button>
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-ink-soft">Category name</label>
                <input
                  required
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  placeholder="e.g. Pain Relief"
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-teal-900 py-3 font-semibold text-cream transition hover:bg-teal-700"
              >
                {editingId ? 'Save changes' : 'Create category'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row actions menu (3 dots): Edit / Delete */}
      {actionMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
          <div
            style={{ top: actionMenu.top, right: actionMenu.right }}
            className="fixed z-50 w-36 overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-lg"
          >
            <button
              onClick={() => {
                const category = actionMenu.category;
                setActionMenu(null);
                openEdit(category);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-teal-900 transition hover:bg-teal-100/50"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => {
                const category = actionMenu.category;
                setActionMenu(null);
                openDeletePopup(category);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}

      {/* Delete Category Confirmation Popup */}
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
              <h3 className="mt-4 font-display text-xl text-teal-900">Delete this category?</h3>
              <p className="mt-2 text-sm text-ink-soft">
                <span className="font-semibold text-teal-900">{deleteTarget.category}</span> will be permanently
                removed. This cannot be undone.
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
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
