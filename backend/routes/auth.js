const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// POST /auth/register - Register new user
router.post('/register', registerValidation, authController.register);

// POST /auth/login - Login user
router.post('/login', loginValidation, authController.login);

// GET /auth/profile - Get current user profile (protected route)
router.get('/profile', authenticateToken, authController.getProfile);

// POST /auth/logout - Logout user (protected route)
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
