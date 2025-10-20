// src/config/db.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { Sequelize } = require("sequelize");

// Database configuration per environment
const config = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "protestos_db",
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    dialectOptions: {
      bigNumberStrings: true,
      timezone: "-03:00", // Horário de Brasília (UTC-3)
    },
    timezone: "-03:00",
    logging: false,
  },
  test: {
    username: process.env.TEST_DB_USER || "root",
    password: process.env.TEST_DB_PASSWORD || "password",
    database: process.env.TEST_DB_NAME || "protestos_test",
    host: process.env.TEST_DB_HOST || "127.0.0.1",
    port: Number(process.env.TEST_DB_PORT) || 3306,
    dialect: "mysql",
    dialectOptions: {
      bigNumberStrings: true,
      timezone: "-03:00",
    },
    timezone: "-03:00",
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    dialectOptions: {
      bigNumberStrings: true,
      timezone: "-03:00",
    },
    timezone: "-03:00",
    logging: false,
  },
};

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`Database configuration not found for environment "${env}"`);
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    timezone: dbConfig.timezone,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("[database] Connection established");

    if (process.env.NODE_ENV !== "production") {
      // Usar 'alter: false' para não modificar tabelas existentes
      // Use migrations SQL para mudanças na estrutura do banco
      await sequelize.sync({ alter: false });
      console.log("[database] Models synced");
    }
  } catch (error) {
    console.error("[database] Unable to connect:", error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB,
  config,
};
