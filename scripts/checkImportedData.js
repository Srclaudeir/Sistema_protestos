// scripts/checkImportedData.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: './.env' });

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'protestos_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Tokocla123$$',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Define models
const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cpf_cnpj: {
    type: DataTypes.STRING(18),
    unique: true
  },
  tipo_conta: {
    type: DataTypes.ENUM('PF', 'PJ')
  },
  cidade: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

const Contrato = sequelize.define('Contrato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_contrato_sisbr: {
    type: DataTypes.STRING(50)
  },
  numero_contrato_legado: {
    type: DataTypes.STRING(50)
  },
  especie: {
    type: DataTypes.STRING(50)
  },
  ponto_atendimento: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'contratos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

const Protesto = sequelize.define('Protesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  valor_protestado: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  numero_parcela: {
    type: DataTypes.STRING(20)
  },
  data_registro: {
    type: DataTypes.DATEONLY
  },
  protocolo: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'PROTESTADO'
  },
  situacao: {
    type: DataTypes.TEXT
  },
  data_baixa_cartorio: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'protestos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

const Avalista = sequelize.define('Avalista', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255)
  },
  cpf_cnpj: {
    type: DataTypes.STRING(18)
  }
}, {
  tableName: 'avalistas',
  timestamps: false,
  underscored: true
});

// Define relationships
Cliente.hasMany(Contrato, {
  foreignKey: 'cliente_id',
  as: 'contratos'
});

Contrato.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

Contrato.hasMany(Protesto, {
  foreignKey: 'contrato_id',
  as: 'protestos'
});

Protesto.belongsTo(Contrato, {
  foreignKey: 'contrato_id',
  as: 'contrato'
});

Protesto.hasMany(Avalista, {
  foreignKey: 'protesto_id',
  as: 'avalistas'
});

Avalista.belongsTo(Protesto, {
  foreignKey: 'protesto_id',
  as: 'protesto'
});

// Check imported data function
const checkImportedData = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    // Get counts
    const clientesCount = await Cliente.count();
    const contratosCount = await Contrato.count();
    const protestosCount = await Protesto.count();
    const avalistasCount = await Avalista.count();

    console.log('\n=== IMPORTED DATA SUMMARY ===');
    console.log(`Clientes: ${clientesCount}`);
    console.log(`Contratos: ${contratosCount}`);
    console.log(`Protestos: ${protestosCount}`);
    console.log(`Avalistas: ${avalistasCount}`);

    // Get sample data
    console.log('\n=== SAMPLE CLIENTES ===');
    const sampleClientes = await Cliente.findAll({
      limit: 5,
      order: [['created_at', 'DESC']]
    });
    
    sampleClientes.forEach(cliente => {
      console.log(`- ${cliente.nome} (${cliente.cpf_cnpj}) - ${cliente.tipo_conta} - ${cliente.cidade}`);
    });

    console.log('\n=== SAMPLE CONTRATOS ===');
    const sampleContratos = await Contrato.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['nome']
      }]
    });
    
    sampleContratos.forEach(contrato => {
      console.log(`- ${contrato.numero_contrato_sisbr} (${contrato.cliente?.nome || 'N/A'}) - ${contrato.especie}`);
    });

    console.log('\n=== SAMPLE PROTESTOS ===');
    const sampleProtestos = await Protesto.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{
        model: Contrato,
        as: 'contrato',
        include: [{
          model: Cliente,
          as: 'cliente',
          attributes: ['nome']
        }]
      }]
    });
    
    sampleProtestos.forEach(protesto => {
      console.log(`- R$ ${protesto.valor_protestado} (${protesto.contrato?.cliente?.nome || 'N/A'}) - ${protesto.status}`);
    });

    console.log('\n=== SAMPLE AVALISTAS ===');
    const sampleAvalistas = await Avalista.findAll({
      limit: 5,
      order: [['id', 'DESC']],
      include: [{
        model: Protesto,
        as: 'protesto',
        include: [{
          model: Contrato,
          as: 'contrato',
          include: [{
            model: Cliente,
            as: 'cliente',
            attributes: ['nome']
          }]
        }]
      }]
    });
    
    sampleAvalistas.forEach(avalista => {
      console.log(`- ${avalista.nome} (${avalista.cpf_cnpj}) - Protesto de ${avalista.protesto?.contrato?.cliente?.nome || 'N/A'}`);
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run check if script is called directly
if (require.main === module) {
  checkImportedData();
}

module.exports = { checkImportedData };