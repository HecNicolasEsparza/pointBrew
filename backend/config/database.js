const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=PointBrewDB;Trusted_Connection=yes;',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      console.log('Attempting to connect with config:', JSON.stringify(config, null, 2));
      pool = await sql.connect(config);
      console.log('Connected to SQL Server successfully!');
    }
    return pool;
  } catch (err) {
    console.error('Database connection failed:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', err);
    throw err;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return pool;
};

const closeDB = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
};

module.exports = {
  connectDB,
  getPool,
  closeDB,
  sql
};
