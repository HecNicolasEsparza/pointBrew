const { getPool, sql } = require('../config/database');

const ticketController = {
  // Get all tickets
  getAllTickets: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query(`
          SELECT t.ticket_id, t.ticket_date, t.total_amount, t.created_at,
                 u.full_name as customer_name, u.email as customer_email,
                 s.name as store_name,
                 b.name as branch_name
          FROM Ticket t
          INNER JOIN [User] u ON t.user_id = u.user_id
          INNER JOIN Store s ON t.store_id = s.store_id
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          ORDER BY t.created_at DESC
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving tickets',
        error: error.message
      });
    }
  },

  // Get ticket by ID with details
  getTicketById: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      // Get ticket info
      const ticketResult = await pool.request()
        .input('ticketId', sql.Int, id)
        .query(`
          SELECT t.ticket_id, t.ticket_date, t.total_amount, t.created_at,
                 u.full_name as customer_name, u.email as customer_email,
                 s.name as store_name, s.store_id,
                 b.name as branch_name, b.branch_id
          FROM Ticket t
          INNER JOIN [User] u ON t.user_id = u.user_id
          INNER JOIN Store s ON t.store_id = s.store_id
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          WHERE t.ticket_id = @ticketId
        `);

      if (ticketResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      // Get ticket products
      const productsResult = await pool.request()
        .input('ticketId', sql.Int, id)
        .query(`
          SELECT tp.quantity, tp.unit_price, (tp.quantity * tp.unit_price) as subtotal,
                 p.name as product_name, p.product_id
          FROM TicketProduct tp
          INNER JOIN Product p ON tp.product_id = p.product_id
          WHERE tp.ticket_id = @ticketId
        `);

      // Get payments
      const paymentsResult = await pool.request()
        .input('ticketId', sql.Int, id)
        .query(`
          SELECT pay.payment_id, pay.amount, pay.paid_at, pay.created_at,
                 pm.method_name, ps.status_name
          FROM Payment pay
          INNER JOIN PaymentMethod pm ON pay.method_id = pm.method_id
          INNER JOIN PaymentStatus ps ON pay.status_id = ps.status_id
          WHERE pay.ticket_id = @ticketId
        `);

      const ticket = {
        ...ticketResult.recordset[0],
        products: productsResult.recordset,
        payments: paymentsResult.recordset
      };

      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error('Error getting ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving ticket',
        error: error.message
      });
    }
  },

  // Create new ticket
  createTicket: async (req, res) => {
    try {
      const { user_id, store_id, products, payment_method_id } = req.body;

      if (!user_id || !store_id || !products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id, store_id, products array'
        });
      }

      const pool = getPool();
      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        // Calculate total amount
        let totalAmount = 0;
        for (const product of products) {
          totalAmount += (product.quantity * product.unit_price);
        }

        // Create ticket
        const ticketResult = await transaction.request()
          .input('userId', sql.Int, user_id)
          .input('storeId', sql.Int, store_id)
          .input('totalAmount', sql.Decimal(10, 2), totalAmount)
          .query(`
            INSERT INTO Ticket (user_id, store_id, total_amount)
            OUTPUT INSERTED.ticket_id, INSERTED.ticket_date, INSERTED.total_amount
            VALUES (@userId, @storeId, @totalAmount)
          `);

        const ticketId = ticketResult.recordset[0].ticket_id;

        // Add products to ticket
        for (const product of products) {
          await transaction.request()
            .input('ticketId', sql.Int, ticketId)
            .input('productId', sql.Int, product.product_id)
            .input('quantity', sql.Int, product.quantity)
            .input('unitPrice', sql.Decimal(10, 2), product.unit_price)
            .query(`
              INSERT INTO TicketProduct (ticket_id, product_id, quantity, unit_price)
              VALUES (@ticketId, @productId, @quantity, @unitPrice)
            `);
        }

        // Create payment if method provided
        if (payment_method_id) {
          await transaction.request()
            .input('ticketId', sql.Int, ticketId)
            .input('methodId', sql.Int, payment_method_id)
            .input('statusId', sql.Int, 1) // Pending status
            .input('amount', sql.Decimal(10, 2), totalAmount)
            .query(`
              INSERT INTO Payment (ticket_id, method_id, status_id, amount)
              VALUES (@ticketId, @methodId, @statusId, @amount)
            `);
        }

        await transaction.commit();

        res.status(201).json({
          success: true,
          message: 'Ticket created successfully',
          data: {
            ticket_id: ticketId,
            total_amount: totalAmount,
            products_count: products.length
          }
        });

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating ticket',
        error: error.message
      });
    }
  },

  // Get tickets by user
  getTicketsByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT t.ticket_id, t.ticket_date, t.total_amount, t.created_at,
                 s.name as store_name,
                 b.name as branch_name
          FROM Ticket t
          INNER JOIN Store s ON t.store_id = s.store_id
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          WHERE t.user_id = @userId
          ORDER BY t.created_at DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting tickets by user:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving tickets',
        error: error.message
      });
    }
  }
};

module.exports = ticketController;
