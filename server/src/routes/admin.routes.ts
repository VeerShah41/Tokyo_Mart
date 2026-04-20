const router = require('express').Router();
const { getAllUsers, deleteUser } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
