const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { getPool, sql } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { full_name, email, password } = req.body;
      
      const pool = getPool();
      
      // Check if user already exists
      const existingUser = await pool.request()
        .input('email', sql.VarChar(100), email)
        .query('SELECT user_id FROM [User] WHERE email = @email');

      if (existingUser.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with default role (assuming role_id 2 is for regular users)
      const result = await pool.request()
        .input('fullName', sql.VarChar(100), full_name)
        .input('email', sql.VarChar(100), email)
        .input('password', sql.VarChar(255), hashedPassword)
        .input('roleId', sql.Int, 2) // Default role
        .query(`
          INSERT INTO [User] (full_name, email, password, role_id)
          OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.role_id, INSERTED.created_at
          VALUES (@fullName, @email, @password, @roleId)
        `);

      const newUser = result.recordset[0];

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.user_id,
          email: newUser.email,
          role_id: newUser.role_id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Get user with role name
      const userWithRole = await pool.request()
        .input('userId', sql.Int, newUser.user_id)
        .query(`
          SELECT u.user_id, u.full_name, u.email, u.role_id, r.role_name, u.created_at
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE u.user_id = @userId
        `);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userWithRole.recordset[0],
          token
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registrando usuario',
        error: error.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      
      const pool = getPool();
      
      // Find user by email
      const result = await pool.request()
        .input('email', sql.VarChar(100), email)
        .query(`
          SELECT u.user_id, u.full_name, u.email, u.password, u.role_id, r.role_name
          FROM [User] u
          INNER JOIN Role r ON u.role_id = r.role_id
          WHERE u.email = @email
        `);

      if (result.recordset.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const user = result.recordset[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.user_id,
          email: user.email,
          role_id: user.role_id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el login',
        error: error.message
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      // User is already available from auth middleware
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo perfil',
        error: error.message
      });
    }
  },

  // Logout (client-side token removal, but we can track it server-side if needed)
  logout: async (req, res) => {
    try {
      // In a stateless JWT setup, logout is typically handled client-side
      // You could implement a token blacklist here if needed
      res.json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en logout',
        error: error.message
      });
    }
  }
};

module.exports = authController;
