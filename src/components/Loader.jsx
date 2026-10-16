// Themed CSS spinner used in place of plain "Loading…" text across the admin panel.
export default function Loader({ label, size = 32, fullScreen = false, className = '' }) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <span
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-3 border-teal-100 border-t-teal-900"
      />
      {label && <p className="text-sm font-medium text-ink-soft">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="flex h-screen items-center justify-center">{spinner}</div>;
  }

  return <div className="py-10">{spinner}</div>;
}
