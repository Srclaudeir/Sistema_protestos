// src/models/Contrato.js
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Contrato extends Model {
  static associate(models) {
    // Contrato belongs to Cliente
    Contrato.belongsTo(models.Cliente, {
      foreignKey: "cliente_id",
      as: "cliente",
    });

    // Contrato has many Protestos
    Contrato.hasMany(models.Protesto, {
      foreignKey: "contrato_id",
      as: "protestos",
    });
  }
}

Contrato.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_contrato_sisbr: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    numero_contrato_legado: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    especie: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ponto_atendimento: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Contrato",
    tableName: "contratos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  }
);

module.exports = Contrato;


