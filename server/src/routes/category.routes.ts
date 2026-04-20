const router = require('express').Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Public
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin-only
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
