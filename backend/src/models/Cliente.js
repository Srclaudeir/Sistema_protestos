// src/models/Cliente.js
const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Cliente extends Model {
  static associate(models) {
    // Cliente has many Contratos
    Cliente.hasMany(models.Contrato, {
      foreignKey: 'cliente_id',
      as: 'contratos'
    });
  }
}

Cliente.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome é obrigatório'
      }
    }
  },
  cpf_cnpj: {
    type: DataTypes.STRING(18),
    unique: true,
    allowNull: true,
    validate: {
      isValidLength(value) {
        if (value && value.length !== 11 && value.length !== 14) {
          throw new Error('CPF/CNPJ deve ter 11 (CPF) ou 14 (CNPJ) dígitos.');
        }
      }
    }
  },
  tipo_conta: {
    type: DataTypes.ENUM('PF', 'PJ'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['PF', 'PJ']],
        msg: 'Tipo de conta deve ser PF ou PJ'
      }
    }
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Cliente',
  tableName: 'clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = Cliente;