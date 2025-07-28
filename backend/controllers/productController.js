const { getPool, sql } = require('../config/database');

const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const pool = getPool();
      const result = await pool.request()
        .query(`
          SELECT p.product_id, p.name, p.price, p.available, p.created_at, p.updated_at,
                 s.name as store_name, s.store_id,
                 c.name as category_name, c.category_id,
                 b.name as branch_name
          FROM Product p
          INNER JOIN Store s ON p.store_id = s.store_id
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          LEFT JOIN Category c ON p.category_id = c.category_id
          ORDER BY p.created_at DESC
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving products',
        error: error.message
      });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('productId', sql.Int, id)
        .query(`
          SELECT p.product_id, p.name, p.price, p.available, p.created_at, p.updated_at,
                 s.name as store_name, s.store_id,
                 c.name as category_name, c.category_id,
                 b.name as branch_name
          FROM Product p
          INNER JOIN Store s ON p.store_id = s.store_id
          INNER JOIN Branch b ON s.branch_id = b.branch_id
          LEFT JOIN Category c ON p.category_id = c.category_id
          WHERE p.product_id = @productId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving product',
        error: error.message
      });
    }
  },

  // Get products by store
  getProductsByStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('storeId', sql.Int, storeId)
        .query(`
          SELECT p.product_id, p.name, p.price, p.available, p.created_at, p.updated_at,
                 c.name as category_name, c.category_id
          FROM Product p
          LEFT JOIN Category c ON p.category_id = c.category_id
          WHERE p.store_id = @storeId AND p.available = 1
          ORDER BY p.name
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting products by store:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving products',
        error: error.message
      });
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    try {
      const { store_id, category_id, name, price, available = true } = req.body;

      if (!store_id || !name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: store_id, name, price'
        });
      }

      const pool = getPool();
      
      const result = await pool.request()
        .input('storeId', sql.Int, store_id)
        .input('categoryId', sql.Int, category_id || null)
        .input('name', sql.VarChar(100), name)
        .input('price', sql.Decimal(10, 2), price)
        .input('available', sql.Bit, available)
        .query(`
          INSERT INTO Product (store_id, category_id, name, price, available)
          OUTPUT INSERTED.product_id, INSERTED.store_id, INSERTED.category_id, 
                 INSERTED.name, INSERTED.price, INSERTED.available, INSERTED.created_at
          VALUES (@storeId, @categoryId, @name, @price, @available)
        `);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { store_id, category_id, name, price, available } = req.body;

      const pool = getPool();
      
      const result = await pool.request()
        .input('productId', sql.Int, id)
        .input('storeId', sql.Int, store_id)
        .input('categoryId', sql.Int, category_id || null)
        .input('name', sql.VarChar(100), name)
        .input('price', sql.Decimal(10, 2), price)
        .input('available', sql.Bit, available)
        .query(`
          UPDATE Product 
          SET store_id = @storeId,
              category_id = @categoryId,
              name = @name, 
              price = @price,
              available = @available,
              updated_at = GETDATE()
          OUTPUT INSERTED.product_id, INSERTED.store_id, INSERTED.category_id,
                 INSERTED.name, INSERTED.price, INSERTED.available, INSERTED.updated_at
          WHERE product_id = @productId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('productId', sql.Int, id)
        .query(`DELETE FROM Product WHERE product_id = @productId`);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  }
};

module.exports = productController;
