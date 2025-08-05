const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET /api/cart/:userId - Obtener carrito del usuario
router.get('/:userId', cartController.getCart);

// POST /api/cart/add - Agregar producto al carrito
router.post('/add', cartController.addToCart);

// PUT /api/cart/:cartId - Actualizar cantidad en carrito
router.put('/:cartId', cartController.updateCartItem);

// DELETE /api/cart/:cartId - Eliminar item del carrito
router.delete('/:cartId', cartController.removeFromCart);

// DELETE /api/cart/clear/:userId - Limpiar carrito completo
router.delete('/clear/:userId', cartController.clearCart);

// POST /api/cart/checkout - Convertir carrito en pedido
router.post('/checkout', cartController.checkout);

module.exports = router;