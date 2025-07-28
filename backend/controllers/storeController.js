const { getPool, sql } = require('../config/database');

const storeController = {
  // Get all stores
  getAllStores: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query(`
          SELECT s.store_id, s.name, s.description, s.created_at, s.updated_at,
                 b.name as branch_name, b.address as branch_address
          FROM Store s
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          ORDER BY s.created_at DESC
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting stores:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving stores',
        error: error.message
      });
    }
  },

  // Get store by ID
  getStoreById: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('storeId', sql.Int, id)
        .query(`
          SELECT s.store_id, s.name, s.description, s.created_at, s.updated_at,
                 b.name as branch_name, b.address as branch_address
          FROM Store s
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          WHERE s.store_id = @storeId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error getting store:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving store',
        error: error.message
      });
    }
  },

  // Create new store
  createStore: async (req, res) => {
    try {
      const { branch_id, name, description } = req.body;

      if (!branch_id || !name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: branch_id, name'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('branchId', sql.Int, branch_id)
        .input('name', sql.VarChar(100), name)
        .input('description', sql.VarChar(50), description || null)
        .query(`
          INSERT INTO Store (branch_id, name, description)
          OUTPUT INSERTED.store_id, INSERTED.branch_id, INSERTED.name, INSERTED.description, INSERTED.created_at
          VALUES (@branchId, @name, @description)
        `);

      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error creating store:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating store',
        error: error.message
      });
    }
  },

  // Update store
  updateStore: async (req, res) => {
    try {
      const { id } = req.params;
      const { branch_id, name, description } = req.body;

      const pool = getPool();
      
      const result = await pool.request()
        .input('storeId', sql.Int, id)
        .input('branchId', sql.Int, branch_id)
        .input('name', sql.VarChar(100), name)
        .input('description', sql.VarChar(50), description || null)
        .query(`
          UPDATE Store 
          SET branch_id = @branchId,
              name = @name, 
              description = @description, 
              updated_at = GETDATE()
          OUTPUT INSERTED.store_id, INSERTED.branch_id, INSERTED.name, INSERTED.description, INSERTED.updated_at
          WHERE store_id = @storeId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      res.json({
        success: true,
        message: 'Store updated successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error updating store:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating store',
        error: error.message
      });
    }
  },

  // Delete store
  deleteStore: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('storeId', sql.Int, id)
        .query(`DELETE FROM Store WHERE store_id = @storeId`);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      res.json({
        success: true,
        message: 'Store deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting store:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting store',
        error: error.message
      });
    }
  }
};

module.exports = storeController;
