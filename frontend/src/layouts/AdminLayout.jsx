import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/ui/Sidebar';

function AdminLayout({ children }) {
  const { currentUser, isStaff, loading } = useAuth();
  
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isStaff()) {
    return <Navigate to="/customer/dashboard" replace />;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="admin" />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout; 