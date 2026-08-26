const express = require('express');
const PartsController = require('../controllers/PartsController');
const router = express.Router();
router.get('/', PartsController.getPublicCatalogue);
router.get('/:id', PartsController.getPublicCatalogueDetail);
module.exports = router;
