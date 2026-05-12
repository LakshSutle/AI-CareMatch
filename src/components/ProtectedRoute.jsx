import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

/**
 * ProtectedRoute — wraps a page that requires authentication.
 * If the user isn't logged in → redirects to /login.
 * If `requiredRole` is specified and doesn't match → redirects to /dashboard.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--text-muted)', fontSize: 'var(--fs-lg)',
      }}>
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
