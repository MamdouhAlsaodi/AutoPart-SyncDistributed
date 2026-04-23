const express = require('express');
const router = express.Router();
const PartsController = require('../controllers/PartsController');
const MovementController = require('../controllers/MovementController');
const { authMiddleware, permissionMiddleware } = require('../middleware/auth');

// Movements Routes (Must come BEFORE /:id)
router.get('/history', authMiddleware, MovementController.getHistory);
router.get('/history/:peca_id', authMiddleware, MovementController.getHistory);
router.post('/entrada', authMiddleware, permissionMiddleware(['admin', 'operador']), MovementController.recordEntry);
router.post('/saida', authMiddleware, permissionMiddleware(['admin', 'operador']), MovementController.recordExit);

// Parts Routes (Must come AFTER specific routes)
router.get('/', authMiddleware, PartsController.getAll);
router.get('/:id', authMiddleware, PartsController.getById);
router.post('/', authMiddleware, permissionMiddleware(['admin', 'operador']), PartsController.create);

module.exports = router;
