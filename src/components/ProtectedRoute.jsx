import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../lib/AdminAuthContext';

export default function ProtectedRoute({ children, permission }) {
  const { admin, loading, can } = useAdminAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-ink-soft">Loading…</div>;
  }

  if (!admin) return <Navigate to="/login" replace />;
  if (permission && !can(permission)) return <Navigate to="/" replace />;

  return children;
}
