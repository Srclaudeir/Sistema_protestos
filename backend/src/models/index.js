// src/models/index.js
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

// Initialize models object
const models = {};

// Read all model files
const modelsDir = __dirname;
const modelFiles = fs.readdirSync(modelsDir).filter(file => {
  return (
    file.indexOf('.') !== 0 &&
    file !== 'index.js' &&
    file.slice(-3) === '.js'
  );
});

// Import all models
modelFiles.forEach(file => {
  const model = require(path.join(modelsDir, file));
  models[model.name] = model;
});

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Add sequelize instance to models object
models.sequelize = sequelize;

module.exports = models;