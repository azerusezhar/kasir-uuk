import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  ChevronDown,
  ShoppingCart,
  Eye,
} from "lucide-react"; // Lucide icons
import { formatToRupiah, formatDate } from "../../utils/formatters";

// Custom Tooltip Bahasa Indonesia
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl shadow-lg bg-white/90 border border-blue-100 px-5 py-3 min-w-[220px] animate-fade-in">
        <div className="font-semibold text-blue-700 text-base mb-1 flex items-center gap-2">
          <svg width="18" height="18" fill="none">
            <circle cx="9" cy="9" r="9" fill="#3B82F6" />
          </svg>
          {label}
        </div>
        <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
          <svg width="16" height="16" fill="none">
            <rect width="16" height="16" rx="4" fill="#3B82F6" />
          </svg>
          <span className="font-medium">Pemasukan:</span>
          <span className="font-bold text-blue-700">
            {formatToRupiah(payload[0]?.value || 0)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <svg width="16" height="16" fill="none">
            <circle cx="8" cy="8" r="8" fill="#F59E42" />
          </svg>
          <span className="font-medium">Transaksi:</span>
          <span className="font-bold text-orange-500">
            {payload[1]?.value || 0}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [stats, setStats] = useState({
    income: 0,
    outcome: 0,
    totalProducts: 0,
    totalSalesToday: 0,
    recentTransactions: [],
    productBestSellers: [],
    categories: [],
    totalSales: 0,
  });
  const [salesChartData, setSalesChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesOverviewFilter, setSalesOverviewFilter] = useState("Mingguan");

  useEffect(() => {
    fetchDashboardData();
  }, [salesOverviewFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data
      const [
        statsResponse,
        salesChartResponse,
        transactionsResponse,
        categoriesResponse,
        bestSellersResponse,
        productsResponse,
      ] = await Promise.all([
        api.getDashboardStats(),
        api.getSalesChartData({ period: salesOverviewFilter.toLowerCase() }),
        api.getTransactions({
          limit: 4,
          sort_by: "created_at",
          sort_order: "desc",
        }),
        api.getCategories(),
        api.getBestSellerProducts(),
        api.getProducts(),
      ]);

      const fetchedStats = statsResponse.data.data || statsResponse.data;
      const fetchedTransactions =
        transactionsResponse.data.data ||
        transactionsResponse.data.transactions ||
        [];
      const totalSales = transactionsResponse.data.totalRecords || 0;
      const fetchedCategories =
        categoriesResponse.data.data ||
        categoriesResponse.data.categories ||
        [];
      const fetchedProducts =
        productsResponse.data.data || productsResponse.data.products || [];
      const fetchedSalesChart =
        salesChartResponse.data.data || salesChartResponse.data.chartData || [];

      // product best sellers
      const bestSellers = (bestSellersResponse.data.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        type: p.category?.name || "",
        sold: p.sold || 0,
        revenue: p.price * (p.sold || 0),
        image:
          p.image && p.image !== "no-image.jpg"
            ? `${import.meta.env.VITE_API_URL}/uploads/${p.image}`
            : `https://via.placeholder.com/40?text=${p.name?.charAt(0)}`,
      }));

      setStats({
        income: fetchedStats.totalRevenue || 0,
        outcome: fetchedStats.outcome || 0,
        totalProducts: fetchedProducts.length || 0,
        totalSalesToday:
          fetchedStats.total_sales_today || fetchedStats.totalSalesToday || 0,
        recentTransactions: fetchedTransactions
          .map((t) => ({
            id: t._id || t.id,
            transactionDate: t.transactionDate || t.created_at,
            customerName: t.customer?.name || "",
            totalAmount: t.totalAmount || t.total_amount || 0,
          }))
          .slice(0, 5),
        productBestSellers: bestSellers,
        categories: fetchedCategories.map((c) => ({
          id: c.id,
          name: c.name,
          productCount: c.products_count || c.productCount || 0,
        })),
        totalSales,
      });

      // Mapping ulang data chart
      let chartData = [];
      if (
        fetchedSalesChart &&
        fetchedSalesChart.labels &&
        fetchedSalesChart.datasets
      ) {
        chartData = fetchedSalesChart.labels.map((label, idx) => ({
          date: label,
          pendapatan: fetchedSalesChart.datasets[0]?.data[idx] || 0,
          transaksi: fetchedSalesChart.datasets[1]?.data[idx] || 0,
        }));
      }
      setSalesChartData(
        chartData.length > 0
          ? chartData
          : [{ date: "-", pendapatan: 0, transaksi: 0 }]
      );
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch dashboard data. Displaying limited data."
      );
      setStats({
        income: 0,
        outcome: 0,
        totalProducts: 0,
        totalSalesToday: 0,
        recentTransactions: [],
        productBestSellers: [],
        categories: [],
        totalSales: 0,
      });
      setSalesChartData([{ date: "-", pendapatan: 0, transaksi: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-gray-100 min-h-screen p-4 md:p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-150"
        >
          Retry Fetching Data
        </button>
      </div>
    );
  }

  // Hitung total pemasukan dan total penjualan dari data chart yang sedang tampil
  const totalPendapatanChart = salesChartData.reduce(
    (sum, d) => sum + (d.pendapatan || 0),
    0
  );
  const totalTransaksiChart = salesChartData.reduce(
    (sum, d) => sum + (d.transaksi || 0),
    0
  );

  return (
    <>
      <header className="mb-2 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dasbor Admin
          </h1>
          <div className="flex items-center space-x-2">
            {/* Placeholder for user profile/actions */}
            <span className="text-sm text-gray-600">
              Selamat datang, Admin!
            </span>
            {/* Anda dapat menambahkan avatar pengguna atau tombol logout di sini */}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan performa dan aktivitas bisnis Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Stats Cards */}
          <div className="flex flex-wrap gap-4 md:gap-6 mb-2">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-3 min-w-[180px] flex-1">
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pemasukan</p>
                <p className="text-xl font-bold text-gray-800 break-words">
                  {formatToRupiah(stats.income)}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-3 min-w-[180px] flex-1">
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowDownLeft className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jumlah Transaksi</p>
                <p className="text-xl font-bold text-gray-800 break-words">
                  {stats.totalSales}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-3 min-w-[180px] flex-1">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jumlah Produk</p>
                <p className="text-xl font-bold text-gray-800 break-words">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          {/* Sales Overview Chart */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Ringkasan Penjualan
                </h2>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2 min-w-[140px]">
                    <ArrowUpRight className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-xs text-blue-700 font-semibold">
                        Total Pemasukan
                      </div>
                      <div className="text-base font-bold text-blue-700">
                        {formatToRupiah(totalPendapatanChart)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg px-3 py-2 flex items-center gap-2 min-w-[140px]">
                    <ArrowDownLeft className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-xs text-orange-600 font-semibold">
                        Total Transaksi
                      </div>
                      <div className="text-base font-bold text-orange-600">
                        {totalTransaksiChart}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <div className="relative">
                  <select
                    value={salesOverviewFilter}
                    onChange={(e) => setSalesOverviewFilter(e.target.value)}
                    className="appearance-none text-sm text-gray-700 border border-gray-300 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Mingguan">Mingguan</option>
                    <option value="Bulanan">Bulanan</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: 272,
                background: "#fff",
                borderRadius: 14,
                padding: "0 18px",
              }}
            >
              <div className="flex justify-between items-center px-2 pt-2 pb-1">
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontWeight: 500,
                    fontSize: 12,
                    marginBottom: 0,
                    padding: 0,
                  }}
                />
              </div>
              <ResponsiveContainer>
                <BarChart
                  data={salesChartData}
                  margin={{ top: 18, right: 32, left: 32, bottom: 8 }}
                  barGap={10}
                  barCategoryGap={30}
                >
                  <CartesianGrid
                    strokeDasharray="3 0"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontWeight: 500, fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatToRupiah}
                    tick={{ fontWeight: 500, fill: "#3B82F6", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontWeight: 500, fill: "#f59e42", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    yAxisId="left"
                    dataKey="pendapatan"
                    name="Pemasukan"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    barSize={16}
                    animationDuration={700}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="transaksi"
                    name="Transaksi"
                    fill="#F59E42"
                    radius={[4, 4, 0, 0]}
                    barSize={16}
                    animationDuration={700}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar area */}
        <div className="lg:col-span-1 space-y-6">
          {/* Product Best Seller */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Produk Terlaris
              </h2>
            </div>
            <div className="space-y-4">
              {stats.productBestSellers.slice(0, 2).map((product, index) => (
                <div
                  key={product.id}
                  className={`relative p-4 rounded-xl flex items-center space-x-4 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out ${
                    index === 0
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white transform hover:scale-105"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {/* Badge */}
                  {index < 2 && (
                    <div
                      className={`absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white ${
                        index === 0
                          ? "bg-yellow-400 text-white"
                          : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {index === 0 ? "👑" : index + 1}
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name || "Product"}
                    className="w-14 h-14 rounded-lg object-cover shadow-md ml-1"
                  />
                  <div className="flex-grow">
                    <p
                      className={`font-semibold text-base ${
                        index === 0 ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {product.name || "Unknown Product"}
                    </p>
                    <p
                      className={`text-xs ${
                        index === 0 ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {product.description || ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-bold text-sm ${
                        index === 0 ? "text-yellow-300" : "text-blue-600"
                      }`}
                    >
                      {formatToRupiah(product.revenue || 0)}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        index === 0 ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {product.sold || 0} Terjual
                    </p>
                  </div>
                </div>
              ))}
              {stats.productBestSellers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Tidak ada produk terlaris untuk ditampilkan.
                </p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Kategori Teratas
              </h2>
              <Link
                to="/admin/categories"
                className="text-sm text-blue-600 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-6">
              {stats.categories
                .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
                .slice(0, 2)
                .map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:bg-slate-50"
                  >
                    <div className="flex items-center">
                      <p className="font-semibold text-gray-700">
                        {category.name || "Unnamed Category"}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500">
                        {category.productCount || 0} Produk
                      </p>
                    </div>
                  </div>
                ))}
              {stats.categories.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Tidak ada kategori untuk ditampilkan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-md w-full mt-4">
        <div className="flex justify-between items-center p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Transaksi Terakhir
          </h2>
          <div className="flex items-center space-x-2">
            <Link
              to="/admin/transactions"
              className="text-sm text-blue-600 hover:underline"
            >
              Lihat Semua Transaksi
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {stats.recentTransactions.slice(0, 4).length > 0 ? (
            <table className="w-full min-w-full">
              {" "}
              {/* Ensure no whitespace directly inside table before thead/tbody */}
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {" "}
                  {/* Ensure no whitespace directly inside tr before th */}
                  <th className="px-5 py-3">ID Pesanan</th>
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3">Pelanggan</th>
                  <th className="px-5 py-3 text-right">Nominal</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {stats.recentTransactions
                  .slice(0, 4)
                  .map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                        index === stats.recentTransactions.length - 1
                          ? "border-b-0"
                          : ""
                      }`} /* Modern hover, soft border, remove last border */
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        <Link
                          to={`/admin/transactions/${transaction.id}`}
                          className="hover:text-purple-700 transition-colors"
                        >
                          #
                          {transaction.id
                            .substring(transaction.id.length - 7)
                            .toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(transaction.transactionDate, "short")}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                        {transaction.customerName}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">
                        {formatToRupiah(transaction.totalAmount)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link
                          to={`/admin/transactions/${transaction.id}`}
                          className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center py-1.5 px-3 rounded-md hover:bg-purple-50 transition-all duration-150 group" /* Slightly enhanced button */
                          title="Lihat Detail"
                        >
                          <Eye
                            size={14}
                            className="mr-1.5 text-purple-500 group-hover:text-purple-700 transition-colors"
                          />{" "}
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p>Tidak ada transaksi terakhir untuk ditampilkan.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
