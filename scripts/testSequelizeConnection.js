// scripts/testSequelizeConnection.js
require('dotenv').config({ path: '../backend/.env' });

const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'protestos_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Tokocla123$$',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function testConnection() {
  try {
    console.log('Testing Sequelize connection...');
    console.log('DB Config:', {
      database: process.env.DB_NAME || 'protestos_db',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD ? '***' : '(not set)',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306
    });
    
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

testConnection();