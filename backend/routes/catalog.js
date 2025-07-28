const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

// GET /catalog/roles - Get all roles
router.get('/roles', catalogController.getRoles);

// GET /catalog/payment-methods - Get all payment methods
router.get('/payment-methods', catalogController.getPaymentMethods);

// GET /catalog/payment-statuses - Get all payment statuses
router.get('/payment-statuses', catalogController.getPaymentStatuses);

// GET /catalog/turn-statuses - Get all turn statuses
router.get('/turn-statuses', catalogController.getTurnStatuses);

// GET /catalog/categories - Get all categories
router.get('/categories', catalogController.getCategories);

// POST /catalog/categories - Create new category
router.post('/categories', catalogController.createCategory);

module.exports = router;
