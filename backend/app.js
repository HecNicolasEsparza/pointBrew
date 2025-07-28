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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
