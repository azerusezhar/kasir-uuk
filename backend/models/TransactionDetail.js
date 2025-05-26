const mongoose = require('mongoose');

const TransactionDetailSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Jumlah minimal harus 1']
  },
  subtotal: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('TransactionDetail', TransactionDetailSchema); 