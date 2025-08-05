const express = require('express');
const router = express.Router();
const userPaymentController = require('../controllers/userPaymentController');

// GET /api/user-payments/:userId - Obtener métodos de pago del usuario
router.get('/:userId', userPaymentController.getUserPaymentMethods);

// POST /api/user-payments - Agregar método de pago
router.post('/', userPaymentController.addPaymentMethod);

// PUT /api/user-payments/:userPaymentId - Actualizar método de pago
router.put('/:userPaymentId', userPaymentController.updatePaymentMethod);

// DELETE /api/user-payments/:userPaymentId - Eliminar método de pago
router.delete('/:userPaymentId', userPaymentController.deletePaymentMethod);

// PUT /api/user-payments/:userPaymentId/default - Establecer como predeterminado
router.put('/:userPaymentId/default', userPaymentController.setDefaultPaymentMethod);

module.exports = router;