import Sidebar from './Sidebar';

export default function Shell({ children }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
