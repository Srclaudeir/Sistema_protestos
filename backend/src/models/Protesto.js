// src/models/Protesto.js
const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Protesto extends Model {
  static associate(models) {
    // Protesto belongs to Contrato
    Protesto.belongsTo(models.Contrato, {
      foreignKey: 'contrato_id',
      as: 'contrato'
    });

    // Protesto has many Avalistas
    Protesto.hasMany(models.Avalista, {
      foreignKey: 'protesto_id',
      as: 'avalistas'
    });
  }
}

Protesto.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  valor_protestado: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Valor protestado deve ser maior que zero'
      }
    }
  },
  numero_parcela: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  data_registro: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Data de registro inválida'
      }
    }
  },
  protocolo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'PROTESTADO',
    validate: {
      isIn: {
        args: [[
          'PROTESTADO', 'PAGO', 'ACORDO', 'RENEGOCIADO', 'DESISTENCIA', 
          'ANUENCIA', 'LIQUIDADO', 'CANCELADO', 'JUDICIAL'
        ]],
        msg: 'Status inválido'
      }
    }
  },
  situacao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_baixa_cartorio: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Data de baixa cartório inválida'
      }
    }
  }
}, {
  sequelize,
  modelName: 'Protesto',
  tableName: 'protestos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = Protesto;