// src/models/User.js
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

class User extends Model {
  static associate(models) {
    // Define associations here if needed
  }

  /**
   * Check if password matches the hashed password
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Username é obrigatório",
        },
        len: {
          args: [3, 50],
          msg: "Username deve ter entre 3 e 50 caracteres",
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Email inválido",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: "Senha deve ter pelo menos 6 caracteres",
        },
      },
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Nome é obrigatório",
        },
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "operador", "supervisor"),
      defaultValue: "operador",
      validate: {
        isIn: {
          args: [["admin", "operador", "supervisor"]],
          msg: "Função inválida",
        },
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "usuarios",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

module.exports = User;
