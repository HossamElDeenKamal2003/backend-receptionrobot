const express = require('express');
const router = express.Router();
const controller = require('../controller/products');

router.post('/', controller.createProduct);
router.get('/', controller.getAllProducts);
router.get('/:id', controller.getSingleProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
