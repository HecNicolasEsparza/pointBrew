const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// GET - Obtener pedidos del usuario
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = getPool();
        
        // Obtener tickets/pedidos del usuario con información detallada
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    t.ticket_id,
                    t.total_amount,
                    t.ticket_date,
                    t.created_at,
                    s.name as store_name,
                    s.image_url as store_image,
                    b.name as branch_name,
                    b.address as branch_address,
                    pm.method_name as payment_method,
                    ps.status_name as payment_status
                FROM Ticket t
                INNER JOIN Store s ON t.store_id = s.store_id
                INNER JOIN Branch b ON s.branch_id = b.branch_id
                LEFT JOIN Payment pay ON t.ticket_id = pay.ticket_id
                LEFT JOIN PaymentMethod pm ON pay.method_id = pm.method_id
                LEFT JOIN PaymentStatus ps ON pay.status_id = ps.status_id
                WHERE t.user_id = @userId
                ORDER BY t.created_at DESC
            `);
        
        // Obtener productos de cada ticket
        const ticketsWithProducts = await Promise.all(
            result.recordset.map(async (ticket) => {
                const productsResult = await pool.request()
                    .input('ticketId', sql.Int, ticket.ticket_id)
                    .query(`
                        SELECT 
                            tp.quantity,
                            tp.unit_price,
                            p.name as product_name,
                            p.image_url as product_image,
                            (tp.quantity * tp.unit_price) as subtotal
                        FROM TicketProduct tp
                        INNER JOIN Product p ON tp.product_id = p.product_id
                        WHERE tp.ticket_id = @ticketId
                    `);
                
                return {
                    ...ticket,
                    products: productsResult.recordset
                };
            })
        );
        
        res.json({
            success: true,
            data: ticketsWithProducts
        });
        
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener los pedidos',
            error: error.message
        });
    }
});

// GET - Obtener detalles de un pedido específico
router.get('/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const pool = getPool();
        
        // Obtener información del ticket
        const ticketResult = await pool.request()
            .input('ticketId', sql.Int, ticketId)
            .query(`
                SELECT 
                    t.ticket_id,
                    t.total_amount,
                    t.ticket_date,
                    t.created_at,
                    s.name as store_name,
                    s.image_url as store_image,
                    b.name as branch_name,
                    b.address as branch_address,
                    pm.method_name as payment_method,
                    ps.status_name as payment_status
                FROM Ticket t
                INNER JOIN Store s ON t.store_id = s.store_id
                INNER JOIN Branch b ON s.branch_id = b.branch_id
                LEFT JOIN Payment pay ON t.ticket_id = pay.ticket_id
                LEFT JOIN PaymentMethod pm ON pay.method_id = pm.method_id
                LEFT JOIN PaymentStatus ps ON pay.status_id = ps.status_id
                WHERE t.ticket_id = @ticketId
            `);
        
        if (ticketResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }
        
        // Obtener productos del ticket
        const productsResult = await pool.request()
            .input('ticketId', sql.Int, ticketId)
            .query(`
                SELECT 
                    tp.quantity,
                    tp.unit_price,
                    p.name as product_name,
                    p.image_url as product_image,
                    (tp.quantity * tp.unit_price) as subtotal
                FROM TicketProduct tp
                INNER JOIN Product p ON tp.product_id = p.product_id
                WHERE tp.ticket_id = @ticketId
            `);
        
        const orderDetails = {
            ...ticketResult.recordset[0],
            products: productsResult.recordset
        };
        
        res.json({
            success: true,
            data: orderDetails
        });
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener detalles del pedido',
            error: error.message
        });
    }
});

module.exports = router;