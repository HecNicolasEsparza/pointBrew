const { getPool, sql } = require('../config/database');

const turnController = {
  // Get all turns
  getAllTurns: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query(`
          SELECT t.turn_id, t.queue_number, t.requested_at, t.desired_pickup,
                 ts.status_name,
                 u.full_name as customer_name,
                 b.name as branch_name,
                 tick.ticket_id, tick.total_amount
          FROM Turn t
          INNER JOIN TurnStatus ts ON t.status_id = ts.status_id
          INNER JOIN [User] u ON t.user_id = u.user_id
          INNER JOIN Branch b ON t.branch_id = b.branch_id
          INNER JOIN Ticket tick ON t.ticket_id = tick.ticket_id
          ORDER BY t.requested_at DESC
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting turns:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving turns',
        error: error.message
      });
    }
  },

  // Get turn by ID
  getTurnById: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('turnId', sql.Int, id)
        .query(`
          SELECT t.turn_id, t.queue_number, t.requested_at, t.desired_pickup,
                 ts.status_name, ts.status_id,
                 u.full_name as customer_name, u.email as customer_email,
                 b.name as branch_name, b.address as branch_address,
                 tick.ticket_id, tick.total_amount, tick.ticket_date
          FROM Turn t
          INNER JOIN TurnStatus ts ON t.status_id = ts.status_id
          INNER JOIN [User] u ON t.user_id = u.user_id
          INNER JOIN Branch b ON t.branch_id = b.branch_id
          INNER JOIN Ticket tick ON t.ticket_id = tick.ticket_id
          WHERE t.turn_id = @turnId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Turn not found'
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error getting turn:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving turn',
        error: error.message
      });
    }
  },

  // Create new turn
  createTurn: async (req, res) => {
    try {
      const { ticket_id, branch_id, user_id, desired_pickup } = req.body;

      if (!ticket_id || !branch_id || !user_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: ticket_id, branch_id, user_id'
        });
      }

      const pool = getPool();
      
      // Get next queue number for the branch
      const queueResult = await pool.request()
        .input('branchId', sql.Int, branch_id)
        .query(`
          SELECT ISNULL(MAX(queue_number), 0) + 1 as next_queue_number
          FROM Turn 
          WHERE branch_id = @branchId 
          AND CAST(requested_at AS DATE) = CAST(GETDATE() AS DATE)
        `);

      const queueNumber = queueResult.recordset[0].next_queue_number;

      const result = await pool.request()
        .input('ticketId', sql.Int, ticket_id)
        .input('branchId', sql.Int, branch_id)
        .input('userId', sql.Int, user_id)
        .input('queueNumber', sql.Int, queueNumber)
        .input('statusId', sql.Int, 1) // Waiting status
        .input('desiredPickup', sql.DateTime, desired_pickup || null)
        .query(`
          INSERT INTO Turn (ticket_id, branch_id, user_id, queue_number, status_id, desired_pickup)
          OUTPUT INSERTED.turn_id, INSERTED.queue_number, INSERTED.requested_at, INSERTED.desired_pickup
          VALUES (@ticketId, @branchId, @userId, @queueNumber, @statusId, @desiredPickup)
        `);

      res.status(201).json({
        success: true,
        message: 'Turn created successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error creating turn:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating turn',
        error: error.message
      });
    }
  },

  // Update turn status
  updateTurnStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status_id } = req.body;

      if (!status_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: status_id'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('turnId', sql.Int, id)
        .input('statusId', sql.Int, status_id)
        .query(`
          UPDATE Turn 
          SET status_id = @statusId
          OUTPUT INSERTED.turn_id, INSERTED.queue_number, INSERTED.status_id
          WHERE turn_id = @turnId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Turn not found'
        });
      }

      res.json({
        success: true,
        message: 'Turn status updated successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error updating turn status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating turn status',
        error: error.message
      });
    }
  },

  // Get turns by branch
  getTurnsByBranch: async (req, res) => {
    try {
      const { branchId } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('branchId', sql.Int, branchId)
        .query(`
          SELECT t.turn_id, t.queue_number, t.requested_at, t.desired_pickup,
                 ts.status_name, ts.status_id,
                 u.full_name as customer_name,
                 tick.ticket_id, tick.total_amount
          FROM Turn t
          INNER JOIN TurnStatus ts ON t.status_id = ts.status_id
          INNER JOIN [User] u ON t.user_id = u.user_id
          INNER JOIN Ticket tick ON t.ticket_id = tick.ticket_id
          WHERE t.branch_id = @branchId
          AND CAST(t.requested_at AS DATE) = CAST(GETDATE() AS DATE)
          ORDER BY t.queue_number
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting turns by branch:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving turns',
        error: error.message
      });
    }
  },

  // Get turns by user
  getTurnsByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT t.turn_id, t.queue_number, t.requested_at, t.desired_pickup,
                 ts.status_name, ts.status_id,
                 b.name as branch_name, b.address as branch_address,
                 tick.ticket_id, tick.total_amount
          FROM Turn t
          INNER JOIN TurnStatus ts ON t.status_id = ts.status_id
          INNER JOIN Branch b ON t.branch_id = b.branch_id
          INNER JOIN Ticket tick ON t.ticket_id = tick.ticket_id
          WHERE t.user_id = @userId
          ORDER BY t.requested_at DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting turns by user:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving turns',
        error: error.message
      });
    }
  }
};

module.exports = turnController;
