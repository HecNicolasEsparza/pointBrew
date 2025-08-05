const { getPool, sql, connectDB } = require('./config/database');

async function assignEmployeeToStore() {
  try {
    await connectDB();
    console.log('✅ Connected to database');
    
    const pool = getPool();
    
    // Get the Employee user (Prueba)
    const employeeResult = await pool.request().query(`
      SELECT u.user_id, u.full_name, u.email, r.role_name
      FROM [User] u
      INNER JOIN Role r ON u.role_id = r.role_id
      WHERE r.role_name = 'Employee'
    `);
    
    if (employeeResult.recordset.length === 0) {
      console.log('❌ No employee users found');
      process.exit(1);
    }
    
    const employee = employeeResult.recordset[0];
    console.log(`Found employee: ${employee.full_name} (${employee.email})`);
    
    // Get available stores
    const storesResult = await pool.request().query(`
      SELECT s.store_id, s.name, b.name as branch_name
      FROM Store s
      INNER JOIN Branch b ON s.branch_id = b.branch_id
    `);
    
    if (storesResult.recordset.length === 0) {
      console.log('❌ No stores found');
      process.exit(1);
    }
    
    const store = storesResult.recordset[0];
    console.log(`Found store: ${store.name} (ID: ${store.store_id})`);
    
    // Check if employee is already assigned
    const existingAssignment = await pool.request()
      .input('userId', sql.Int, employee.user_id)
      .input('storeId', sql.Int, store.store_id)
      .query(`
        SELECT id FROM StoreEmployee 
        WHERE user_id = @userId AND store_id = @storeId
      `);
    
    if (existingAssignment.recordset.length > 0) {
      console.log('✅ Employee is already assigned to this store');
    } else {
      // Assign employee to store
      await pool.request()
        .input('storeId', sql.Int, store.store_id)
        .input('userId', sql.Int, employee.user_id)
        .input('position', sql.VarChar, 'Cajero')
        .query(`
          INSERT INTO StoreEmployee (store_id, user_id, position, hire_date, is_active, is_manager)
          VALUES (@storeId, @userId, @position, GETDATE(), 1, 0)
        `);
      
      console.log(`✅ Assigned ${employee.full_name} to ${store.name} as Cajero`);
    }
    
    // Verify the assignment
    const verification = await pool.request()
      .input('userId', sql.Int, employee.user_id)
      .query(`
        SELECT 
          s.store_id,
          s.name as store_name,
          b.name as branch_name,
          se.position,
          se.is_manager,
          se.hire_date
        FROM Store s
        INNER JOIN Branch b ON s.branch_id = b.branch_id
        INNER JOIN StoreEmployee se ON s.store_id = se.store_id
        WHERE se.user_id = @userId AND se.is_active = 1
      `);
    
    console.log(`\n✅ Employee assignments:`);
    verification.recordset.forEach(assignment => {
      console.log(`  - ${assignment.store_name} (${assignment.branch_name}) as ${assignment.position}${assignment.is_manager ? ' - Manager' : ''}`);
    });
    
    console.log('\n🎯 Now you can test:');
    console.log('1. Login as "Prueba" (example@mamarre.com)');
    console.log('2. Go to the home page');
    console.log('3. You should only see the stores where you work');
    console.log('4. The "Registrar una tienda" button should be hidden');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Assignment failed:', error);
    process.exit(1);
  }
}

assignEmployeeToStore();
