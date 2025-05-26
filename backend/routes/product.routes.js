const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProductStock,
  getBestSellerProducts
} = require('../controllers/product.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/best-sellers', getBestSellerProducts);
router.get('/:id', getProduct);

// Protected routes for admin and officer
router.use(protect);
router.use(authorize('admin', 'officer'));

router.route('/')
  .post(createProduct);

router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

router.route('/:id/image')
  .put(uploadProductImage);

router.route('/stock')
  .get(getProductStock);

module.exports = router; 