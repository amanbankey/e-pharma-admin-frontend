import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ComposedChart, Bar, Line, Cell, CartesianGrid, ReferenceLine, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../lib/api';
import Loader from '../components/Loader';

const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

const periodNames = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' };

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const inrShort = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7) return `₹${+(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${+(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${+(v / 1e3).toFixed(1)}K`;
  return `₹${v}`;
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-paper p-3 text-sm shadow-md">
      <p className="font-semibold text-teal-900">{label}</p>
      <p className="mt-1 text-ink-soft">Revenue: <span className="font-semibold text-teal-900">{inr(row.revenue)}</span></p>
      {row.orders != null && (
        <p className="text-ink-soft">Orders: <span className="font-semibold text-[#C2410C]">{row.orders}</span></p>
      )}
      {row.orders > 0 && (
        <p className="text-ink-soft">Avg per order: <span className="font-semibold text-teal-900">{inr(Math.round(row.revenue / row.orders))}</span></p>
      )}
    </div>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="rounded-xl border border-line bg-cream/50 p-4">
      <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl text-teal-900">{value}</p>
      {sub && <p className={`mt-0.5 text-xs ${tone || 'text-ink-soft'}`}>{sub}</p>}
    </div>
  );
}

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

  const summary = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) return null;
    const totalRevenue = rows.reduce((a, r) => a + Number(r.revenue || 0), 0);
    const hasOrders = rows.some((r) => r.orders != null);
    const totalOrders = rows.reduce((a, r) => a + Number(r.orders || 0), 0);
    const best = rows.reduce((b, r) => (Number(r.revenue || 0) > Number(b.revenue || 0) ? r : b), rows[0]);
    const avgRevenue = totalRevenue / rows.length;
    const last = Number(rows[rows.length - 1].revenue || 0);
    const prev = rows.length > 1 ? Number(rows[rows.length - 2].revenue || 0) : null;
    const change = prev ? ((last - prev) / prev) * 100 : null;
    return { rows, totalRevenue, hasOrders, totalOrders, best, avgRevenue, change };
  }, [data]);

  const unit = periodNames[period];

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto lg:h-screen p-6 lg:p-10">
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
        <p className="mt-1 text-sm text-ink-soft">
          Each bar is the money earned in that {unit}.{summary?.hasOrders ? ' The orange line shows how many orders came in.' : ''} The dashed line is the average.
        </p>

        {!loading && summary && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Total revenue" value={inr(summary.totalRevenue)} sub={`across ${summary.rows.length} ${unit}${summary.rows.length > 1 ? 's' : ''}`} />
              {summary.hasOrders && (
                <Stat
                  label="Total orders"
                  value={summary.totalOrders}
                  sub={summary.totalOrders ? `≈ ${inr(Math.round(summary.totalRevenue / summary.totalOrders))} per order` : undefined}
                />
              )}
              <Stat label="Best period" value={summary.best.label} sub={`${inr(summary.best.revenue)} — highest`} tone="text-teal-700" />
              <Stat
                label="Latest vs previous"
                value={summary.change == null ? '—' : `${summary.change >= 0 ? '▲' : '▼'} ${Math.abs(summary.change).toFixed(1)}%`}
                sub={summary.change == null ? 'Not enough data to compare' : summary.change >= 0 ? 'Sales are growing' : 'Sales dropped'}
                tone={summary.change == null ? undefined : summary.change >= 0 ? 'text-green-700' : 'text-red-700'}
              />
            </div>

            <p className="mt-4 rounded-xl bg-teal-100/60 px-4 py-3 text-sm text-teal-900">
              <span className="font-semibold">In short: </span>
              {summary.rows.length} {unit}{summary.rows.length > 1 ? 's' : ''} mein total {inr(summary.totalRevenue)} ki sales hui. Sabse zyada sale <b>{summary.best.label}</b> mein rahi ({inr(summary.best.revenue)}).
              {summary.change != null &&
                (summary.change >= 0
                  ? ` Latest ${unit} pichle se ${Math.abs(summary.change).toFixed(1)}% behtar hai.`
                  : ` Latest ${unit} pichle se ${Math.abs(summary.change).toFixed(1)}% kam hai.`)}
            </p>
          </>
        )}

        <div className="mt-5 h-80">
          {loading ? (
            <Loader />
          ) : !summary ? (
            <p className="text-ink-soft">No sales data for this period yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={summary.rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#DAD5C2" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4E5A52' }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="rev"
                  tickFormatter={inrShort}
                  tick={{ fontSize: 11, fill: '#4E5A52' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                {summary.hasOrders && (
                  <YAxis
                    yAxisId="ord"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#C2410C' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                )}
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(18,76,66,0.06)' }} />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine
                  yAxisId="rev"
                  y={summary.avgRevenue}
                  stroke="#4E5A52"
                  strokeDasharray="5 5"
                  label={{ value: `Avg ${inrShort(summary.avgRevenue)}`, position: 'insideTopRight', fontSize: 11, fill: '#4E5A52' }}
                />
                <Bar yAxisId="rev" dataKey="revenue" name="Revenue (₹, left axis)" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {summary.rows.map((r, i) => (
                    <Cell key={i} fill={r === summary.best ? '#124C42' : '#5E9C8F'} />
                  ))}
                </Bar>
                {summary.hasOrders && (
                  <Line yAxisId="ord" type="monotone" dataKey="orders" name="Orders (right axis)" stroke="#C2410C" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                )}
              </ComposedChart>
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
