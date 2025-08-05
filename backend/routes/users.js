const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// GET /users - Get all users
router.get('/', userController.getAllUsers);

// GET /users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /users - Create new user
router.post('/', userController.createUser);

// PUT /users/:id - Update user
router.put('/:id', userController.updateUser);

// PUT /users/role/update - Update current user's role (Customer <-> Employee only)
router.put('/role/update', authenticateToken, userController.updateUserRole);

// DELETE /users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
