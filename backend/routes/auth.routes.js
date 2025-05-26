const express = require('express');
const {
  login,
  getMe,
  logout,
  createStaff,
  updateDetails,
  updatePassword,
  getUsers
} = require('../controllers/auth.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Admin only routes
router.post('/create-staff', protect, authorize('admin'), createStaff);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router; 