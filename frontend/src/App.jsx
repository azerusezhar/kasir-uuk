import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Auth pages
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import Transactions from './pages/admin/Transactions';
import AdminTransactionDetail from './pages/admin/TransactionDetail';
import TransactionForm from './pages/admin/TransactionForm';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerProfile from './pages/customer/Profile';
import CustomerTransactions from './pages/customer/Transactions';
import CustomerTransactionDetail from './pages/customer/TransactionDetail';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminProfile />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Categories />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Products />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products/edit/:id" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ProductFormWrapper />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/transactions" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Transactions />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/transactions/:id" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminTransactionDetail />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/transactions" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <TransactionForm />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stock" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <div className="p-4">
                      <h2 className="text-2xl font-bold mb-4">Stok Produk</h2>
                      <p className="text-gray-600">Halaman ini sedang dalam pengembangan.</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <div className="p-4">
                      <h2 className="text-2xl font-bold mb-4">Laporan</h2>
                      <p className="text-gray-600">Halaman ini sedang dalam pengembangan.</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Customer routes */}
            <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerLayout>
                    <CustomerDashboard />
                  </CustomerLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/profile" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerLayout>
                    <CustomerProfile />
                  </CustomerLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/products" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerLayout>
                    <div className="p-4">
                      <h2 className="text-2xl font-bold mb-4">Daftar Produk</h2>
                      <p className="text-gray-600">Halaman ini sedang dalam pengembangan.</p>
                    </div>
                  </CustomerLayout>
                </ProtectedRoute>
              } 
            />
            {/* <Route 
              path="/customer/orders" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerLayout>
                    <div className="p-4">
                      <h2 className="text-2xl font-bold mb-4">Pesanan Saya</h2>
                      <p className="text-gray-600">Halaman ini sedang dalam pengembangan.</p>
                    </div>
                  </CustomerLayout>
                </ProtectedRoute>
              } 
            /> */}
            <Route 
              path="/customer/transactions" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerLayout>
                    <CustomerTransactions />
                  </CustomerLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/transactions/:id" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerLayout>
                    <CustomerTransactionDetail />
                  </CustomerLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
                    <p className="mb-4">The page you are looking for does not exist.</p>
                    <a 
                      href="/"
                      className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

// Wrapper component to extract ID from URL params
function ProductFormWrapper() {
  const params = new URL(window.location.href).pathname.split('/');
  const productId = params[params.length - 1];
  
}

export default App;
