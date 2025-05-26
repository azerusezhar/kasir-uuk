import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, loading, hasRole, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log(`[ProtectedRoute] Path: ${location.pathname}, Loading: ${loading}, IsAuthenticated: ${isAuthenticated}, CurrentUser:`, currentUser ? currentUser.email : 'null');

  if (loading) {
    console.log(`[ProtectedRoute] Path: ${location.pathname}, Still loading, showing spinner.`);
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    console.log(`[ProtectedRoute] Path: ${location.pathname}, Not authenticated or no user, redirecting to /login.`);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log(`[ProtectedRoute] Path: ${location.pathname}, Authenticated. Checking role... Required: ${requiredRole}, User has role: ${hasRole(requiredRole)}`);
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`[ProtectedRoute] Path: ${location.pathname}, Role mismatch. Redirecting...`);
    if (hasRole('admin') || hasRole('petugas') || hasRole('officer')) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (hasRole('customer')) {
      return <Navigate to="/customer/dashboard" replace />;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  console.log(`[ProtectedRoute] Path: ${location.pathname}, Auth and role checks passed. Rendering children.`);
  return children;
}

export default ProtectedRoute; 