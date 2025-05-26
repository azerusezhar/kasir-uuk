const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentAmount: {
    type: Number
  },
  changeAmount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'completed'
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema); 