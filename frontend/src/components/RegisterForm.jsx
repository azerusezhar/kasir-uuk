import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LogIn,
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [useDirectFetch, setUseDirectFetch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    // Check if required fields are filled
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.address ||
      !formData.phoneNumber
    ) {
      toast.error("Nama, email, kata sandi, alamat, dan nomor telepon diperlukan");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Silakan masukkan alamat email yang valid");
      return false;
    }

    // Check password length
    if (formData.password.length < 6) {
      toast.error("Kata sandi harus minimal 6 karakter");
      return false;
    }

    // Validate phone number (optional but if provided, validate format)
    if (
      !/^[0-9+\-\s()]{6,20}$/.test(formData.phoneNumber)
    ) {
      toast.error("Silakan masukkan nomor telepon yang valid");
      return false;
    }

    return true;
  };

  // Direct fetch implementation as a fallback
  const registerWithFetch = async (customerData) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data,
          },
        };
      }

      return { data };
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const customerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
      };

      console.log("Sending registration data:", customerData);

      try {
        let response;

        if (useDirectFetch) {
          // Use direct fetch if axios failed previously
          response = await registerWithFetch(customerData);
        } else {
          // Try with axios first
          response = await api.registerCustomer(customerData);
        }

        console.log("Registration successful:", response.data);

        // Show success message
        setSuccess(true);
        toast.success("Pendaftaran berhasil! Mengalihkan ke halaman masuk...");

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          address: "",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (apiError) {
        console.error("API Error:", apiError);

        if (apiError.response) {
          console.error("Response data:", apiError.response.data);
          console.error("Response status:", apiError.response.status);
          console.error("Response headers:", apiError.response.headers);

          // Extract error message from array if it exists
          if (apiError.response.data && apiError.response.data.error) {
            if (Array.isArray(apiError.response.data.error)) {
              // Join all error messages if it's an array
              toast.error(apiError.response.data.error.join(", "));
            } else {
              // Use the error message directly
              toast.error(apiError.response.data.error);
            }
          } else {
            // Fallback error message
            toast.error(
              apiError.response.data?.message ||
                `Pendaftaran gagal dengan status ${apiError.response.status}`
            );
          }

          // If axios failed, try with fetch next time
          if (!useDirectFetch) {
            setUseDirectFetch(true);
            toast.info("Mencoba metode alternatif...");
          }
        } else if (apiError.request) {
          console.error(
            "Request was made but no response received:",
            apiError.request
          );
          toast.error("Tidak ada respons dari server. Silakan coba lagi nanti.");
        } else {
          console.error("Error setting up request:", apiError.message);
          toast.error("Kesalahan penyiapan permintaan: " + apiError.message);
        }
      }
    } catch (err) {
      console.error("General error:", err);
      toast.error(
        "Terjadi kesalahan yang tidak terduga: " +
          (err.message || "Kesalahan tidak diketahui")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-gray-100">
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
      />
      <div className="w-full flex">
        {/* Left column - Registration form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center mb-8">
              {/* <UserPlus className="h-8 w-8 text-blue-600" /> */}
              <h2 className="text-2xl font-bold text-gray-900">
                Kasir UUK
              </h2>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun</h1>
            <p className="text-gray-600 mb-8">
              Daftar sebagai pelanggan untuk mulai berbelanja
            </p>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
                <p className="font-medium flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Berhasil!
                </p>
                <p className="text-sm">
                  Pendaftaran berhasil! Mengalihkan ke halaman masuk...
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(100vh-240px)]"
            >
              <div className="space-y-4 mb-6">
                {/* Name and Phone fields side by side */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Name field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Budi Santoso"
                      />
                    </div>
                  </div>

                  {/* Phone number field */}
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>
                </div>

                {/* Email field */}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
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
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="budi@contoh.com"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Address field */}
                <div className="mb-4">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alamat
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows="1"
                      value={formData.address}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan alamat lengkap Anda"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Membuat akun...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Buat Akun Pelanggan
                  </span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Sudah Punya Akun?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                <span className="inline-flex items-center">
                  <LogIn className="h-4 w-4 mr-1" />
                  Masuk
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Right column - App info */}
        <div className="hidden md:block md:w-1/2 bg-blue-600">
          <div className="h-full flex flex-col justify-center p-12">
            <h2 className="text-3xl font-bold mb-6 text-white">
              Bergabunglah dengan komunitas pelanggan kami
            </h2>
            <p className="mb-8 text-white">
              Daftar untuk menikmati pengalaman berbelanja yang lancar, akses
              riwayat pesanan, dan kelola profil Anda.
            </p>

            <div className="bg-blue-700 rounded-lg p-6 my-8">
              <h3 className="text-xl font-medium mb-3 text-white">
                Keuntungan membuat akun:
              </h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-200 mr-2 mt-0.5" />
                  <span>Lacak status dan riwayat pesanan Anda</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-200 mr-2 mt-0.5" />
                  <span>
                    Checkout cepat dengan informasi pengiriman tersimpan
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-200 mr-2 mt-0.5" />
                  <span>Akses ke promosi dan penawaran khusus</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-200 mr-2 mt-0.5" />
                  <span>Kelola informasi pribadi Anda dengan aman</span>
                </li>
              </ul>
            </div>

            <div className="mt-12 bg-blue-500/50 p-4 rounded-lg">
              <div className="flex items-center">
                <HelpCircle className="h-8 w-8 text-blue-100" />
                <p className="ml-3 text-sm text-blue-100">
                  Butuh bantuan? Hubungi tim dukungan kami di
                  support@kasiruuk.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
