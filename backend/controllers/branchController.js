const { getPool, sql } = require('../config/database');

const branchController = {
  // Get all branches
  getAllBranches: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query(`
          SELECT branch_id, name, address, created_at, updated_at
          FROM Branch
          ORDER BY created_at DESC
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting branches:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving branches',
        error: error.message
      });
    }
  },

  // Get branch by ID
  getBranchById: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('branchId', sql.Int, id)
        .query(`
          SELECT branch_id, name, address, created_at, updated_at
          FROM Branch
          WHERE branch_id = @branchId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error getting branch:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving branch',
        error: error.message
      });
    }
  },

  // Create new branch
  createBranch: async (req, res) => {
    try {
      const { name, address } = req.body;

      if (!name || !address) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, address'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('name', sql.VarChar(100), name)
        .input('address', sql.VarChar(150), address)
        .query(`
          INSERT INTO Branch (name, address)
          OUTPUT INSERTED.branch_id, INSERTED.name, INSERTED.address, INSERTED.created_at
          VALUES (@name, @address)
        `);

      res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error creating branch:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating branch',
        error: error.message
      });
    }
  },

  // Update branch
  updateBranch: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, address } = req.body;

      const pool = getPool();
      
      const result = await pool.request()
        .input('branchId', sql.Int, id)
        .input('name', sql.VarChar(100), name)
        .input('address', sql.VarChar(150), address)
        .query(`
          UPDATE Branch 
          SET name = @name, 
              address = @address, 
              updated_at = GETDATE()
          OUTPUT INSERTED.branch_id, INSERTED.name, INSERTED.address, INSERTED.updated_at
          WHERE branch_id = @branchId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      res.json({
        success: true,
        message: 'Branch updated successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating branch',
        error: error.message
      });
    }
  },

  // Delete branch
  deleteBranch: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('branchId', sql.Int, id)
        .query(`DELETE FROM Branch WHERE branch_id = @branchId`);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      res.json({
        success: true,
        message: 'Branch deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting branch',
        error: error.message
      });
    }
  },

  // Get stores by branch
  getStoresByBranch: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('branchId', sql.Int, id)
        .query(`
          SELECT s.store_id, s.name, s.description, s.created_at, s.updated_at
          FROM Store s
          WHERE s.branch_id = @branchId
          ORDER BY s.created_at DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting stores by branch:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving stores',
        error: error.message
      });
    }
  }
};

module.exports = branchController;
