const { getPool, sql, connectDB } = require('./config/database');

async function checkDatabase() {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');
    
    const pool = getPool();
    
    // Check if StoreEmployee table exists
    console.log('Checking if StoreEmployee table exists...');
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'StoreEmployee'
    `);
    
    if (tableCheck.recordset.length === 0) {
      console.log('❌ StoreEmployee table does not exist');
      console.log('Creating StoreEmployee table...');
      
      await pool.request().query(`
        CREATE TABLE StoreEmployee (
          id              INT           PRIMARY KEY IDENTITY,
          store_id        INT           NOT NULL
            REFERENCES Store(store_id),
          user_id         INT           NOT NULL
            REFERENCES [User](user_id),
          position        VARCHAR(50)   NULL,
          hire_date       DATE          NOT NULL DEFAULT GETDATE(),
          is_active       BIT           NOT NULL DEFAULT 1,
          is_manager      BIT           NOT NULL DEFAULT 0,
          created_at      DATETIME      DEFAULT GETDATE(),
          updated_at      DATETIME      DEFAULT GETDATE(),
          UNIQUE(store_id, user_id)
        )
      `);
      
      console.log('✅ StoreEmployee table created successfully');
    } else {
      console.log('✅ StoreEmployee table exists');
      
      // Check table structure
      const columns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'StoreEmployee'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('Table structure:');
      columns.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
      
      // Check if position and is_manager columns exist
      const hasPosition = columns.recordset.some(col => col.COLUMN_NAME === 'position');
      const hasIsManager = columns.recordset.some(col => col.COLUMN_NAME === 'is_manager');
      
      if (!hasPosition) {
        console.log('Adding position column...');
        await pool.request().query(`
          ALTER TABLE StoreEmployee 
          ADD position VARCHAR(50) NULL
        `);
        console.log('✅ position column added');
      }
      
      if (!hasIsManager) {
        console.log('Adding is_manager column...');
        await pool.request().query(`
          ALTER TABLE StoreEmployee 
          ADD is_manager BIT NOT NULL DEFAULT 0
        `);
        console.log('✅ is_manager column added');
      }
    }
    
    // Check for test data
    console.log('\nChecking existing data...');
    const employeeCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM StoreEmployee
    `);
    console.log(`Found ${employeeCount.recordset[0].count} employee assignments`);
    
    console.log('\n✅ Database check completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();
