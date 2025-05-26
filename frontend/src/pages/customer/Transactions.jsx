import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye, Calendar as CalendarIcon, AlertCircle, ListChecks } from 'lucide-react';

// Helper function to format currency to Rupiah
const formatToRupiah = (amount) => {
  if (typeof amount !== 'number') {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

function CustomerTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10); // Items per page

  // Sorting
  const [sortField, setSortField] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: limit,
        sort: sortField,
        order: sortOrder,
        search: searchTerm.trim() === '' ? undefined : searchTerm.trim(),
      };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      const response = await api.getTransactions(params);
      setTransactions(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
      setTotalRecords(response.data.totalRecords || 0);

    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Gagal mengambil data transaksi.';
      setError(message);
      console.error('Failed to fetch transactions:', err);
      setTransactions([]); // Clear transactions on error
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, sortField, sortOrder, searchTerm, dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTransactions(); // Ini akan dipanggil oleh useEffect karena state filter berubah, tapi panggil manual untuk kepastian jika ada perubahan state yg tidak langsung trigger useEffect
  }

  const handleSort = (field) => {
    const newSortOrder = (field === sortField && sortOrder === 'desc') ? 'asc' : 'desc';
    setSortField(field);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const formatDateIndonesia = (dateString, fmt = 'dd MMM yyyy, HH:mm') => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), fmt, { locale: localeID });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Tanggal tidak valid';
    }
  };

  const renderSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? '↑' : '↓';
    }
    return <ArrowUpDown size={12} className="ml-1 opacity-40 group-hover:opacity-100" />;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
          Transaksi Anda
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
          <div className="flex">
            <div className="py-1"><AlertCircle className="h-6 w-6 text-red-400 mr-3" /></div>
            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Date Range */}
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-600 mb-1">Periode Transaksi</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <span className="text-gray-500">-</span>
              <div className="relative flex-1">
                 <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col">
            <label htmlFor="search" className="text-sm font-medium text-gray-600 mb-1">Lacak Transaksi (ID)</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Ketik ID transaksi..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
        </div>
         <button 
            onClick={handleApplyFilters}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-md text-sm font-medium flex items-center justify-center"
          >
            <Search size={16} className="mr-2"/> Tampilkan Transaksi
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pesanan
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('transactionDate')}
              >
                <div className="flex items-center">Waktu Transaksi {renderSortIcon('transactionDate')}</div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('totalAmount')}
              >
                <div className="flex items-center justify-end">Nominal {renderSortIcon('totalAmount')}</div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rincian
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2">Mencari jejak transaksi Anda...</p>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                  <p className="text-lg font-medium mb-1">Belum ada jejak transaksi</p>
                  <p className="text-sm">Semua transaksi yang Anda lakukan akan muncul di sini.</p>
                </td>
              </tr>
            ) : (
              transactions.map(transaction => (
                <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                    <Link to={`/customer/transactions/${transaction._id}`} className="hover:text-indigo-600 font-semibold">
                      #{transaction._id.substring(transaction._id.length - 7).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDateIndonesia(transaction.transactionDate, 'EEE, dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">
                    {formatToRupiah(transaction.totalAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <Link 
                      to={`/customer/transactions/${transaction._id}`}
                      className="text-indigo-600 hover:text-indigo-700 inline-flex items-center py-1 px-3 rounded-md hover:bg-indigo-50 text-xs border border-indigo-200 hover:border-indigo-300 transition-all duration-150"
                      title="Lihat Rincian"
                    >
                      <Eye size={14} className="mr-1.5" /> Lihat Rincian
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > 0 && !loading && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
          <div className="mb-2 sm:mb-0">
            Menampilkan <span className="font-medium">{(currentPage - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(currentPage * limit, totalRecords)}</span> dari <span className="font-medium">{totalRecords}</span> transaksi
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" /> Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                 (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage -1 && pageNumber <= currentPage + 1) || (totalPages <= 5) || (currentPage <=3 && pageNumber <=3) || (currentPage >= totalPages -2 && pageNumber >= totalPages-2)  ) ? (
                <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-8 h-8 border rounded-md hover:bg-gray-50 ${
                    currentPage === pageNumber ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'
                    }`}
                >
                    {pageNumber}
                </button>
                 ) : (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) && totalPages > 5 ? (
                    <span key={pageNumber} className="px-1.5 py-1.5">...</span>
                 ) : null
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Selanjutnya <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerTransactions; 