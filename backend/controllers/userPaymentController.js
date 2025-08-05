const { getPool, sql } = require('../config/database');

const userPaymentController = {
  // Obtener métodos de pago del usuario
  getUserPaymentMethods: async (req, res) => {
    try {
      const { userId } = req.params;
      const pool = getPool();
      
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            upm.user_payment_id,
            upm.user_id,
            upm.method_id,
            pm.method_name,
            upm.card_holder_name,
            upm.card_number_last4,
            upm.card_expiry,
            upm.card_brand,
            upm.is_default,
            upm.is_active,
            upm.created_at
          FROM UserPaymentMethod upm
          INNER JOIN PaymentMethod pm ON upm.method_id = pm.method_id
          WHERE upm.user_id = @userId AND upm.is_active = 1
          ORDER BY upm.is_default DESC, upm.created_at DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting user payment methods:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving payment methods',
        error: error.message
      });
    }
  },

  // Agregar nuevo método de pago
  addPaymentMethod: async (req, res) => {
    try {
      const { 
        userId, 
        methodId, 
        cardHolderName, 
        cardNumber, 
        cardExpiry, 
        cardBrand,
        isDefault = false 
      } = req.body;

      // Validaciones
      if (!userId || !methodId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, methodId'
        });
      }

      const pool = getPool();
      const transaction = new sql.Transaction(pool);
      
      try {
        await transaction.begin();

        // Obtener últimos 4 dígitos de la tarjeta (si es tarjeta)
        const cardLast4 = cardNumber ? cardNumber.slice(-4) : null;

        // Si es método por defecto, quitar default de otros
        if (isDefault) {
          await transaction.request()
            .input('userId', sql.Int, userId)
            .query('UPDATE UserPaymentMethod SET is_default = 0 WHERE user_id = @userId');
        }

        // Insertar nuevo método
        const result = await transaction.request()
          .input('userId', sql.Int, userId)
          .input('methodId', sql.Int, methodId)
          .input('cardHolderName', sql.VarChar(100), cardHolderName || null)
          .input('cardLast4', sql.VarChar(4), cardLast4)
          .input('cardExpiry', sql.VarChar(7), cardExpiry || null)
          .input('cardBrand', sql.VarChar(20), cardBrand || null)
          .input('isDefault', sql.Bit, isDefault)
          .query(`
            INSERT INTO UserPaymentMethod 
            (user_id, method_id, card_holder_name, card_number_last4, card_expiry, card_brand, is_default)
            OUTPUT INSERTED.user_payment_id
            VALUES (@userId, @methodId, @cardHolderName, @cardLast4, @cardExpiry, @cardBrand, @isDefault)
          `);

        await transaction.commit();

        res.status(201).json({
          success: true,
          message: 'Payment method added successfully',
          data: { userPaymentId: result.recordset[0].user_payment_id }
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      if (error.number === 2627) { // Unique constraint violation
        res.status(409).json({
          success: false,
          message: 'Payment method already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error adding payment method',
          error: error.message
        });
      }
    }
  },

  // Actualizar método de pago
  updatePaymentMethod: async (req, res) => {
    try {
      const { userPaymentId } = req.params;
      const { cardHolderName, cardExpiry, isDefault } = req.body;
      const pool = getPool();
      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        // Si es método por defecto, quitar default de otros
        if (isDefault) {
          const userResult = await transaction.request()
            .input('userPaymentId', sql.Int, userPaymentId)
            .query('SELECT user_id FROM UserPaymentMethod WHERE user_payment_id = @userPaymentId');
          
          if (userResult.recordset.length > 0) {
            const userId = userResult.recordset[0].user_id;
            await transaction.request()
              .input('userId', sql.Int, userId)
              .query('UPDATE UserPaymentMethod SET is_default = 0 WHERE user_id = @userId');
          }
        }

        // Actualizar método
        await transaction.request()
          .input('userPaymentId', sql.Int, userPaymentId)
          .input('cardHolderName', sql.VarChar(100), cardHolderName)
          .input('cardExpiry', sql.VarChar(7), cardExpiry)
          .input('isDefault', sql.Bit, isDefault || false)
          .query(`
            UPDATE UserPaymentMethod 
            SET card_holder_name = @cardHolderName,
                card_expiry = @cardExpiry,
                is_default = @isDefault,
                updated_at = GETDATE()
            WHERE user_payment_id = @userPaymentId
          `);

        await transaction.commit();

        res.json({
          success: true,
          message: 'Payment method updated successfully'
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment method',
        error: error.message
      });
    }
  },

  // Eliminar método de pago (soft delete)
  deletePaymentMethod: async (req, res) => {
    try {
      const { userPaymentId } = req.params;
      const pool = getPool();

      await pool.request()
        .input('userPaymentId', sql.Int, userPaymentId)
        .query('UPDATE UserPaymentMethod SET is_active = 0, updated_at = GETDATE() WHERE user_payment_id = @userPaymentId');

      res.json({
        success: true,
        message: 'Payment method deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting payment method',
        error: error.message
      });
    }
  },

  // Establecer método como predeterminado
  setDefaultPaymentMethod: async (req, res) => {
    try {
      const { userPaymentId } = req.params;
      const pool = getPool();
      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        // Obtener userId del método de pago
        const userResult = await transaction.request()
          .input('userPaymentId', sql.Int, userPaymentId)
          .query('SELECT user_id FROM UserPaymentMethod WHERE user_payment_id = @userPaymentId');

        if (userResult.recordset.length === 0) {
          throw new Error('Payment method not found');
        }

        const userId = userResult.recordset[0].user_id;

        // Quitar default de todos los métodos del usuario
        await transaction.request()
          .input('userId', sql.Int, userId)
          .query('UPDATE UserPaymentMethod SET is_default = 0 WHERE user_id = @userId');

        // Establecer como default el seleccionado
        await transaction.request()
          .input('userPaymentId', sql.Int, userPaymentId)
          .query('UPDATE UserPaymentMethod SET is_default = 1, updated_at = GETDATE() WHERE user_payment_id = @userPaymentId');

        await transaction.commit();

        res.json({
          success: true,
          message: 'Default payment method updated successfully'
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      res.status(500).json({
        success: false,
        message: 'Error setting default payment method',
        error: error.message
      });
    }
  }
};

module.exports = userPaymentController;