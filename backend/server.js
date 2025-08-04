const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { join } = require('path');
const { fileURLToPath } = require('url');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const branchRoutes = require('./routes/branchRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Importar las rutas de categorías
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
// Usar las rutas de categorías
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(join(__dirname, 'public')));

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

module.exports = app;