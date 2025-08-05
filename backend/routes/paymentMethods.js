const express = require('express');
const router = express.Router();
const sql = require('mssql');

// GET - Obtener todos los métodos de pago disponibles
router.get('/', async (req, res) => {
    try {
        const pool = await sql.connect();
        
        const result = await pool.request()
            .query(`
                SELECT method_id, method_name
                FROM PaymentMethod
                ORDER BY method_id
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener métodos de pago' 
        });
    }
});

module.exports = router;