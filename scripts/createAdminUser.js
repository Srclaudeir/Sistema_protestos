// scripts/createAdminUser.js
const mysql = require('mysql2');

// Database configuration
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Tokocla123$$',
  database: 'protestos_db'
};

console.log('Creating admin user...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Connected to MySQL successfully!');
  
  // Check if admin user exists
  connection.query('SELECT * FROM usuarios WHERE username = ?', ['admin'], (err, results) => {
    if (err) {
      console.error('Error querying usuarios table:', err);
      connection.end();
      return;
    }
    
    if (results.length > 0) {
      console.log('Admin user already exists:');
      console.log(results[0]);
      connection.end();
      return;
    }
    
    console.log('Admin user not found. Creating...');
    
    // Create admin user with all required fields
    const insertQuery = `
      INSERT INTO usuarios (username, email, password, nome, role, ativo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const adminData = [
      'admin',
      'admin@protestos.com',
      '$2a$12$w8NR4S.k3dC2.jZQ.3hB.eKckq1VMF3tqoZQ2f5w8oL60N9Kq3y3W', // bcrypt hash of 'admin123'
      'Administrador do Sistema',
      'admin',
      1
    ];
    
    connection.query(insertQuery, adminData, (err, result) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('Admin user created successfully!');
        console.log('User ID:', result.insertId);
      }
      
      connection.end();
    });
  });
});