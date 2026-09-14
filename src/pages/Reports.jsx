import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../lib/api';

const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function Reports() {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportsApi.sales(period).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    reportsApi.topProducts().then((res) => setTopProducts(res.products));
  }, []);

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl text-teal-900">Reports & analytics</h1>
      <p className="mt-1 text-ink-soft">Sales performance across time and your best-selling products.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${period === p.id ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-line bg-paper p-6">
        <h2 className="font-display text-lg text-teal-900">Revenue &amp; orders — {period}</h2>
        <div className="mt-4 h-72">
          {loading ? (
            <p className="text-ink-soft">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4E5A52' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4E5A52' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #DAD5C2', fontSize: 13 }} />
                <Bar dataKey="revenue" fill="#124C42" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 rounded-2xl border border-line bg-paper p-6">
        <h2 className="font-display text-lg text-teal-900">Top-selling products</h2>
        <div className="mt-4 space-y-3">
          {topProducts.map((p, i) => (
            <div key={p._id} className="flex items-center justify-between border-b border-line pb-3 text-sm last:border-0">
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-100 text-xs font-semibold text-teal-900">{i + 1}</span>
                <span className="text-teal-900">{p._id}</span>
              </div>
              <div className="flex gap-6 text-ink-soft">
                <span>{p.unitsSold} units</span>
                <span className="font-semibold text-teal-900">₹{p.revenue}</span>
              </div>
            </div>
          ))}
          {topProducts.length === 0 && <p className="text-ink-soft">No sales data yet.</p>}
        </div>
      </motion.div>
    </div>
  );
}
