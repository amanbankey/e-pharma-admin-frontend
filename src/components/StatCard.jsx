import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, hint, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border border-line bg-paper p-5"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 text-teal-700">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 font-display text-2xl text-teal-900">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-gold-600">{hint}</p>}
    </motion.div>
  );
}
