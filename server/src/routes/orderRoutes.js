const express = require('express');
const OrdersController = require('../controllers/OrdersController');
const { authMiddleware, permissionMiddleware } = require('../middleware/auth');
const router = express.Router();
router.use(authMiddleware, permissionMiddleware(['cliente']));
router.post('/checkout', OrdersController.checkout);
router.get('/me', OrdersController.me);
router.get('/:id', OrdersController.detail);
module.exports = router;
