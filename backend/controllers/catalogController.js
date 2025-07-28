const { getPool, sql } = require('../config/database');

const catalogController = {
  // Get all roles
  getRoles: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query('SELECT role_id, role_name FROM Role ORDER BY role_name');
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving roles',
        error: error.message
      });
    }
  },

  // Get all payment methods
  getPaymentMethods: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query('SELECT method_id, method_name FROM PaymentMethod ORDER BY method_name');
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving payment methods',
        error: error.message
      });
    }
  },

  // Get all payment statuses
  getPaymentStatuses: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query('SELECT status_id, status_name FROM PaymentStatus ORDER BY status_name');
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting payment statuses:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving payment statuses',
        error: error.message
      });
    }
  },

  // Get all turn statuses
  getTurnStatuses: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query('SELECT status_id, status_name FROM TurnStatus ORDER BY status_name');
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting turn statuses:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving turn statuses',
        error: error.message
      });
    }
  },

  // Get all categories
  getCategories: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query('SELECT category_id, name FROM Category ORDER BY name');
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving categories',
        error: error.message
      });
    }
  },

  // Create new category
  createCategory: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: name'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('name', sql.VarChar(50), name)
        .query(`
          INSERT INTO Category (name)
          OUTPUT INSERTED.category_id, INSERTED.name
          VALUES (@name)
        `);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.number === 2627) { // Unique constraint violation
        res.status(409).json({
          success: false,
          message: 'Category name already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error creating category',
          error: error.message
        });
      }
    }
  }
};

module.exports = catalogController;
