const express = require('express');
const router = express.Router();

// Mock data para categorías
const categories = [
  { category_id: 1, name: 'Bebidas' },
  { category_id: 2, name: 'Comida' },
  { category_id: 3, name: 'Postres' },
  { category_id: 4, name: 'Aperitivos' },
  { category_id: 5, name: 'Otro' }
];

// GET /api/categories - Get all categories
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: categories,
      message: 'Categorías obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = categories.find(cat => cat.category_id === categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: category,
      message: 'Categoría obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
