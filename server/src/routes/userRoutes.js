const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware, permissionMiddleware } = require('../middleware/auth');

// All routes here require login AND admin permission
router.use(authMiddleware);
router.use(permissionMiddleware(['admin']));

router.get('/', UserController.list);
router.post('/', UserController.create);
router.patch('/:id/status', UserController.toggleStatus);

module.exports = router;
