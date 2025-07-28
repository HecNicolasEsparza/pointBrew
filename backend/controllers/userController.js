const { getPool, sql } = require('../config/database');

const userController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query(`
          SELECT u.user_id, u.full_name, u.email, r.role_name, u.created_at, u.updated_at
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          ORDER BY u.created_at DESC
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving users',
        error: error.message
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, id)
        .query(`
          SELECT u.user_id, u.full_name, u.email, r.role_name, u.created_at, u.updated_at
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE u.user_id = @userId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving user',
        error: error.message
      });
    }
  },

  // Create new user
  createUser: async (req, res) => {
    try {
      const { full_name, email, role_id } = req.body;

      if (!full_name || !email || !role_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: full_name, email, role_id'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('fullName', sql.VarChar(100), full_name)
        .input('email', sql.VarChar(100), email)
        .input('roleId', sql.Int, role_id)
        .query(`
          INSERT INTO [User] (full_name, email, role_id)
          OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.role_id, INSERTED.created_at
          VALUES (@fullName, @email, @roleId)
        `);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.number === 2627) { // Unique constraint violation
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error creating user',
          error: error.message
        });
      }
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { full_name, email, role_id } = req.body;

      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, id)
        .input('fullName', sql.VarChar(100), full_name)
        .input('email', sql.VarChar(100), email)
        .input('roleId', sql.Int, role_id)
        .query(`
          UPDATE [User] 
          SET full_name = @fullName, 
              email = @email, 
              role_id = @roleId, 
              updated_at = GETDATE()
          OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.role_id, INSERTED.updated_at
          WHERE user_id = @userId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, id)
        .query(`DELETE FROM [User] WHERE user_id = @userId`);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }
};

module.exports = userController;
