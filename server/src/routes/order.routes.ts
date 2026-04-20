const router = require('express').Router();
const { getOrders, getOrderById, placeOrder, updateOrderStatus } = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, placeOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
