// src/config/database.js
const { sequelize, connectDB, config } = require('./db');

module.exports = {
  sequelize,
  connectDB,
  config
};
