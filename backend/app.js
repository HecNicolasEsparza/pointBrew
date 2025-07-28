var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const { connectDB } = require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var branchesRouter = require('./routes/branches');
var storesRouter = require('./routes/stores');
var productsRouter = require('./routes/products');
var ticketsRouter = require('./routes/tickets');
var turnsRouter = require('./routes/turns');
var catalogRouter = require('./routes/catalog');

var app = express();

// Connect to database
connectDB().catch(console.error);

// Enable CORS
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/stores', storesRouter);
app.use('/api/products', productsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/turns', turnsRouter);
app.use('/api/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: 'The requested resource does not exist'
  });
});

// error handler for API
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const isDevelopment = req.app.get('env') === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: isDevelopment ? err.stack : 'Something went wrong!'
  });
});

module.exports = app;
