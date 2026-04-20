const router = require('express').Router();
const {
  getAllProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

// Public routes (no auth required for demo)
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin routes — auth removed for demo, add protect+adminOnly for production
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
