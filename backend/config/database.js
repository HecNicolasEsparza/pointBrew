const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'PB_admin',
  password: process.env.DB_PASSWORD || '1234',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'PointBrewDB',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false, // Use encryption
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true, // Trust self-signed certificates
    enableArithAbort: true
  },
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
      pool = await sql.connect(config);
      console.log('Connected to SQL Server');
    }
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
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
