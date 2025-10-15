// src/models/Especie.js
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Especie extends Model {
  static associate(models) {
    // Especie has many Contratos
    Especie.hasMany(models.Contrato, {
      foreignKey: "especie_id",
      as: "contratos",
    });
  }
}

Especie.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Especie",
    tableName: "especies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  }
);

module.exports = Especie;
