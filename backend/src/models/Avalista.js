// src/models/Avalista.js
const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Avalista extends Model {
  static associate(models) {
    // Avalista belongs to Protesto
    Avalista.belongsTo(models.Protesto, {
      foreignKey: 'protesto_id',
      as: 'protesto'
    });
  }
}

Avalista.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cpf_cnpj: {
    type: DataTypes.STRING(18),
    allowNull: true,
    validate: {
      is: {
        args: [/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/],
        msg: 'CPF/CNPJ inválido'
      }
    }
  }
}, {
  sequelize,
  modelName: 'Avalista',
  tableName: 'avalistas',
  timestamps: false,
  underscored: true
});

module.exports = Avalista;