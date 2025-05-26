import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  User, 
  Users, 
  LogIn, 
  Mail, 
  Key, 
  Eye, 
  EyeOff,
} from 'lucide-react';

function LoginForm() {
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '',
    loginType: 'customer' 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser, isStaff, isCustomer } = useAuth();
  
  
  const showErrorToast = (message) => {
    console.log("Showing error toast:", message);
    
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', window.location.href);
      

      window.addEventListener('popstate', function(event) {
        window.history.pushState({}, '', window.location.href);
      });
    }
    
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showSuccessToast = (message) => {
    console.log("Showing success toast:", message);
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };
  
  // Update the useEffect to handle redirects
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Redirect based on role and return path
        const from = location.state?.from || 
          (userData.role === 'admin' || userData.role === 'petugas' ? 
            '/admin/dashboard' : '/customer/dashboard');
        navigate(from, { replace: true });
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, [currentUser, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const validateForm = () => {
    console.log("Validating form with credentials:", credentials);
    
    // Check if required fields are filled
    if (!credentials.email || !credentials.password) {
      console.log("Validation failed: Email and password required");
      showErrorToast("Email dan kata sandi diperlukan");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      console.log("Validation failed: Invalid email format");
      showErrorToast("Silakan masukkan alamat email yang valid");
      return false;
    }

    console.log("Form validation successful");
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await login({
        email: credentials.email,
        password: credentials.password,
        loginType: credentials.loginType
      });

      showSuccessToast("Login berhasil!");
      
      // Get return URL from location state or use default based on role
      const from = location.state?.from || 
        (response.user.role === 'admin' || response.user.role === 'petugas' ? 
          '/admin/dashboard' : '/customer/dashboard');
      
      // Navigate to the return URL
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login gagal';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, redirect based on role
  if (currentUser) {
    if (isStaff()) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (isCustomer()) {
      return <Navigate to="/customer/dashboard" replace />;
    }
  }

  return (
    <div className="h-screen w-screen flex bg-gray-100">
      {/* Add ToastContainer at the top level */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
      />
      
      <div className="w-full flex">
        {/* Left column - Login form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center mb-8">
              {/* <LogIn className="h-8 w-8 text-blue-600" /> */}
              <h2 className="text-2xl font-bold text-gray-900">Kasir UUK</h2>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang </h1>
            <p className="text-gray-600 mb-8">Masukkan email dan kata sandi Anda untuk mengakses akun.</p>
            
            {/* Login type selection at the top */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-3">Masuk Sebagai</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCredentials(prev => ({ ...prev, loginType: 'admin' }))}
                  className={`flex items-center justify-center py-2.5 px-4 border rounded-lg text-sm font-medium cursor-pointer transition-colors
                  ${credentials.loginType === 'admin' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <User className="h-5 w-5 mr-2" />
                  Admin
                </button>
                <button
                  type="button" 
                  onClick={() => setCredentials(prev => ({ ...prev, loginType: 'customer' }))}
                  className={`flex items-center justify-center py-2.5 px-4 border rounded-lg text-sm font-medium cursor-pointer transition-colors
                  ${credentials.loginType === 'customer' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Pelanggan
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
              return false;
            }}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={credentials.email}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="nama@contoh.com"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? 
                      <EyeOff className="h-5 w-5" /> : 
                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Ingat Saya
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="#" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    Lupa Kata Sandi?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sedang Masuk...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Masuk
                  </span>
                )}
              </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-600">
              Belum Punya Akun?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
        
        {/* Right column - App info */}
        <div className="hidden md:block md:w-1/2 bg-blue-600">
          <div className="h-full flex flex-col justify-center p-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Kelola toko dan operasi Anda dengan mudah.</h2>
            <p className="mb-8 text-white">Masuk untuk mengakses dashboard POS dan kelola inventaris, penjualan, dan pelanggan Anda.</p>
            
            <div className="mt-12">
              <img 
                src="/dashboard-preview.png" 
                alt="Pratinjau Dashboard" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm; 