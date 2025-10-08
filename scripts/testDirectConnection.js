// scripts/testDirectConnection.js
const mysql = require('mysql2');

// Database configuration
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Tokocla123$$',
  database: 'protestos_db'
};

console.log('Testing direct MySQL connection...');
console.log('Config:', config);

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Connected to MySQL successfully!');
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error querying tables:', err);
      connection.end();
      return;
    }
    
    console.log('Tables:');
    results.forEach(row => {
      console.log('- ' + Object.values(row)[0]);
    });
    
    connection.end();
  });
});