const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// GET /stores - Get all stores
router.get('/', storeController.getAllStores);

// GET /stores/:id - Get store by ID
router.get('/:id', storeController.getStoreById);

// POST /stores - Create new store
router.post('/', storeController.createStore);

// PUT /stores/:id - Update store
router.put('/:id', storeController.updateStore);

// DELETE /stores/:id - Delete store
router.delete('/:id', storeController.deleteStore);

module.exports = router;
