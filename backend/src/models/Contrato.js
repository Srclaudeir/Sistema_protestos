// src/models/Contrato.js
const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Contrato extends Model {
  static associate(models) {
    // Contrato belongs to Cliente
    Contrato.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });

    // Contrato has many Protestos
    Contrato.hasMany(models.Protesto, {
      foreignKey: 'contrato_id',
      as: 'protestos'
    });
  }
}

Contrato.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_contrato_sisbr: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  numero_contrato_legado: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  especie: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: {
        args: [[
          'CARTÃO', 'VEICULO', 'PRONAMPE', 'BNDES', 'CAPITAL DE GIRO', 
          'CHEQUE ESPECIAL', 'ANTECIPAÇÃO', 'FINANCIAMENTO', 'PRONAMP',
          'REPACCAPITAL', 'CREDITO PESSOAL', 'REPACTUAÇÃO', 'CREDITO PESSOAL AUT',
          'CAPITAL DE GIRO AUT', 'FINANCIAMENTO DE BENS', 'ENERGIA SOLAR', 'IMÓVEL',
          'CARTÃO BNDES', 'REPAC CREDITO PESSOAL', 'BENS E SERVICOS', 'ROTATIVO',
          'CAPITAL DE GIRO FGO PRONAMPE', 'REPACTUAÇÃO DE CREDITO PESSOAL',
          'RENEGOCIAÇÃO DE DIVIDA', 'REPACTUAÇÃO CAPITAL DE GIRO',
          'CREDITO PESSOAL IMOV', 'CREDITO PESSOAL APROV', 'CRÉDITO AUTOMATICO',
          'CRÉDITO ROTATIVO', 'CRÉDITO PESSOAL AUTOMATICO', 'REPACTUAÇÃO CRÉDITO',
          'FINANCIAMENTO VIECULO', 'PROGNUM IMÓVEL', 'FINANCIAMENTO SOLAR',
          'CPRF RURAL', 'FCO', 'RENEGOCIAÇÃO', 'REPACTUAÇAO', 'CRÉDITO PESSOAL',
          'IMOVEL', 'CARTAO', 'FINANCIMENTO', 'BENS E SERVIÇO', 'CREDITO PESSOAL  AUT',
          'FINANCIMENTO BENS', 'REPACTUAÇÃO CREDITO PESSOAL', 'CREDITO ROTATIVO', 'CPRF'
        ]],
        msg: 'Espécie inválida'
      }
    }
  },
  ponto_atendimento: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Contrato',
  tableName: 'contratos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

module.exports = Contrato;