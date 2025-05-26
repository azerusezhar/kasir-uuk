const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesChartData } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth');

// Semua rute di sini hanya untuk admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/sales-chart', getSalesChartData);

module.exports = router; 