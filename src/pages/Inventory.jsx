import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, PackageCheck, PackageMinus, AlertTriangle, PackageX, CalendarClock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { inventoryApi } from '../lib/api';

const filters = [
  { id: 'all', label: 'All products' },
  { id: 'low', label: 'Low stock' },
  { id: 'out', label: 'Out of stock' },
  { id: 'expiring', label: 'Expiring soon' },
  { id: 'expired', label: 'Expired' },
];

export default function Inventory() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.summary().then((data) => setSummary(data.summary));
  }, []);

  useEffect(() => {
    setLoading(true);
    inventoryApi
      .list(filter === 'all' ? '' : filter)
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [filter]);

  const updateStock = async (id, totalStock) => {
    await inventoryApi.updateStock(id, { totalStock });
    inventoryApi.list(filter === 'all' ? '' : filter).then((data) => setProducts(data.products));
    inventoryApi.summary().then((data) => setSummary(data.summary));
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl text-teal-900">Inventory</h1>
      <p className="mt-1 text-ink-soft">Stock levels, expiry tracking, and low-stock alerts.</p>

      {summary && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={Boxes} label="Total stock" value={summary.totalStock} index={0} />
          <StatCard icon={PackageCheck} label="Available" value={summary.availableStock} index={1} />
          <StatCard icon={PackageMinus} label="Reserved" value={summary.reservedStock} index={2} />
          <StatCard icon={AlertTriangle} label="Low stock" value={summary.lowStock} index={3} />
          <StatCard icon={PackageX} label="Out of stock" value={summary.outOfStock} index={4} />
          <StatCard icon={CalendarClock} label="Expiring soon" value={summary.expiringSoon} index={5} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${filter === f.id ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        {loading ? (
          <p className="p-6 text-ink-soft">Loading…</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Total stock</th>
                <th className="px-5 py-3">Available</th>
                <th className="px-5 py-3">Expiry</th>
                <th className="px-5 py-3">Update stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-5 py-3 font-medium text-teal-900">{p.name}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.totalStock}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.totalStock - p.reservedStock}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      defaultValue={p.totalStock}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== p.totalStock) updateStock(p._id, val);
                      }}
                      className="w-24 rounded-lg border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal-500"
                    />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-soft">No products in this filter.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
