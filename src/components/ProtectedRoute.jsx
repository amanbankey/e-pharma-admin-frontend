import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../lib/AdminAuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, permission }) {
  const { admin, loading, can } = useAdminAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!admin) return <Navigate to="/login" replace />;
  if (permission && !can(permission)) return <Navigate to="/" replace />;

  return children;
}
