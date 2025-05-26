import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Home, 
  ClipboardList, 
  User, 
  LogOut,
  Tags,
  History
} from 'lucide-react';

function Sidebar({ userType }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigateToProfile = () => {
    navigate(userType === 'admin' ? '/admin/profile' : '/customer/profile');
  };

  // Admin menu items - updated based on requirements
  const adminMenuItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard'
    },
    {
      label: 'Kategori',
      icon: <Tags size={20} />,
      path: '/admin/categories'
    },
    {
      label: 'Daftar Produk',
      icon: <Package size={20} />,
      path: '/admin/products'
    },
    {
      label: 'Transaksi',
      icon: <ShoppingCart size={20} />,
      path: '/admin/transactions'
    }
    // {
    //   label: 'Laporan',
    //   icon: <FileText size={20} />,
    //   path: '/admin/reports'
    // }
  ];

  // Customer (Pelanggan) menu items - updated based on requirements
  const customerMenuItems = [
    {
      label: 'Menu',
      icon: <Home size={20} />,
      path: '/customer/dashboard'
    },
    {
      label: 'Riwayat Transaksi',
      icon: <History size={20} />,
      path: '/customer/transactions'
    }
  ];

  // Select the appropriate menu items based on user type
  const menuItems = userType === 'admin' ? adminMenuItems : customerMenuItems;

  return (
    <div className="h-screen flex flex-col border border-r-1 border-gray-200">
      {/* Sidebar content */}
      <div className="bg-white h-full w-64 p-5 overflow-y-auto flex flex-col shadow-md">
        {/* Header with logo */}
        <div className="flex mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-2xl font-bold text-white">K</span>
            </div>
            <span className="text-xl font-medium text-blue-600 ml-3">Kasir UUK</span>
          </div>
        </div>
        
        {/* Menu items */}
        <div className="mb-8 flex-grow">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index} className="flex justify-center">
                <Link
                  to={item.path}
                  className={`w-full flex items-center py-3 px-4 rounded-md transition-colors ${
                    isActive(item.path) 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* User profile at bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div 
            className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
            onClick={navigateToProfile}
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-blue-600" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">
                {currentUser?.name || currentUser?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {userType === 'admin' ? 'Admin' : 'Pelanggan'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full mt-3 px-4 py-3 text-gray-600 hover:text-red-600 rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium ml-3">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 