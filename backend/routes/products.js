const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /products - Get all products
router.get('/', productController.getAllProducts);

// GET /products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// GET /products/store/:storeId - Get products by store
router.get('/store/:storeId', productController.getProductsByStore);

// POST /products - Create new product
router.post('/', productController.createProduct);

// PUT /products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
