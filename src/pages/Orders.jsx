import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, CalendarDays,Pencil } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { ordersApi } from '../lib/api';

const ITEMS_PER_PAGE = 20;

const statusFilters = [
  'all', 'pending', 'confirmed', 'processing', 'packed', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
];

const nextStatuses = [
  'pending', 'confirmed', 'processing', 'packed', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [savingDate, setSavingDate] = useState(false);

  const load = () => {
    setLoading(true);
    ordersApi.getAll(filter === 'all' ? '' : filter).then((data) => setOrders(data.orders || [])).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleStatusChange = async (id, status) => {
    await ordersApi.updateStatus(id, status);
    load();
    if (selected?._id === id) setSelected({ ...selected, orderStatus: status });
  };

  const handleDeliveryDateSave = async () => {
    if (!deliveryDate || !selected) return;
    setSavingDate(true);
    try {
      const data = await ordersApi.updateDeliveryDate(selected._id, deliveryDate);
      setSelected({ ...selected, expectedDeliveryDate: deliveryDate });
      load();
      
    } catch (err) {
      alert(err.message || 'Failed to update delivery date');
    } finally {
      setSavingDate(false);
      setSelected(null)
    }
  };

  const openOrderDetail = (o) => {
    setSelected(o);
    setDeliveryDate(o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toISOString().slice(0, 10) : '');
  };

  // Pagination
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto lg:h-screen p-6 lg:p-10">
      <h1 className="font-display text-3xl text-teal-900">Orders</h1>
      <p className="mt-1 text-ink-soft">Every order, from placed to delivered.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize ${filter === s ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft'}`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        {loading ? (
          <p className="p-6 text-ink-soft">Loading orders…</p>
        ) : (
          <>
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paginatedOrders.map((o) => (
                  <tr key={o._id} onClick={() => openOrderDetail(o)} className="cursor-pointer hover:bg-teal-100/30">
                    <td className="px-5 py-3 font-medium text-teal-900">{o.orderId}</td>
                    <td className="px-5 py-3 text-ink-soft">{o.user?.fullName}</td>
                    <td className="px-5 py-3 text-ink-soft">{o.user?.phone || '—'}</td>
                    <td className="px-5 py-3 text-ink-soft">{new Date(o.orderDate || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-5 py-3 font-semibold text-teal-900">₹{o.totalAmount}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.orderStatus} /></td>
                    <td className='text-left py-3 '> 
                      <div className='w-16'> 
                        <span 
                          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-teal-900 hover:border-teal-500"
                        >
                          <Pencil size={12} /> Edit
                        </span></div></td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-soft">No orders in this status.</td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <p className="text-sm text-ink-soft">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, orders.length)} of {orders.length}
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

      {/* Order Detail Side Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/40"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'tween', duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-md overflow-y-auto bg-paper p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-teal-900">{selected.orderId}</h3>
                <button onClick={() => setSelected(null)}><X size={20} className="text-ink-soft" /></button>
              </div>

              <div className="mt-5 space-y-1 rounded-xl bg-cream p-4 text-sm">
                <p className="font-semibold text-teal-900">{selected.user?.fullName}</p>
                <p className="text-ink-soft">{selected.user?.email}</p>
                <p className="text-ink-soft">{selected.user?.phone || 'No phone'}</p>
                <p className="text-ink-soft">{selected.address}</p>
              </div>

              <div className="mt-4 divide-y divide-line border-y border-line">
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-2.5 text-sm">
                    <span className="text-ink">{item.name} × {item.qty}</span>
                    <span className="text-ink-soft">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-soft"><span>Subtotal</span><span>₹{selected.subtotal || selected.totalAmount}</span></div>
                <div className="flex justify-between text-ink-soft"><span>Discount</span><span>-₹{selected.discount || 0}</span></div>
                <div className="flex justify-between text-ink-soft"><span>Tax</span><span>₹{selected.tax || 0}</span></div>
                <div className="flex justify-between text-ink-soft"><span>Shipping</span><span>₹{selected.shipping || 0}</span></div>
                <div className="flex justify-between border-t border-line pt-2 font-display text-base text-teal-900">
                  <span>Total</span><span>₹{selected.totalAmount}</span>
                </div>
              </div>

              {/* Order Status */}
              <div className="mt-6">
                <label className="text-sm font-medium text-ink-soft">Order status</label>
                <select
                  value={selected.orderStatus}
                  onChange={(e) => handleStatusChange(selected._id, e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm capitalize outline-none focus:border-teal-500"
                >
                  {nextStatuses.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Expected Delivery Date */}
              <div className="mt-4">
                <label className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
                  <CalendarDays size={14} /> Expected delivery date
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="flex-1 rounded-xl border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={handleDeliveryDateSave}
                    disabled={savingDate || !deliveryDate}
                    className="rounded-xl bg-teal-900 px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-50"
                  >
                    {savingDate ? 'Saving…' : 'Save'}
                  </button>
                </div>
                {selected.expectedDeliveryDate && (
                  <p className="mt-1.5 text-xs text-ink-soft">
                    Currently set to: {new Date(selected.expectedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
