import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

function ProfileComponent() {
  const { currentUser, isStaff } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    address: currentUser?.address || '',
    birthDate: currentUser?.birthDate || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      try {
      
      setMessage({ 
        type: 'success', 
        text: 'Profil berhasil diperbarui!' 
      });
      setIsEditing(false);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Gagal memperbarui profil. Silakan coba lagi.' 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Profil Pengguna</h2>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        } flex items-center`}>
          {message.type === 'success' ? (
            <CheckCircle size={18} className="mr-2" />
          ) : (
            <AlertCircle size={18} className="mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-blue-500" />
            )}
          </div>
        </div>
        <p className="text-center mt-2 text-lg font-medium text-gray-800">
          {currentUser?.name || currentUser?.email}
        </p>
        <p className="text-center text-sm text-gray-500">
          {isStaff() ? 'Admin' : 'Pelanggan'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Name Field */}
          <div className="flex flex-col">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="mr-2 text-blue-500" />
              Nama Lengkap
            </label>
            <p className="text-gray-800 py-2">{formData.name || '-'}</p>
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} className="mr-2 text-blue-500" />
              Email
            </label>
            <p className="text-gray-800 py-2">{formData.email || '-'}</p>
          </div>

          {/* Phone Field */}
          <div className="flex flex-col">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} className="mr-2 text-blue-500" />
              Nomor Telepon
            </label>
            <p className="text-gray-800 py-2">{formData.phoneNumber || '-'}</p>
          </div>

          {/* Address Field */}
          <div className="flex flex-col">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="mr-2 text-blue-500" />
              Alamat
            </label>
            <p className="text-gray-800 py-2">{formData.address || '-'}</p>
          </div>

          {/* Birth Date Field */}
          <div className="flex flex-col">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="mr-2 text-blue-500" />
              Tanggal Lahir
            </label>
            <p className="text-gray-800 py-2">{formData.birthDate || '-'}</p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProfileComponent; 