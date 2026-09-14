const styles = {
  pending: 'bg-gold-100 text-gold-600',
  confirmed: 'bg-teal-100 text-teal-700',
  processing: 'bg-teal-100 text-teal-700',
  packed: 'bg-teal-100 text-teal-700',
  shipped: 'bg-teal-100 text-teal-900',
  out_for_delivery: 'bg-teal-100 text-teal-900',
  delivered: 'bg-teal-900 text-cream',
  cancelled: 'bg-red-100 text-red-600',
  returned: 'bg-red-100 text-red-600',
  refunded: 'bg-red-100 text-red-600',
};

const labels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || 'bg-teal-100 text-teal-700'}`}>
      {labels[status] || status}
    </span>
  );
}
