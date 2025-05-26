import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api'; // Gunakan instance API kita
import { format, parseISO } from 'date-fns';
import { ArrowLeft, ShoppingCart, Calendar, DollarSign, Package, AlertCircle, CheckCircle, XCircle, RefreshCw, Printer, User } from 'lucide-react';
import { generateTransactionPDF } from '../../services/pdfService';
import { formatToRupiah, formatDate } from '../../utils/formatters';

function CustomerTransactionDetail() {
  const { id } = useParams();
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionDetail();
  }, [id]);

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTransaction(id); // Menggunakan api.js
      setTransactionData(response.data.data); // API kita membungkus data dalam 'data'
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Gagal mengambil detail transaksi.';
      setError(message);
      console.error('Error fetching transaction detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusText = {
      completed: "Selesai",
      pending: "Tertunda",
      cancelled: "Dibatalkan",
      refunded: "Dikembalikan"
    };
    const badgeClasses = {
      completed: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      refunded: "bg-purple-100 text-purple-700 border-purple-200"
    };
    const Icon = {
      completed: CheckCircle,
      pending: RefreshCw,
      cancelled: XCircle,
      refunded: RefreshCw
    }[status] || Package;

    return {
      text: statusText[status] || status.charAt(0).toUpperCase() + status.slice(1),
      className: `${badgeClasses[status] || "bg-gray-100 text-gray-600 border-gray-200"} px-3 py-1.5 inline-flex items-center text-sm leading-5 font-semibold rounded-lg border`,
      Icon: Icon
    };
  };

  const handleDownloadPDF = () => {
    try {
      generateTransactionPDF(transactionData.transaction, transactionData.details);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Tambahkan notifikasi error jika diperlukan
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return (
      <div className="w-full p-4 sm:p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-md max-w-xl mx-auto">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Gagal Memuat Transaksi</h2>
            <p className="mb-4">{error}</p>
            <button 
              onClick={fetchTransactionDetail}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
        </div>
      </div>
    );
  }

  if (!transactionData || !transactionData.transaction) {
    return <div className="w-full p-4 sm:p-6 text-center py-10">Transaksi tidak ditemukan.</div>;
  }

  const { transaction, details: items } = transactionData;
  const statusInfo = getStatusInfo(transaction.status);

  return (
    <div className="w-full p-4 sm:p-6 print-container" id="invoice-pdf-customer">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
            .print-invoice-header {
                display: block !important; /* Pastikan header invoice muncul saat print */
                text-align: center;
                margin-bottom: 20px;
            }
            .print-invoice-header h1 {
                font-size: 24px;
                color: black;
            }
            .print-invoice-header p {
                font-size: 12px;
                color: gray;
            }
            .print-table td, .print-table th {
                color: black !important;
            }
          }
        `}
      </style>
      <div className="print-invoice-header hidden">
        <h1>Invoice Transaksi</h1>
        <p>ID Transaksi: {transaction._id}</p>
      </div>

      <div className="flex justify-between items-center mb-6 no-print max-w-5xl mx-auto">
        <Link 
          to="/customer/transactions" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 group text-sm">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Transaksi
        </Link>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm"
        >
          <Printer size={16} className="mr-2" /> Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-w-5xl mx-auto">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-0">Detail Transaksi</h1>
              <p className="text-sm text-gray-500">ID: #{transaction._id.substring(transaction._id.length-7).toUpperCase()}</p>
            </div>
            <div className={`${statusInfo.className} no-print`}>
              <statusInfo.Icon size={16} className="mr-2" />
              {statusInfo.text}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <div className="flex items-start">
            <Calendar size={18} className="mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Tanggal Transaksi</p>
              <p className="font-medium text-gray-700 text-base">{formatDate(transaction.transactionDate)}</p>
            </div>
          </div>
          <div className="flex items-start">
            <User size={18} className="mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Pelanggan</p>
              <p className="font-medium text-gray-700 text-base">{transaction.customer?.name || 'Tidak diketahui'}</p>
              {transaction.customer?.phoneNumber && <p className="text-xs text-gray-500">{transaction.customer.phoneNumber}</p>}
            </div>
          </div>
          {transaction.paymentAmount !== undefined && transaction.totalAmount <= transaction.paymentAmount && (
            <div className="flex items-start">
              <DollarSign size={18} className="mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-500">Jumlah Dibayar</p>
                <p className="font-medium text-gray-700 text-base">{formatToRupiah(transaction.paymentAmount)}</p>
              </div>
            </div>
          )}
          {transaction.changeAmount > 0 && (
            <div className="flex items-start">
              <DollarSign size={18} className="mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-500">Kembalian</p>
                <p className="font-medium text-gray-700 text-base">{formatToRupiah(transaction.changeAmount)}</p>
              </div>
            </div>
          )}
          <div className="flex items-start md:col-span-2">
            <DollarSign size={18} className="mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Total Pembayaran</p>
              <p className="font-bold text-xl text-blue-600">{formatToRupiah(transaction.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 print-table">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <ShoppingCart size={20} className="mr-2 text-gray-500"/>
            Item yang Dibeli
          </h2>
          {items && items.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item._id || item.product?._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 mr-4 flex-shrink-0 no-print">
                      {item.product?.image && item.product.image !== 'no-image.jpg' ? (
                        <img 
                          src={item.product.image.startsWith('http') ? item.product.image : `${import.meta.env.VITE_API_URL}/${item.product.image.replace(/^\/+/, '')}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md border border-gray-200 bg-gray-50"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      )
                      : null}
                      <div 
                        className={`absolute inset-0 w-full h-full rounded-md border border-gray-200 bg-gray-100 items-center justify-center ${item.product?.image && item.product.image !== 'no-image.jpg' ? 'hidden' : 'flex' }`}
                      >
                        <Package size={20} className="text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.product?.name || 'Nama produk tidak tersedia'}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {formatToRupiah(item.priceAtTransaction !== undefined ? item.priceAtTransaction : (item.subtotal / item.quantity))}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">{formatToRupiah(item.subtotal)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Tidak ada item dalam transaksi ini.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerTransactionDetail;