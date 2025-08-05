const { getPool, sql } = require('../config/database');

const storeEmployeeController = {
  // Get all employees for a specific store
  getStoreEmployees: async (req, res) => {
    try {
      const { storeId } = req.params;
      const pool = getPool();
      
      // Simple query first to test
      const result = await pool.request()
        .input('storeId', sql.Int, storeId)
        .query(`
          SELECT 
            u.user_id,
            u.full_name,
            u.email,
            u.image_url,
            se.position,
            se.hire_date,
            se.is_active,
            se.is_manager,
            se.created_at
          FROM [User] u
          INNER JOIN StoreEmployee se ON u.user_id = se.user_id
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE se.store_id = @storeId AND r.role_name = 'Employee' AND se.is_active = 1
          ORDER BY se.is_manager DESC, u.full_name
        `);
      
      console.log(`Found ${result.recordset.length} employees for store ${storeId}`);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting store employees:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving store employees',
        error: error.message
      });
    }
  },

  // Search users by email or name to add as employees
  searchUsers: async (req, res) => {
    try {
      const { query } = req.query;
      const { storeId } = req.params;
      
      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('searchQuery', sql.VarChar, `%${query}%`)
        .input('storeId', sql.Int, storeId)
        .query(`
          SELECT 
            u.user_id,
            u.full_name,
            u.email,
            u.image_url,
            r.role_name
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE (u.full_name LIKE @searchQuery OR u.email LIKE @searchQuery)
            AND r.role_name = 'Employee'
            AND u.user_id NOT IN (
              SELECT se.user_id 
              FROM StoreEmployee se 
              WHERE se.store_id = @storeId AND se.is_active = 1
            )
          ORDER BY u.full_name
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching users',
        error: error.message
      });
    }
  },

  // Add employee to store
  addStoreEmployee: async (req, res) => {
    try {
      const { storeId } = req.params;
      const { userId, position } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const pool = getPool();
      
      // Check if user exists and is an employee
      const userCheck = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT u.user_id, u.full_name, r.role_name
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE u.user_id = @userId AND r.role_name = 'Employee'
        `);

      if (userCheck.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found or not an employee'
        });
      }

      // Check if user is already assigned to this store
      const existingAssignment = await pool.request()
        .input('userId', sql.Int, userId)
        .input('storeId', sql.Int, storeId)
        .query(`
          SELECT id FROM StoreEmployee 
          WHERE user_id = @userId AND store_id = @storeId
        `);

      if (existingAssignment.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee is already assigned to this store'
        });
      }

      // Add employee to store
      await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('userId', sql.Int, userId)
        .input('position', sql.VarChar, position || 'Empleado')
        .query(`
          INSERT INTO StoreEmployee (store_id, user_id, position, hire_date, is_active, is_manager)
          VALUES (@storeId, @userId, @position, GETDATE(), 1, 0)
        `);

      // Get the added employee data
      const newEmployee = await pool.request()
        .input('userId', sql.Int, userId)
        .input('storeId', sql.Int, storeId)
        .query(`
          SELECT 
            u.user_id,
            u.full_name,
            u.email,
            u.image_url,
            se.position,
            se.hire_date,
            se.is_active,
            se.is_manager,
            se.created_at
          FROM [User] u
          INNER JOIN StoreEmployee se ON u.user_id = se.user_id
          WHERE se.store_id = @storeId AND se.user_id = @userId
        `);

      res.json({
        success: true,
        message: 'Employee added to store successfully',
        data: newEmployee.recordset[0]
      });
    } catch (error) {
      console.error('Error adding store employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding employee to store',
        error: error.message
      });
    }
  },

  // Remove employee from store
  removeStoreEmployee: async (req, res) => {
    try {
      const { storeId, userId } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('userId', sql.Int, userId)
        .query(`
          UPDATE StoreEmployee 
          SET is_active = 0, updated_at = GETDATE()
          WHERE store_id = @storeId AND user_id = @userId
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee assignment not found'
        });
      }

      res.json({
        success: true,
        message: 'Employee removed from store successfully'
      });
    } catch (error) {
      console.error('Error removing store employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing employee from store',
        error: error.message
      });
    }
  },

  // Update employee position or manager status
  updateStoreEmployee: async (req, res) => {
    try {
      const { storeId, userId } = req.params;
      const { position, isManager } = req.body;
      const pool = getPool();
      
      const result = await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('userId', sql.Int, userId)
        .input('position', sql.VarChar, position)
        .input('isManager', sql.Bit, isManager)
        .query(`
          UPDATE StoreEmployee 
          SET position = @position, is_manager = @isManager, updated_at = GETDATE()
          WHERE store_id = @storeId AND user_id = @userId AND is_active = 1
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee assignment not found'
        });
      }

      res.json({
        success: true,
        message: 'Employee updated successfully'
      });
    } catch (error) {
      console.error('Error updating store employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating employee',
        error: error.message
      });
    }
  },

  // Get stores where a user works as employee
  getEmployeeStores: async (req, res) => {
    try {
      const userId = req.user.user_id; // Get from authenticated user
      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            s.store_id,
            s.name,
            s.description,
            s.image_url,
            s.created_at,
            s.updated_at,
            b.name as branch_name,
            b.address as branch_address,
            se.position,
            se.is_manager,
            se.hire_date
          FROM Store s
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          INNER JOIN StoreEmployee se ON s.store_id = se.store_id
          WHERE se.user_id = @userId AND se.is_active = 1
          ORDER BY s.name
        `);
      
      console.log(`Found ${result.recordset.length} stores for employee ${userId}`);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting employee stores:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving employee stores',
        error: error.message
      });
    }
  }
};

module.exports = storeEmployeeController;
