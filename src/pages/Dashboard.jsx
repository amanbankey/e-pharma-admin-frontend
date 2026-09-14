import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Users, ShoppingBag, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { dashboardApi, reportsApi } from '../lib/api';

const formatInLakhs = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const STATUS_COLORS = ['#124C42', '#1B6B5C', '#A97A34', '#C79A52', '#B84A3E', '#4E5A52'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([dashboardApi.get(), reportsApi.sales('monthly')])
      .then(([dash, sales]) => {
        setStats(dash.stats);
        setRecentOrders(dash.recentOrders || []);
        setSalesData(sales.data.map((d) => ({ label: d.label, revenue: d.revenue })));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statusData = stats
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) return <div className="p-8 text-ink-soft">Loading dashboard…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-6 lg:p-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-teal-900">Dashboard</h1>
        <p className="mt-1 text-ink-soft">Here's how Vernal Rx is doing today.</p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total revenue" value={formatInLakhs(stats.totalRevenue)} index={0} />
        <StatCard icon={ShoppingBag} label="Total orders" value={stats.totalOrders} index={1} />
        <StatCard icon={Users} label="Total customers" value={stats.totalUsers} index={2} />
        <StatCard icon={UserCheck} label="Active users (30d)" value={stats.activeUsers} index={3} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-line bg-paper p-6 lg:col-span-2"
        >
          <h2 className="font-display text-lg text-teal-900">Revenue trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#124C42" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#124C42" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4E5A52' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4E5A52' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #DAD5C2', fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="#124C42" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-line bg-paper p-6"
        >
          <h2 className="font-display text-lg text-teal-900">Orders by status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #DAD5C2', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-2xl border border-line bg-paper p-6"
      >
        <h2 className="font-display text-lg text-teal-900">Recent orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="py-3 pr-4 font-medium text-teal-900">{o.user?.fullName}</td>
                  <td className="py-3 pr-4 text-ink-soft">{o.user?.email}<br />{o.user?.phone}</td>
                  <td className="py-3 pr-4 text-ink-soft">{[o.user?.city, o.user?.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="py-3 pr-4 font-semibold text-teal-900">₹{o.totalAmount}</td>
                  <td className="py-3"><StatusBadge status={o.orderStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
