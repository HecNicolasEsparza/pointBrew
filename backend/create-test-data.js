const { getPool, sql, connectDB } = require('./config/database');

async function createTestData() {
  try {
    await connectDB();
    console.log('✅ Connected to database');
    
    const pool = getPool();
    
    // Check for existing Employee users
    console.log('Checking for Employee users...');
    const employees = await pool.request().query(`
      SELECT u.user_id, u.full_name, u.email, r.role_name
      FROM [User] u
      INNER JOIN Role r ON u.role_id = r.role_id
      WHERE r.role_name = 'Employee'
    `);
    
    console.log(`Found ${employees.recordset.length} employees:`);
    employees.recordset.forEach(emp => {
      console.log(`  - ${emp.full_name} (${emp.email})`);
    });
    
    // If no employees exist, create some test employees
    if (employees.recordset.length === 0) {
      console.log('\nCreating test employee users...');
      
      // Get Employee role ID
      const roleResult = await pool.request().query(`
        SELECT role_id FROM Role WHERE role_name = 'Employee'
      `);
      const employeeRoleId = roleResult.recordset[0].role_id;
      
      // Create test employees
      const testEmployees = [
        { name: 'Juan Pérez', email: 'juan.perez@employee.com' },
        { name: 'María González', email: 'maria.gonzalez@employee.com' },
        { name: 'Carlos López', email: 'carlos.lopez@employee.com' }
      ];
      
      for (const emp of testEmployees) {
        await pool.request()
          .input('fullName', sql.VarChar, emp.name)
          .input('email', sql.VarChar, emp.email)
          .input('password', sql.VarChar, '$2b$10$defaulthashedpassword') // Default password
          .input('roleId', sql.Int, employeeRoleId)
          .query(`
            INSERT INTO [User] (full_name, email, password, role_id)
            VALUES (@fullName, @email, @password, @roleId)
          `);
        console.log(`  ✅ Created employee: ${emp.name}`);
      }
    }
    
    // Check for stores
    console.log('\nChecking for available stores...');
    const stores = await pool.request().query(`
      SELECT s.store_id, s.name, b.name as branch_name
      FROM Store s
      INNER JOIN Branch b ON s.branch_id = b.branch_id
    `);
    
    console.log(`Found ${stores.recordset.length} stores:`);
    stores.recordset.forEach(store => {
      console.log(`  - Store ID ${store.store_id}: ${store.name} (${store.branch_name})`);
    });
    
    console.log('\n✅ Test data check completed');
    console.log('\nYou can now try:');
    console.log('1. Go to http://localhost:3000/store/manage-stores');
    console.log('2. Click "👥 Administrar Empleados" on any store');
    console.log('3. Search for employees to add to your store');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test data creation failed:', error);
    process.exit(1);
  }
}

createTestData();
