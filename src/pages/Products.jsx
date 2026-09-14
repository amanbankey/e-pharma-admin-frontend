import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, FileWarning, Upload, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi, categoryApi } from '../lib/api';

const ITEMS_PER_PAGE = 20;

const emptyForm = {
  name: '', category: '', price: '', mrp: '', unit: '', composition: '',
  manufacturer: '', totalStock: 0, lowStockThreshold: 20, expiryDate: '',
  prescriptionRequired: false, images: [],
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadCategories = () => {
    categoryApi
      .getAll()
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error('Failed to load categories:', err));
  };

  const loadProducts = () => {
    setLoading(true);
    productsApi
      .getAll()
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?.category || '', images: [] });
    setUploadError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || '',
      category: p.category || '',
      price: p.price ?? '',
      mrp: p.mrp ?? '',
      unit: p.unit || '',
      composition: p.composition || '',
      manufacturer: p.manufacturer || '',
      totalStock: p.totalStock ?? 0,
      lowStockThreshold: p.lowStockThreshold ?? 20,
      expiryDate: p.expiryDate?.slice(0, 10) || '',
      prescriptionRequired: Boolean(p.prescriptionRequired),
      images: Array.isArray(p.images) ? [...p.images] : [],
    });
    setUploadError('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    setUploadError('');

    try {
      for (const file of files) {
        const data = await productsApi.uploadImage(file);
        if (data.url) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, data.url],
          }));
        }
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const urlToRemove = form.images[indexToRemove];
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));

    if (urlToRemove) {
      try {
        await productsApi.deleteImage(urlToRemove);
      } catch (err) {
        console.warn('Could not delete image from Cloudinary:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      mrp: Number(form.mrp),
      totalStock: Number(form.totalStock),
      lowStockThreshold: Number(form.lowStockThreshold),
      images: form.images,
    };
    try {
      if (editingId) {
        await productsApi.update(editingId, payload);
      } else {
        await productsApi.create(payload);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this product and its images from the catalogue?')) return;
    try {
      await productsApi.remove(id);
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const filtered = filter === 'all' ? products : products.filter((p) => p.category === filter);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getCategoryLabel = (catValue) => {
    const found = categories.find((c) => c.category === catValue || c._id === catValue);
    return found?.category || catValue;
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-teal-900">Products</h1>
          <p className="mt-1 text-ink-soft">Manage the catalogue shown on the storefront.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal-700"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      {/* Category filter bar */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${filter === 'all' ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft'}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setFilter(c.category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${filter === c.category ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft'}`}
          >
            {c.category}
          </button>
        ))}
      </div>

      {/* Products table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        {loading ? (
          <p className="p-6 text-ink-soft">Loading products…</p>
        ) : (
          <>
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3">Image</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">MRP</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Rx</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paginatedProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-teal-100/30">
                    <td className="px-5 py-3">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-ink-soft/40">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-teal-900">{p.name}</p>
                      <p className="text-xs text-ink-soft">{p.composition}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{getCategoryLabel(p.category)}</td>
                    <td className="px-5 py-3 font-semibold text-teal-900">₹{p.price}</td>
                    <td className="px-5 py-3 text-ink-soft line-through">₹{p.mrp}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium ${Math.max((p.totalStock ?? 0) - (p.reservedStock ?? 0), 0) <= (p.lowStockThreshold ?? 20) ? 'text-red-600' : 'text-teal-700'}`}>
                        {Math.max((p.totalStock ?? 0) - (p.reservedStock ?? 0), 0)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {p.prescriptionRequired && (
                        <span className="flex items-center gap-1 rounded-full bg-gold-100 px-2 py-1 text-[11px] font-medium text-gold-600 w-fit">
                          <FileWarning size={11} /> Rx
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-teal-900 hover:border-teal-500"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-red-600 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-ink-soft">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <p className="text-sm text-ink-soft">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
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
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
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
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-teal-900">{editingId ? 'Edit product' : 'Add product'}</h3>
                <button type="button" onClick={() => setModalOpen(false)}><X size={20} className="text-ink-soft" /></button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-ink-soft">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c.category}>{c.category}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Unit</label>
                  <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="30 tablets" className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Price (₹)</label>
                  <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">MRP (₹)</label>
                  <input required type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-ink-soft">Composition</label>
                  <input value={form.composition} onChange={(e) => setForm({ ...form, composition: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-ink-soft">Manufacturer</label>
                  <input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Total stock</label>
                  <input type="number" value={form.totalStock} onChange={(e) => setForm({ ...form, totalStock: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Low stock alert below</label>
                  <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-soft">Expiry date</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <label className="col-span-2 flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" checked={form.prescriptionRequired} onChange={(e) => setForm({ ...form, prescriptionRequired: e.target.checked })} />
                  Prescription required
                </label>
                {/* Direct Image Upload to Cloudinary */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-ink-soft">Product Images</label>

                  <div className="mt-2 space-y-3">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-cream p-4 transition hover:border-teal-600 hover:bg-cream/70">
                      <div className="flex flex-col items-center justify-center text-center">
                        {uploadingImage ? (
                          <div className="flex items-center gap-2 text-teal-800">
                            <Loader2 className="animate-spin" size={24} />
                            <span className="text-sm font-medium">Uploading to Cloudinary…</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="mb-2 text-teal-800" size={24} />
                            <p className="text-sm font-semibold text-teal-900">Click to upload product image(s)</p>
                            <p className="text-xs text-ink-soft">PNG, JPG, WEBP (saved to Cloudinary)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

                    {/* Uploaded Thumbnails Preview */}
                    {form.images && form.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {form.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-white"
                          >
                            <img
                              src={imgUrl}
                              alt={`Product ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 rounded bg-teal-900/80 px-1.5 py-0.5 text-[9px] font-semibold text-cream">
                                Main
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700"
                              title="Delete image"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className="mt-6 w-full rounded-full bg-teal-900 py-3 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-50"
              >
                {editingId ? 'Save changes' : 'Add to catalogue'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
