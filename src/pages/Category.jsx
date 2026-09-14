import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import { categoryApi } from '../lib/api';

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState('');

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryApi.remove(id);
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="p-6 lg:p-10">
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
          <p className="p-6 text-ink-soft">Loading categories…</p>
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
              {categories.map((cat, idx) => (
                <tr key={cat._id} className="hover:bg-teal-100/30">
                  <td className="px-5 py-3 text-ink-soft">{idx + 1}</td>
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-teal-900 hover:border-teal-500"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-red-600 hover:text-red-600"
                      >
                        <Trash2 size={12} /> Delete
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
    </div>
  );
}
