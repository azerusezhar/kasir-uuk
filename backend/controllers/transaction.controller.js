const Transaction = require('../models/Transaction');
const TransactionDetail = require('../models/TransactionDetail');
const Product = require('../models/Product');
const Customer = require('../models/Customer');


exports.getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'transactionDate',
      order = 'desc',
      status,
      search, 
      startDate,
      endDate,
      customerName, 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let findConditions = {};

    if (req.user.role === 'customer') {
      if (!req.user._id) {
        console.error('[getTransactions] Customer user found, but req.user._id is missing.');
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan internal: ID pelanggan tidak valid.'
        });
      }
      findConditions.customer = req.user._id;
    } else if (req.user.role === 'admin' || req.user.role === 'officer') {
      if (customerName) {
        const customers = await Customer.find({ name: { $regex: customerName, $options: 'i' } }).select('_id');
        if (customers.length > 0) {
          findConditions.customer = { $in: customers.map(c => c._id) };
        } else {
          return res.status(200).json({
            success: true,
            count: 0,
            totalRecords: 0,
            totalPages: 0,
            currentPage: 1,
            data: []
          });
        }
      }
    }

    if (status && status !== 'all') {
      findConditions.status = status;
    }

    if (search) {
      // Asumsi search adalah untuk ID transaksi. ObjectId harus valid.
      if (require('mongoose').Types.ObjectId.isValid(search)) {
        findConditions._id = search;
      } else {
         findConditions._id = null; 
      }
    }
    
    if (startDate) {
        findConditions.transactionDate = { ...findConditions.transactionDate, $gte: new Date(startDate) };
    }
    if (endDate) {
        // Set endDate ke akhir hari
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        findConditions.transactionDate = { ...findConditions.transactionDate, $lte: endOfDay };
    }


    let query = Transaction.find(findConditions)
      .populate({
        path: 'customer',
        select: 'name phoneNumber'
      })
      .populate({
        path: 'cashier',
        select: 'name email'
      })
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const transactions = await query;
    const totalTransactions = await Transaction.countDocuments(findConditions);
    const totalPages = Math.ceil(totalTransactions / parseInt(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalRecords: totalTransactions,
      totalPages,
      currentPage: parseInt(page),
      data: transactions
    });
  } catch (err) {
    console.error('[GET_TRANSACTIONS_ERROR]', err); // Logging error yang lebih baik
    next(err);
  }
};

// @desc    Get single transaction with details
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: 'customer',
        select: 'name phoneNumber address'
      })
      .populate({
        path: 'cashier',
        select: 'name email'
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaksi dengan id ${req.params.id} tidak ditemukan`
      });
    }

    // Check if user is authorized to view this transaction
    if (req.user.role === 'customer') {
      const transactionCustomerId = transaction.customer?._id || transaction.customer;

      if (!transactionCustomerId || transactionCustomerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Tidak diizinkan mengakses transaksi ini'
        });
      }
    }

    // Get transaction details
    const transactionDetails = await TransactionDetail.find({ 
      transaction: transaction._id 
    }).populate({
      path: 'product',
      select: 'name price image'
    });

    res.status(200).json({
      success: true,
      data: {
        transaction,
        details: transactionDetails
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private (Admin, Officer, Customer)
exports.createTransaction = async (req, res, next) => {
  try {
    let customerId;


    if (req.user.role === 'customer') {
      customerId = req.user._id; 
    } else if (req.user.role === 'admin' || req.user.role === 'officer') {
      if (!req.body.customer) {
        return res.status(400).json({
          success: false,
          message: 'Mohon sertakan ID pelanggan untuk transaksi oleh admin/petugas'
        });
      }
      const customerForAdmin = await Customer.findById(req.body.customer);
      if (!customerForAdmin) {
        return res.status(404).json({
          success: false,
          message: `Pelanggan dengan id ${req.body.customer} (untuk admin) tidak ditemukan`
        });
      }
      customerId = customerForAdmin._id;
    } else {
      console.error('[TransactionController] Error: User role not recognized or req.user not properly set.');
      return res.status(500).json({ success: false, message: 'Internal server error: Peran pengguna tidak dikenali.'});
    }

    if (!customerId) {
      console.error('[TransactionController] FATAL: customerId is still undefined before processing items.');
      return res.status(500).json({ success: false, message: 'Internal error: Gagal menentukan ID pelanggan.' });
    }

    req.body.customer = customerId;

    const { items, paymentAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mohon sertakan item untuk transaksi'
      });
    }
    
    let totalAmount = 0;
    const processedItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan id ${item.productId} tidak ditemukan`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok tidak cukup untuk ${product.name}. Tersedia: ${product.stock}`
        });
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      processedItems.push({
        productId: product._id,
        quantity: item.quantity,
        subtotal,
        priceAtTransaction: product.price 
      });
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity } 
      });
    }
    
    req.body.totalAmount = totalAmount;
    
    if (paymentAmount === undefined || paymentAmount === null || paymentAmount < totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah pembayaran kurang dari total belanja atau tidak valid'
      });
    }
    
    req.body.changeAmount = paymentAmount - totalAmount;
    
  
    if (req.user && (req.user.role === 'admin' || req.user.role === 'officer')) {
      req.body.cashier = req.user.id;
    }

    const transaction = await Transaction.create(req.body);

    const transactionDetailsToCreate = processedItems.map(item => ({
      transaction: transaction._id,
      product: item.productId,
      quantity: item.quantity,
      subtotal: item.subtotal,
      priceAtTransaction: item.priceAtTransaction
    }));
    await TransactionDetail.insertMany(transactionDetailsToCreate);

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error('[TransactionController CREATE ERROR]', err);
    next(err);
  }
};

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['completed', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Mohon berikan status yang valid (completed, cancelled, refunded)'
      });
    }
    
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaksi dengan id ${req.params.id} tidak ditemukan`
      });
    }
    
    // If cancelling or refunding, restore product stock
    if ((status === 'cancelled' || status === 'refunded') && 
        transaction.status === 'completed') {
      
      // Get transaction details
      const transactionDetails = await TransactionDetail.find({ 
        transaction: transaction._id 
      });
      
      for (const detail of transactionDetails) {
        const product = await Product.findById(detail.product);
        
        if (product) {
          await Product.findByIdAndUpdate(product._id, {
            stock: product.stock + detail.quantity
          });
        }
      }
    }
    
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate transaction report
// @route   GET /api/transactions/report
// @access  Private
exports.getTransactionReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // If user is customer, only show their transactions
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user.id });
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Profil pelanggan tidak ditemukan'
        });
      }
      
      query.customer = customer._id;
    }
    
    // Get transactions
    const transactions = await Transaction.find(query)
      .populate({
        path: 'customer',
        select: 'name'
      })
      .populate({
        path: 'cashier',
        select: 'name'
      });
    

    const totalSales = transactions.reduce((sum, transaction) => {
      if (transaction.status === 'completed') {
        return sum + transaction.totalAmount;
      }
      return sum;
    }, 0);
    
    const transactionCount = transactions.length;
    const completedCount = transactions.filter(t => t.status === 'completed').length;
    const cancelledCount = transactions.filter(t => t.status === 'cancelled').length;
    const refundedCount = transactions.filter(t => t.status === 'refunded').length;
    
    res.status(200).json({
      success: true,
      data: {
        transactions,
        summary: {
          totalSales,
          transactionCount,
          completedCount,
          cancelledCount,
          refundedCount
        }
      }
    });
  } 
  catch (err) {
    next(err);
  }
}; 