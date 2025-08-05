const { getPool, sql } = require('../config/database');

const cartController = {
  // Obtener carrito del usuario
  getCart: async (req, res) => {
    try {
      const { userId } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            c.cart_id,
            c.user_id,
            c.product_id,
            c.quantity,
            c.added_at,
            p.name as product_name,
            p.price,
            p.image_url,
            (c.quantity * p.price) as subtotal
          FROM Cart c
          INNER JOIN Product p ON c.product_id = p.product_id
          WHERE c.user_id = @userId
          ORDER BY c.added_at DESC
        `);

      const total = result.recordset.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

      res.json({
        success: true,
        data: {
          items: result.recordset,
          total: total.toFixed(2)
        }
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving cart',
        error: error.message
      });
    }
  },

  // Agregar producto al carrito
  addToCart: async (req, res) => {
    try {
      const { userId, productId, quantity = 1 } = req.body;
      const pool = getPool();

      // Verificar si el producto ya existe en el carrito
      const existingItem = await pool.request()
        .input('userId', sql.Int, userId)
        .input('productId', sql.Int, productId)
        .query('SELECT cart_id, quantity FROM Cart WHERE user_id = @userId AND product_id = @productId');

      if (existingItem.recordset.length > 0) {
        // Actualizar cantidad si ya existe
        const newQuantity = existingItem.recordset[0].quantity + quantity;
        await pool.request()
          .input('cartId', sql.Int, existingItem.recordset[0].cart_id)
          .input('quantity', sql.Int, newQuantity)
          .query('UPDATE Cart SET quantity = @quantity, updated_at = GETDATE() WHERE cart_id = @cartId');
      } else {
        // Agregar nuevo item
        await pool.request()
          .input('userId', sql.Int, userId)
          .input('productId', sql.Int, productId)
          .input('quantity', sql.Int, quantity)
          .query('INSERT INTO Cart (user_id, product_id, quantity) VALUES (@userId, @productId, @quantity)');
      }

      res.json({
        success: true,
        message: 'Product added to cart successfully'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding product to cart',
        error: error.message
      });
    }
  },

  // Actualizar cantidad en carrito
  updateCartItem: async (req, res) => {
    try {
      const { cartId } = req.params;
      const { quantity } = req.body;
      const pool = getPool();

      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, eliminar el item
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .query('DELETE FROM Cart WHERE cart_id = @cartId');
      } else {
        // Actualizar cantidad
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .input('quantity', sql.Int, quantity)
          .query('UPDATE Cart SET quantity = @quantity, updated_at = GETDATE() WHERE cart_id = @cartId');
      }

      res.json({
        success: true,
        message: 'Cart updated successfully'
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating cart',
        error: error.message
      });
    }
  },

  // Eliminar item del carrito
  removeFromCart: async (req, res) => {
    try {
      const { cartId } = req.params;
      const pool = getPool();

      await pool.request()
        .input('cartId', sql.Int, cartId)
        .query('DELETE FROM Cart WHERE cart_id = @cartId');

      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing item from cart',
        error: error.message
      });
    }
  },

  // Limpiar carrito completo
  clearCart: async (req, res) => {
    try {
      const { userId } = req.params;
      const pool = getPool();

      await pool.request()
        .input('userId', sql.Int, userId)
        .query('DELETE FROM Cart WHERE user_id = @userId');

      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error clearing cart',
        error: error.message
      });
    }
  },

  // Checkout - Convertir carrito en ticket
  checkout: async (req, res) => {
    let transaction;
    
    try {
        const { userId, storeId, paymentMethodId, customerName, customerEmail } = req.body;
        
        if (!userId || !storeId || !paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos'
            });
        }
        
        const pool = getPool();
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        // Obtener items del carrito
        const cartItems = await transaction.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    c.product_id,
                    c.quantity,
                    p.price,
                    (p.price * c.quantity) as subtotal
                FROM Cart c
                INNER JOIN Product p ON c.product_id = p.product_id
                WHERE c.user_id = @userId
            `);
        
        if (cartItems.recordset.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'El carrito está vacío'
            });
        }
        
        // Calcular total
        const total = cartItems.recordset.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        // Crear ticket
        const ticketResult = await transaction.request()
            .input('userId', sql.Int, userId)
            .input('storeId', sql.Int, storeId)
            .input('total', sql.Decimal(10, 2), total)
            .query(`
                INSERT INTO Ticket (user_id, store_id, total_amount, ticket_date, created_at, updated_at)
                OUTPUT INSERTED.ticket_id
                VALUES (@userId, @storeId, @total, GETDATE(), GETDATE(), GETDATE())
            `);
        
        const ticketId = ticketResult.recordset[0].ticket_id;
        
        // Crear ticket products
        for (const item of cartItems.recordset) {
            await transaction.request()
                .input('ticketId', sql.Int, ticketId)
                .input('productId', sql.Int, item.product_id)
                .input('quantity', sql.Int, item.quantity)
                .input('unitPrice', sql.Decimal(10, 2), item.price)
                .query(`
                    INSERT INTO TicketProduct (ticket_id, product_id, quantity, unit_price)
                    VALUES (@ticketId, @productId, @quantity, @unitPrice)
                `);
        }
        
        // Crear registro de pago
        await transaction.request()
            .input('ticketId', sql.Int, ticketId)
            .input('methodId', sql.Int, paymentMethodId)
            .input('statusId', sql.Int, 1) // 1 = Pending
            .input('amount', sql.Decimal(10, 2), total)
            .query(`
                INSERT INTO Payment (ticket_id, method_id, status_id, amount, created_at)
                VALUES (@ticketId, @methodId, @statusId, @amount, GETDATE())
            `);
        
        // Limpiar carrito
        await transaction.request()
            .input('userId', sql.Int, userId)
            .query(`DELETE FROM Cart WHERE user_id = @userId`);
        
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Pedido procesado exitosamente',
            data: {
                ticketId: ticketId,
                total: total.toFixed(2),
                paymentMethodId: paymentMethodId
            }
        });
        
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }
        console.error('Error during checkout:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al procesar el pedido',
            error: error.message
        });
    }
  }
};

module.exports = cartController;