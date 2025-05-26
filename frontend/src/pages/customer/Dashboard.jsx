import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Coffee, Utensils, Shirt, Home, Laptop, Smartphone, Book, Gift, Music, Car, Heart, Camera, Plus, Minus, Search, Trash, ArrowRight, Receipt, ShoppingBasket, Tags, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';


const iconComponents = {
  Package: Package,
  ShoppingBag: ShoppingBag,
  Coffee: Coffee,
  Utensils: Utensils,
  Shirt: Shirt,
  Home: Home,
  Laptop: Laptop,
  Smartphone: Smartphone,
  Book: Book,
  Gift: Gift,
  Music: Music,
  Car: Car,
  Heart: Heart,
  Camera: Camera,
  Tags: Tags
};

// Color mapping for category backgrounds
const categoryColors = {
  Package: 'bg-purple-100 text-purple-600 border-purple-200',
  ShoppingBag: 'bg-pink-100 text-pink-600 border-pink-200',
  Coffee: 'bg-amber-100 text-amber-600 border-amber-200',
  Utensils: 'bg-orange-100 text-orange-600 border-orange-200',
  Shirt: 'bg-blue-100 text-blue-600 border-blue-200',
  Home: 'bg-teal-100 text-teal-600 border-teal-200',
  Laptop: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  Smartphone: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200',
  Book: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  Gift: 'bg-rose-100 text-rose-600 border-rose-200',
  Music: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  Car: 'bg-sky-100 text-sky-600 border-sky-200',
  Heart: 'bg-red-100 text-red-600 border-red-200',
  Camera: 'bg-lime-100 text-lime-600 border-lime-200',
  Tags: 'bg-cyan-100 text-cyan-600 border-cyan-200'
};

function CustomerDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, totalAmount, addToCart, updateQuantity, removeFromCart, clearCart, formatToRupiah } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Set initial payment amount when total changes
  useEffect(() => {
    setPaymentAmount(totalAmount.toString());
  }, [totalAmount]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      const productsData = response.data.data || [];
      
      // Process product images
      const processedProducts = productsData.map(product => {
        if (product.image && product.image !== 'no-image.jpg') {
          // Ensure the image path is correct for the static file serving
          const cleanImagePath = product.image.replace(/^\/+/, '');
          product.image = `${import.meta.env.VITE_API_URL}/uploads/${cleanImagePath}`;
        }
        return product;
      });
      
      setProducts(processedProducts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    // Category filter
    const categoryMatch = 
      activeCategory === 'all' || 
      (product.category && product.category._id === activeCategory);

    // Search filter
    const searchMatch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && searchMatch;
  });

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (!selectedProducts[product._id]) {
      // First time adding to cart
      setSelectedProducts({
        ...selectedProducts,
        [product._id]: 1
      });
    } else {
      // Increment quantity
      setSelectedProducts({
        ...selectedProducts,
        [product._id]: selectedProducts[product._id] + 1
      });
    }
    
    // Add to cart context
    addToCart(product);
  };

  // Handle quantity change
  const handleQuantityChange = (product, change) => {
    const currentQty = selectedProducts[product._id] || 0;
    const newQty = Math.max(0, currentQty + change);
    
    if (newQty === 0) {
      // Remove from selected products
      const newSelected = { ...selectedProducts };
      delete newSelected[product._id];
      setSelectedProducts(newSelected);
    } else {
      // Update quantity
      setSelectedProducts({
        ...selectedProducts,
        [product._id]: newQty
      });
    }
    
    // Update cart context
    updateQuantity(product._id, newQty);
  };

  // Handle cart item quantity change
  const handleCartQuantityChange = (productId, change) => {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      removeFromCart(productId);
      // Also update selectedProducts
      const newSelected = { ...selectedProducts };
      delete newSelected[productId];
      setSelectedProducts(newSelected);
    } else {
      updateQuantity(productId, newQuantity);
      // Also update selectedProducts
      setSelectedProducts({
        ...selectedProducts,
        [productId]: newQuantity
      });
    }
  };
  
  // Calculate change amount
  const calculateChange = () => {
    if (!paymentAmount) return 0;
    const change = parseFloat(paymentAmount) - totalAmount;
    return change > 0 ? change : 0;
  };

  // Handle checkout with better error handling
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setCheckoutError('Keranjang Anda kosong');
      return;
    }

    const currentPaymentAmount = totalAmount;

    try {
      setProcessing(true);
      setCheckoutError(null);
      setSuccess(false); // Reset success state before new attempt

      const transactionData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        paymentAmount: parseFloat(currentPaymentAmount),
        paymentMethod: 'cash'
      };

      const response = await api.createTransaction(transactionData);
      
      setSuccess(true);
      setTransactionId(response.data.data._id);
      clearCart();
      setSelectedProducts({});
      setPaymentAmount(''); 

      // Tidak ada navigasi otomatis lagi
      // setTimeout(() => {
      //   navigate(`/customer/transactions/${response.data.data._id}`);
      // }, 2000);

      // Pesan sukses akan ditampilkan di dashboard
      // Mungkin tambahkan auto-dismiss untuk pesan sukses setelah beberapa detik
      setTimeout(() => {
        setSuccess(false);
        setTransactionId(null);
      }, 5000); // Pesan sukses hilang setelah 5 detik

    } catch (err) {
      console.error('Checkout error details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memproses transaksi';
      setCheckoutError(errorMessage);
      setSuccess(false);
    } finally {
      setProcessing(false);
    }
  };

  // Render the appropriate icon component
  const renderIcon = (iconName) => {
    const IconComponent = iconComponents[iconName] || Package;
    return <IconComponent size={20} />;
  };

  // Get category color classes
  const getCategoryColorClasses = (iconName) => {
    return categoryColors[iconName] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Product card rendering
  const renderProductImage = (product) => {
    if (!product.image || product.image === 'no-image.jpg') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Package size={32} className="text-gray-400" />
        </div>
      );
    }

    return (
      <img 
        src={product.image}
        alt={product.name} 
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log('Image failed to load:', product.image);
          e.target.onerror = null;
          e.target.parentElement.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="text-gray-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>`;
        }}
      />
    );
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
        <button 
            onClick={fetchProducts}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Coba Lagi
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Middle content - products (scrollable) */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header with search - more minimalist */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center h-20 px-6">
            <h1 className="text-lg font-semibold text-gray-800">
              Selamat Datang, <span className="text-blue-600">{currentUser?.name || 'Pelanggan'}</span>
            </h1>
            <div className="w-64 relative ml-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Success message */}
          {success && transactionId && (
            <div className="fixed top-20 right-6 z-50 mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg shadow-lg max-w-sm">
              <div className="flex items-start">
                <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-md mb-1">Transaksi Berhasil!</h3>
                    <p className="text-sm">ID Transaksi: <Link to={`/customer/transactions/${transactionId}`} className="underline hover:text-green-800 font-medium">#{transactionId.substring(transactionId.length - 6).toUpperCase()}</Link></p>
                    <p className="text-xs mt-2 text-gray-600">Anda dapat melanjutkan berbelanja atau melihat detail transaksi.</p>
                </div>
                <button onClick={() => { setSuccess(false); setTransactionId(null); }} className="ml-auto -mt-1 -mr-1 text-green-500 hover:text-green-700">
                    <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Categories - enhanced with icons on top and colors similar to sidebar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Kategori</h2>
              <div className="text-xs text-gray-500">{categories.length} kategori</div>
            </div>
            <div className="flex overflow-x-auto pb-3 hide-scrollbar">
              {/* All category */}
              <div 
                onClick={() => setActiveCategory('all')}
                className={`flex-shrink-0 cursor-pointer mr-3 rounded-lg transition-colors flex flex-col items-center justify-center w-20 h-20 ${
                  activeCategory === 'all' 
                    ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Tags size={20} className="mb-1" />
                <span className="text-sm font-medium whitespace-nowrap">Semua</span>
              </div>
              
              {/* Category items with icons on top and colors */}
              {categories.map(category => {
                const categoryIcon = category.icon || 'Package';
                const IconComponent = iconComponents[categoryIcon] || Package;
                
                return (
                  <div 
                    key={category._id}
                    onClick={() => setActiveCategory(category._id)}
                    className={`flex-shrink-0 cursor-pointer mr-3 rounded-lg transition-colors flex flex-col items-center justify-center w-20 h-20 ${
                      activeCategory === category._id 
                        ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                        : `bg-white hover:bg-gray-50 border border-gray-200`
                    }`}
                  >
                    <IconComponent size={20} className="mb-1" />
                    <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Menu Tersedia</h2>
              <div className="text-xs text-gray-500">{filteredProducts.length} item</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow overflow-hidden">
                  <div className="h-48 bg-gray-100 relative">
                    {renderProductImage(product)}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 text-lg mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-blue-600 font-bold text-lg">
                        {formatToRupiah(product.price)}
                      </p>
                      <span className="text-sm text-gray-500">
                        Stok: {product.stock}
                      </span>
                    </div>
                    
                    {selectedProducts[product._id] ? (
                      <div className="flex items-center justify-between p-2 border border-blue-100 rounded-lg bg-blue-50">
                        <button 
                          onClick={() => handleQuantityChange(product, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-600 hover:bg-blue-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium text-blue-600">{selectedProducts[product._id]}</span>
                        <button 
                          onClick={() => handleQuantityChange(product, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-600 hover:bg-blue-100"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Tambahkan ke Keranjang
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">Tidak ada produk ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right sidebar - Cart summary (fixed) */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen">
        <div className="border-b border-gray-200 bg-white h-20 px-6 flex items-center">
          <div>
            <h2 className="text-lg font-semibold flex items-center text-gray-800">
              <ShoppingBasket size={20} className="mr-2 text-blue-600" />
              Ringkasan Pesanan
            </h2>
            <p className="text-gray-500 text-xs mt-1">Selesaikan pembelian Anda</p>
          </div>
        </div>

        {checkoutError && (
          <div className="m-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {checkoutError}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Keranjang Anda kosong</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<Package size={16} className="text-gray-400" />`;
                        }}
                      />
                    ) : (
                      <Package size={16} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-blue-600 text-sm font-medium">
                        {formatToRupiah(item.price)}
                      </p>
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCartQuantityChange(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="mx-2 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleCartQuantityChange(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  Kosongkan Keranjang
                </button>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatToRupiah(totalAmount)}</span>
            </div>
            {/* <div className="flex justify-between text-sm">
              <span className="text-gray-600">Diskon</span>
              <span className="font-medium">{formatToRupiah(0)}</span>
            </div> */}
            <div className="pt-2 border-t border-gray-200 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-blue-600">{formatToRupiah(totalAmount)}</span>
            </div>
          </div>

          {cartItems.length > 0 && (
            <>
              {/* <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Pembayaran
                </label>
                <input
                  type="number"
                  value={paymentAmount} // This state will still be used for the API call
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="0"
                  min={totalAmount} // Ensure paymentAmount is at least totalAmount for API
                />
                {parseFloat(paymentAmount) >= totalAmount && (
                  <div className="mt-1 text-right">
                    <span className="text-xs text-gray-600">Kembalian: </span>
                    <span className="font-medium text-sm">{formatToRupiah(calculateChange())}</span>
                  </div>
                )}
              </div> */}

              <button
                onClick={handleCheckout}
                // Disable button if processing, cart is empty, or paymentAmount is less than total (implicitly handled by not showing input)
                // We will set paymentAmount to totalAmount directly before calling handleCheckout or within handleCheckout
                disabled={processing || cartItems.length === 0}
                className={`w-full py-2.5 rounded-lg flex items-center justify-center ${ 
                  (processing || cartItems.length === 0)
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {processing ? 'Memproses...' : 'Bayar Sekarang'}
                {!processing && <ArrowRight size={18} className="ml-2" />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Add this CSS to hide scrollbar but allow scrolling
const style = document.createElement('style');
style.textContent = `
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
`;
document.head.appendChild(style);

export default CustomerDashboard; 