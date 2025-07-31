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
  },

  // Register new store and make user admin
  registerUserStore: async (req, res) => {
    try {
      const { storeName, storeDescription, branchName, branchAddress } = req.body;
      const userId = req.user.userId; // Del middleware de autenticación

      // Validación básica
      if (!storeName || !branchName || !branchAddress) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de tienda, sucursal y dirección son requeridos'
        });
      }

      const pool = getPool();
      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        // 1. Crear la sucursal (Branch)
        const branchResult = await transaction.request()
          .input('name', sql.VarChar(100), branchName)
          .input('address', sql.VarChar(150), branchAddress)
          .query(`
            INSERT INTO Branch (name, address) 
            OUTPUT INSERTED.branch_id
            VALUES (@name, @address)
          `);

        const branchId = branchResult.recordset[0].branch_id;

        // 2. Crear la tienda (Store)
        const storeResult = await transaction.request()
          .input('branch_id', sql.Int, branchId)
          .input('name', sql.VarChar(100), storeName)
          .input('description', sql.VarChar(50), storeDescription || null)
          .query(`
            INSERT INTO Store (branch_id, name, description) 
            OUTPUT INSERTED.store_id
            VALUES (@branch_id, @name, @description)
          `);

        const storeId = storeResult.recordset[0].store_id;

        // 3. Actualizar el rol del usuario a Admin (role_id = 1)
        await transaction.request()
          .input('user_id', sql.Int, userId)
          .input('role_id', sql.Int, 1) // 1 = Admin según el schema
          .query(`
            UPDATE [User] 
            SET role_id = @role_id, updated_at = GETDATE()
            WHERE user_id = @user_id
          `);

        await transaction.commit();

        res.status(201).json({
          success: true,
          message: 'Tienda registrada exitosamente. Ahora eres administrador.',
          data: {
            storeId,
            branchId,
            storeName,
            branchName
          }
        });

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error registrando tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = storeController;
