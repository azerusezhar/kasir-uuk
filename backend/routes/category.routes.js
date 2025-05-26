const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes for admin and officer
router.use(protect);
router.use(authorize('admin', 'officer'));

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router; 