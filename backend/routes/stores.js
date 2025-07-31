const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken } = require('../middleware/auth');

// GET /stores - Get all stores
router.get('/', storeController.getAllStores);

// GET /stores/my-stores - Get stores owned by current user
router.get('/my-stores', authenticateToken, storeController.getMyStores);

// GET /stores/:id - Get store by ID
router.get('/:id', storeController.getStoreById);

// POST /stores - Create new store
router.post('/', storeController.createStore);

// POST /stores/register - Register new store and make user admin
router.post('/register', authenticateToken, storeController.registerUserStore);

// PUT /stores/:id - Update store
router.put('/:id', storeController.updateStore);

// DELETE /stores/:id - Delete store
router.delete('/:id', storeController.deleteStore);

module.exports = router;
