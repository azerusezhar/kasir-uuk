import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Package, ShoppingBag, Coffee, Utensils, Shirt, Home, Laptop, Smartphone, Book, Gift, Music, Car, Heart, Camera, CheckSquare, Square } from 'lucide-react';
import { api } from '../../services/api';

// Icon mapping object
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
  Camera: Camera
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ 
    name: '', 
    description: '', 
    icon: 'Package',
    isActive: true 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setCurrentCategory({ 
      name: '', 
      description: '', 
      icon: 'Package',
      isActive: true 
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setCurrentCategory({
      id: category._id,
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'Package',
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await api.deleteCategory(id);
        fetchCategories(); // Refresh the list after deletion
      } catch (err) {
        setError('Failed to delete category');
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await api.updateCategory(category._id, {
        ...category,
        isActive: !category.isActive
      });
      fetchCategories(); // Refresh the list after updating
    } catch (err) {
      setError('Failed to update category status');
      console.error('Error updating category status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // Update existing category
        await api.updateCategory(currentCategory.id, {
          name: currentCategory.name,
          description: currentCategory.description,
          icon: currentCategory.icon,
          isActive: currentCategory.isActive
        });
      } else {
        // Add new category
        await api.createCategory({
          name: currentCategory.name,
          description: currentCategory.description,
          icon: currentCategory.icon,
          isActive: currentCategory.isActive
        });
      }
      
      fetchCategories(); // Refresh the list after adding/updating
      setShowModal(false);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} category`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} category:`, err);
    }
  };

  // Render the appropriate icon component
  const renderIcon = (iconName) => {
    const IconComponent = iconComponents[iconName] || Package;
    return <IconComponent size={18} />;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategori Produk</h1>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Tambah Kategori
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari kategori..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        /* Categories Table */
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className={`hover:bg-gray-50 ${!category.isActive ? 'bg-gray-50 text-gray-400' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {renderIcon(category.icon)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{category.productCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleToggleActive(category)}
                      className="flex items-center"
                    >
                      {category.isActive ? 
                        <CheckSquare size={18} className="text-green-600" /> : 
                        <Square size={18} className="text-gray-400" />
                      }
                      <span className={`ml-2 ${category.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {category.isActive ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada kategori yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {Object.keys(iconComponents).map((iconName) => {
                    const IconComp = iconComponents[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentCategory.icon === iconName
                            ? 'bg-blue-100 text-blue-600 border border-blue-300'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentCategory({...currentCategory, icon: iconName})}
                      >
                        <IconComp size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <div className="mr-2">
                    {currentCategory.isActive ? 
                      <CheckSquare size={20} className="text-blue-600" /> : 
                      <Square size={20} className="text-gray-400" />
                    }
                  </div>
                  <span className="text-sm font-medium text-gray-700" onClick={() => 
                    setCurrentCategory({...currentCategory, isActive: !currentCategory.isActive})
                  }>
                    Kategori Aktif
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
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
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories; 