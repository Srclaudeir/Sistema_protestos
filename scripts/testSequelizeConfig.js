// scripts/testSequelizeConfig.js
require('dotenv').config({ path: '../backend/.env' });

const { Sequelize } = require('sequelize');

// Database configuration per environment
const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'protestos_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    },
    logging: false
  }
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('Environment:', env);
console.log('DB Config:', dbConfig);

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging,
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
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

testConnection();