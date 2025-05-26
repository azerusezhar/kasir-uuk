const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');


// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();

    const totalRevenueResult = await Transaction.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

    const totalSales = await Transaction.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    const recentTransactions = await Transaction.find()
      .sort({ transactionDate: -1 })
      .limit(5)
      .populate('customer', 'name');


    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalRevenue,
        totalSales,
        totalCustomers,
        recentTransactions,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get sales data for chart
// @route   GET /api/dashboard/sales-chart
// @access  Private (Admin)
exports.getSalesChartData = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: thirtyDaysAgo },
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          dailyRevenue: { $sum: '$totalAmount' },
          dailySalesCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);


    const labels = salesData.map(item => item._id);
    const revenueDataset = salesData.map(item => item.dailyRevenue);
    const salesCountDataset = salesData.map(item => item.dailySalesCount);

    res.status(200).json({
      success: true,
      data: {
        labels,
        datasets: [
          {
            label: 'Pendapatan Harian (Rp)',
            data: revenueDataset,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'yRevenue',
            tension: 0.1
          },
          {
            label: 'Jumlah Transaksi Harian',
            data: salesCountDataset,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            yAxisID: 'ySalesCount',
            tension: 0.1
          }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
}; 