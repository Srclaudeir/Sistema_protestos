// scripts/testConnection.js
const { sequelize } = require('../backend/src/config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // List tables
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('Tables in database:');
    results.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Count records in each table
    console.log('\nRecord counts:');
    for (const table of results) {
      const tableName = Object.values(table)[0];
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`${tableName}: ${countResult[0].count}`);
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

testConnection();