const express = require('express');
const router = express.Router();
const storeEmployeeController = require('../controllers/storeEmployeeController');
const { authenticateToken } = require('../middleware/auth');

// GET /store-employees/:storeId - Get all employees for a store
router.get('/:storeId', authenticateToken, storeEmployeeController.getStoreEmployees);

// GET /store-employees/:storeId/search - Search users to add as employees
router.get('/:storeId/search', authenticateToken, storeEmployeeController.searchUsers);

// POST /store-employees/:storeId - Add employee to store
router.post('/:storeId', authenticateToken, storeEmployeeController.addStoreEmployee);

// PUT /store-employees/:storeId/:userId - Update employee position/status
router.put('/:storeId/:userId', authenticateToken, storeEmployeeController.updateStoreEmployee);

// DELETE /store-employees/:storeId/:userId - Remove employee from store
router.delete('/:storeId/:userId', authenticateToken, storeEmployeeController.removeStoreEmployee);

module.exports = router;
