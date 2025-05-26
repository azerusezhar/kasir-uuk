const express = require('express');
const {
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  register,
  login
} = require('../controllers/customer.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// All other routes are protected
router.use(protect);

// Customer can get and update their own profile
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);

// Admin/Officer only routes
router.get('/', authorize('admin', 'officer'), getCustomers);
router.delete('/:id', authorize('admin', 'officer'), deleteCustomer);

module.exports = router; 