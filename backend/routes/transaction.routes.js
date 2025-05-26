const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransactionStatus,
  getTransactionReport
} = require('../controllers/transaction.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); 

router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.get('/report', authorize('admin', 'officer'), getTransactionReport);
router.post('/', authorize('admin', 'officer', 'customer'), createTransaction);
router.put('/:id', authorize('admin', 'officer'), updateTransactionStatus);

module.exports = router; 