const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists in database
    const pool = getPool();
    const result = await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .query(`
        SELECT u.user_id, u.full_name, u.email, r.role_name, u.created_at
        FROM [User] u
        INNER JOIN Role r ON u.role_id = r.role_id
        WHERE u.user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = result.recordset[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};
