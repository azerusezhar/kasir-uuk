import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Image, Package } from 'lucide-react';
import { api } from '../../services/api';
import { formatToRupiah } from '../../utils/formatters';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image: 'no-image.jpg'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // API base URL for images
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      // Only show active categories
      const activeCategories = response.data.data.filter(cat => cat.isActive);
      setCategories(activeCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter ? product.category._id === categoryFilter : true;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddNew = () => {
    setCurrentProduct({
      name: '',
      description: '',
      category: categories.length > 0 ? categories[0]._id : '',
      image: 'no-image.jpg'
    });
    setIsEditing(false);
    setShowModal(true);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleEdit = (product) => {
    setCurrentProduct({
      id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category._id,
      image: product.image
    });
    setIsEditing(true);
    setShowModal(true);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.deleteProduct(id);
        fetchProducts(); // Refresh the list after deletion
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let productId;
      
      if (isEditing) {
        // Update existing product
        const response = await api.updateProduct(currentProduct.id, {
          name: currentProduct.name,
          description: currentProduct.description,
          price: currentProduct.price,
          stock: currentProduct.stock,
          category: currentProduct.category
        });
        productId = response.data.data._id;
      } else {
        // Add new product
        const response = await api.createProduct({
          name: currentProduct.name,
          description: currentProduct.description,
          price: currentProduct.price,
          stock: currentProduct.stock,
          category: currentProduct.category
        });
        productId = response.data.data._id;
      }
      
      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await api.uploadProductImage(productId, formData);
      }
      
      fetchProducts();  
      setShowModal(false);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} product`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} product:`, err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Produk</h1>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Tambah Produk
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari produk..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        /* Products Table */
        <div className="bg-white rounded-md shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      {product.image && product.image !== 'no-image.jpg' ? (
                        <img 
                          src={`${apiBaseUrl}/uploads/${product.image}`} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      ) : (
                        <Package size={24} className="text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category?.name || 'Tidak ada kategori'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatToRupiah(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada produk yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit Product */}
      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
                <div className="flex items-center space-x-4">
                  <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : currentProduct.image && currentProduct.image !== 'no-image.jpg' ? (
                      <img 
                        src={`${apiBaseUrl}/uploads/${currentProduct.image}`} 
                        alt="Current" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Image size={18} className="mr-2" />
                      <span>Pilih Gambar</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {imageFile ? imageFile.name : 'JPG, PNG atau GIF (Maks. 2MB)'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentProduct.name}
                    onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentProduct.category}
                    onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
                    required
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentProduct.stock}
                    onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products; 