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
      const { full_name, email, password, role_id } = req.body;

      if (!full_name || !email || !password || !role_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: full_name, email, password, role_id'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('fullName', sql.VarChar(100), full_name)
        .input('email', sql.VarChar(100), email)
        .input('password', sql.VarChar(255), password)
        .input('roleId', sql.Int, role_id)
        .query(`
          INSERT INTO [User] (full_name, email, password, role_id)
          OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.role_id, INSERTED.created_at
          VALUES (@fullName, @email, @password, @roleId)
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

  // Update user role
  updateUserRole: async (req, res) => {
    try {
      const userId = req.user.user_id; // Get from authenticated user
      const { newRole } = req.body;
      
      if (!newRole || (newRole !== 'Customer' && newRole !== 'Employee')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Only Customer and Employee roles are allowed for self-update.'
        });
      }

      const pool = getPool();
      
      // Get current user data
      const currentUserResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT u.user_id, u.full_name, u.email, r.role_name, r.role_id
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE u.user_id = @userId
        `);

      if (currentUserResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const currentUser = currentUserResult.recordset[0];
      
      // Check if user is Admin - Admins cannot change their role
      if (currentUser.role_name === 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Admins cannot change their role'
        });
      }

      // Check if user is already in the requested role
      if (currentUser.role_name === newRole) {
        return res.status(400).json({
          success: false,
          message: `You are already a ${newRole}`
        });
      }

      // Get the role_id for the new role
      const roleResult = await pool.request()
        .input('roleName', sql.VarChar, newRole)
        .query(`SELECT role_id FROM Role WHERE role_name = @roleName`);

      if (roleResult.recordset.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      const newRoleId = roleResult.recordset[0].role_id;

      // Update user role
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('roleId', sql.Int, newRoleId)
        .query(`
          UPDATE [User] 
          SET role_id = @roleId, updated_at = GETDATE()
          WHERE user_id = @userId
        `);

      // Get updated user data to return
      const updatedUserResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT u.user_id, u.full_name, u.email, r.role_name, r.role_id, u.created_at
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE u.user_id = @userId
        `);

      res.json({
        success: true,
        message: `Role updated successfully to ${newRole}`,
        data: updatedUserResult.recordset[0]
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role',
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
