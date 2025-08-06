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

// GET - Obtener órdenes de un usuario específico
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = getPool();
        
        // Obtener todas las órdenes del usuario con información detallada
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    t.ticket_id,
                    t.total_amount,
                    t.customer_name,
                    t.customer_email,
                    COALESCE(t.status, 'pending') as status,
                    t.ticket_date,
                    t.created_at,
                    t.updated_at,
                    s.name as store_name,
                    s.store_id,
                    STRING_AGG(CONCAT(p.name, ' (', tp.quantity, ')'), ', ') as products_summary,
                    COUNT(tp.product_id) as total_items
                FROM Ticket t
                INNER JOIN Store s ON t.store_id = s.store_id
                LEFT JOIN TicketProduct tp ON t.ticket_id = tp.ticket_id
                LEFT JOIN Product p ON tp.product_id = p.product_id
                WHERE t.user_id = @userId
                GROUP BY t.ticket_id, t.total_amount, t.customer_name, t.customer_email, 
                         t.status, t.ticket_date, t.created_at, t.updated_at, 
                         s.name, s.store_id
                ORDER BY t.created_at DESC
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener órdenes del usuario',
            error: error.message
        });
    }
});

// GET - Obtener órdenes de una tienda específica (CORREGIDO)
router.get('/store/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const pool = getPool();
        
        // Obtener todas las órdenes/tickets de una tienda con información de productos
        const result = await pool.request()
            .input('storeId', sql.Int, storeId)
            .query(`
                SELECT 
                    CONCAT(tp.ticket_id, '_', tp.product_id) as order_id,
                    t.ticket_id,
                    p.name as product_name,
                    p.image_url as product_image,
                    tp.quantity,
                    COALESCE(t.status, 'pending') as status,
                    u.full_name as customer_name,
                    t.created_at,
                    t.updated_at,
                    t.store_id,
                    s.name as store_name
                FROM TicketProduct tp
                INNER JOIN Ticket t ON tp.ticket_id = t.ticket_id
                INNER JOIN Product p ON tp.product_id = p.product_id
                INNER JOIN Store s ON t.store_id = s.store_id
                LEFT JOIN [User] u ON t.user_id = u.user_id
                WHERE t.store_id = @storeId
                ORDER BY t.created_at DESC
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
        
    } catch (error) {
        console.error('Error fetching store orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener órdenes de la tienda',
            error: error.message
        });
    }
});

// PATCH - Actualizar estado de una orden
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Estado es requerido'
            });
        }
        
        // Validar que el estado sea válido
        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido'
            });
        }
        
        const pool = getPool();
        
        // Extraer ticket_id del order_id compuesto (formato: "ticketId_productId")
        const ticketId = orderId.includes('_') ? orderId.split('_')[0] : orderId;
        
        // Actualizar el estado del ticket
        const result = await pool.request()
            .input('ticketId', sql.Int, parseInt(ticketId))
            .input('status', sql.NVarChar(50), status.toLowerCase())
            .query(`
                UPDATE Ticket 
                SET status = @status, updated_at = GETDATE() 
                WHERE ticket_id = @ticketId
            `);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: { orderId, ticketId: parseInt(ticketId), status: status.toLowerCase() }
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar estado de la orden',
            error: error.message
        });
    }
});

// Endpoint temporal para debug - obtener estructura de tickets
router.get('/debug/store/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const pool = getPool();
        
        const result = await pool.request()
            .input('storeId', sql.Int, storeId)
            .query(`
                SELECT TOP 5 
                    t.*,
                    u.full_name,
                    s.name as store_name
                FROM Ticket t
                LEFT JOIN [User] u ON t.user_id = u.user_id
                LEFT JOIN Store s ON t.store_id = s.store_id
                WHERE t.store_id = @storeId
                ORDER BY t.created_at DESC
            `);
        
        res.json({
            success: true,
            data: result.recordset,
            columns: result.recordset.length > 0 ? Object.keys(result.recordset[0]) : []
        });
        
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en debug',
            error: error.message
        });
    }
});

module.exports = router;