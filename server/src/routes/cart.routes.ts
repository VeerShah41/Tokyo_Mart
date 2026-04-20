const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

// All cart routes are protected (require login)
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:id', protect, updateCartItem);
router.delete('/:id', protect, removeFromCart);

module.exports = router;
