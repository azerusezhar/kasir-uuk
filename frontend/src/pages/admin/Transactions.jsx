import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { format, parseISO, subDays } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Eye,
  Briefcase,
  ArrowUpDown,
  Printer,
} from "lucide-react";
import { generateTransactionsReport } from "../../services/pdfService";

// Helper function to format currency (konsisten)
const formatToRupiah = (amount) => {
  if (typeof amount !== "number") {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [customerNameSearch, setCustomerNameSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState("transactionDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const calendarRef = useRef(null);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);

  const datePresets = [
    { label: "Hari Ini", start: new Date(), end: new Date() },
    {
      label: "7 Hari Terakhir",
      start: subDays(new Date(), 6),
      end: new Date(),
    },
    {
      label: "30 Hari Terakhir",
      start: subDays(new Date(), 29),
      end: new Date(),
    },
  ];

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: limit,
        sort: sortField,
        order: sortOrder,
        search: searchTerm.trim() === "" ? undefined : searchTerm.trim(),
        customerName:
          customerNameSearch.trim() === ""
            ? undefined
            : customerNameSearch.trim(),
      };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await api.getTransactions(params);
      setTransactions(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
      setTotalRecords(response.data.totalRecords || 0);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Gagal mengambil data transaksi.";
      setError(message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit,
    sortField,
    sortOrder,
    searchTerm,
    customerNameSearch,
    dateRange,
  ]);

  useEffect(() => {
    fetchTransactions();
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendarPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchTransactions]);

  const handleDateInputChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const applyDatePreset = (preset) => {
    setDateRange({
      startDate: format(preset.start, "yyyy-MM-dd"),
      endDate: format(preset.end, "yyyy-MM-dd"),
    });
    setShowCalendarPopup(false);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleCustomerNameSearchChange = (e) =>
    setCustomerNameSearch(e.target.value);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleSort = (field) => {
    const newSortOrder =
      field === sortField && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDateIndonesia = (dateString, fmt = "dd MMM yyyy, HH:mm") => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), fmt, { locale: localeID });
    } catch (error) {
      console.error("Format date error:", dateString, error);
      return "Tanggal tidak valid";
    }
  };

  const renderSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? "↑" : "↓";
    }
    return (
      <ArrowUpDown
        size={12}
        className="ml-1 opacity-40 group-hover:opacity-100"
      />
    );
  };

  const handleDownloadPDF = () => {
    try {
      generateTransactionsReport(transactions);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Tambahkan notifikasi error jika diperlukan
    }
  };

  if (loading && transactions.length === 0 && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-4 sm:p-6 print-area"
      id="laporan-transaksi-pdf"
    >
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; font-size: 10px; }
            .no-print { display: none !important; }
            .print-show { display: block !important; }
            .print-table th, .print-table td { color: black !important; border: 1px solid #ccc; padding: 4px 6px;}
            .print-table thead th { background-color: #f0f0f0 !important; }
            .print-header-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 5px; }
            .print-header-subtitle { font-size: 12px; text-align: center; margin-bottom: 15px; }
          }
        `}
      </style>

      <div className="print-header-title hidden print-show">
        Laporan Transaksi Penjualan
      </div>
      <div className="print-header-subtitle hidden print-show">
        Periode:{" "}
        {dateRange.startDate
          ? formatDateIndonesia(dateRange.startDate, "dd MMM yyyy")
          : "Semua"}{" "}
        -{" "}
        {dateRange.endDate
          ? formatDateIndonesia(dateRange.endDate, "dd MMM yyyy")
          : "Semua"}
        {searchTerm && `, Cari ID: ${searchTerm}`}
        {customerNameSearch && `, Nama Pelanggan: ${customerNameSearch}`}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 no-print">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center mb-3 sm:mb-0">
          <Briefcase size={30} className="mr-3 text-purple-600" />
          Manajemen Transaksi Penjualan
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center text-sm"
          >
            <Printer size={18} className="mr-2" /> Download PDF
          </button>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-md shadow no-print"
          role="alert"
        >
          <div className="flex">
            <div className="py-1">
              <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
            </div>
            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col">
            <label
              htmlFor="dateRangePicker"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Periode Transaksi
            </label>
            <div className="relative" ref={calendarRef}>
              <button
                onClick={() => setShowCalendarPopup(!showCalendarPopup)}
                className="w-full flex items-center justify-between pl-3 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <CalendarIcon size={16} className="mr-2 text-gray-400" />
                <span className="flex-1 text-left">
                  {dateRange.startDate && dateRange.endDate
                    ? `${format(parseISO(dateRange.startDate), "dd MMM yy", {
                        locale: localeID,
                      })} - ${format(parseISO(dateRange.endDate), "dd MMM yy", {
                        locale: localeID,
                      })}`
                    : "Pilih Tanggal"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showCalendarPopup ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {showCalendarPopup && (
                <div className="absolute z-20 mt-1 w-full md:w-96 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {datePresets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyDatePreset(preset)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      handleApplyFilters();
                      setShowCalendarPopup(false);
                    }}
                    className="w-full bg-blue-500 text-white py-2 rounded-md text-sm"
                  >
                    Terapkan Tanggal
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="searchId"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              ID Transaksi
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="searchId"
                type="text"
                placeholder="Ketik ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="searchCustomer"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Nama Pelanggan
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="searchCustomer"
                type="text"
                placeholder="Ketik nama..."
                value={customerNameSearch}
                onChange={handleCustomerNameSearchChange}
                className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="lg:col-start-4">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-6 rounded-md text-sm font-medium flex items-center justify-center"
            >
              <Search size={16} className="mr-2" /> Cari Transaksi
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200 print-table">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pesanan
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort("transactionDate")}
              >
                <div className="flex items-center">
                  Waktu {renderSortIcon("transactionDate")}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pelanggan
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort("totalAmount")}
              >
                <div className="flex items-center justify-end">
                  Nominal {renderSortIcon("totalAmount")}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading && transactions.length === 0 && currentPage > 1 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2">Memuat halaman berikutnya...</p>
                </td>
              </tr>
            ) : !loading && transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  <p className="text-lg font-medium mb-1">
                    Data transaksi tidak ditemukan.
                  </p>
                  <p className="text-sm">
                    Sesuaikan filter atau tunggu transaksi baru masuk.
                  </p>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                    <Link
                      to={`/admin/transactions/${transaction._id}`}
                      className="hover:text-purple-600 font-semibold"
                    >
                      #
                      {transaction._id
                        .substring(transaction._id.length - 7)
                        .toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDateIndonesia(
                      transaction.transactionDate,
                      "dd MMM yyyy, HH:mm"
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {transaction.customer?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">
                    {formatToRupiah(transaction.totalAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium no-print">
                    <Link
                      to={`/admin/transactions/${transaction._id}`}
                      className="text-purple-600 hover:text-purple-700 inline-flex items-center py-1 px-3 rounded-md hover:bg-purple-50 text-xs border border-purple-200 hover:border-purple-300 transition-all duration-150"
                      title="Lihat Detail"
                    >
                      <Eye size={14} className="mr-1.5" /> Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && !loading && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 no-print">
          <div className="mb-2 sm:mb-0">
            Menampilkan{" "}
            <span className="font-medium">{(currentPage - 1) * limit + 1}</span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(currentPage * limit, totalRecords)}
            </span>{" "}
            dari <span className="font-medium">{totalRecords}</span> transaksi
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" /> Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) =>
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 &&
                  pageNumber <= currentPage + 1) ||
                totalPages <= 5 ||
                (currentPage <= 3 && pageNumber <= 3) ||
                (currentPage >= totalPages - 2 &&
                  pageNumber >= totalPages - 2) ? (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-8 h-8 border rounded-md hover:bg-gray-50 ${
                      currentPage === pageNumber
                        ? "bg-purple-500 text-white border-purple-500"
                        : "border-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ) : (pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2) &&
                  totalPages > 5 ? (
                  <span key={pageNumber} className="px-1.5 py-1.5">
                    ...
                  </span>
                ) : null
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              Selanjutnya <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTransactions;
